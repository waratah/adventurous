import { computed, Injectable, OnDestroy, signal } from '@angular/core';
import { Auth, user } from '@angular/fire/auth';
import { Subscription } from 'rxjs';

export type SyncState = 'offline' | 'syncing' | 'online';

export interface SyncStatus {
  authenticated: boolean;
  icon: string;
  label: string;
  online: boolean;
  pendingWrites: number;
  state: SyncState;
}

interface PendingWrite {
  reject: (reason?: unknown) => void;
  resolve: (value: unknown) => void;
  running: boolean;
  write: () => Promise<unknown>;
}

@Injectable({
  providedIn: 'root',
})
export class SyncStatusService implements OnDestroy {
  private readonly authenticated = signal(false);
  private readonly online = signal(this.isOnline());
  private readonly pendingQueue: PendingWrite[] = [];
  private readonly pendingWrites = signal(0);
  private readonly userSubscription: Subscription;

  readonly status = computed<SyncStatus>(() => {
    const authenticated = this.authenticated();
    const online = this.online();
    const pendingWrites = this.pendingWrites();

    if (!online) {
      return {
        authenticated,
        icon: 'cloud_off',
        label: pendingWrites ? `${pendingWrites} waiting` : 'Offline',
        online,
        pendingWrites,
        state: 'offline',
      };
    }

    if (pendingWrites) {
      return {
        authenticated,
        icon: 'sync',
        label: `${pendingWrites} syncing`,
        online,
        pendingWrites,
        state: 'syncing',
      };
    }

    return {
      authenticated,
      icon: 'cloud_done',
      label: 'Synced',
      online,
      pendingWrites,
      state: 'online',
    };
  });

  constructor(private auth: Auth) {
    this.authenticated.set(!!this.auth.currentUser);
    this.userSubscription = user(this.auth).subscribe(currentUser => {
      this.authenticated.set(!!currentUser);
      this.flushQueue();
    });

    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => this.online.set(true));
      window.addEventListener('offline', () => this.online.set(false));
    }
  }

  ngOnDestroy(): void {
    this.userSubscription.unsubscribe();
  }

  trackWrite<T>(write: () => Promise<T>): Promise<T> {
    this.pendingWrites.update(count => count + 1);

    return new Promise<T>((resolve, reject) => {
      this.pendingQueue.push({
        reject,
        resolve: value => resolve(value as T),
        running: false,
        write,
      });
      this.flushQueue();
    });
  }

  private flushQueue(): void {
    if (!this.authenticated()) {
      return;
    }

    for (const pendingWrite of this.pendingQueue) {
      if (pendingWrite.running) {
        continue;
      }

      pendingWrite.running = true;
      pendingWrite.write()
        .then(result => this.completeWrite(pendingWrite, result))
        .catch(error => {
          pendingWrite.running = false;

          if (!this.authenticated() || this.shouldRetryAfterLogin(error)) {
            return;
          }

          this.failWrite(pendingWrite, error);
        });
    }
  }

  private completeWrite(pendingWrite: PendingWrite, result: unknown): void {
    this.removeWrite(pendingWrite);
    pendingWrite.resolve(result);
  }

  private failWrite(pendingWrite: PendingWrite, error: unknown): void {
    this.removeWrite(pendingWrite);
    pendingWrite.reject(error);
  }

  private removeWrite(pendingWrite: PendingWrite): void {
    const index = this.pendingQueue.indexOf(pendingWrite);
    if (index >= 0) {
      this.pendingQueue.splice(index, 1);
      this.pendingWrites.update(count => Math.max(0, count - 1));
    }
  }

  private shouldRetryAfterLogin(error: unknown): boolean {
    if (error && typeof error === 'object' && 'code' in error) {
      return error.code === 'permission-denied' || error.code === 'unauthenticated';
    }

    return false;
  }

  private isOnline(): boolean {
    if (typeof navigator === 'undefined') {
      return true;
    }

    return navigator.onLine;
  }
}
