import { computed, Injectable, signal } from '@angular/core';

export type SyncState = 'offline' | 'syncing' | 'online';

export interface SyncStatus {
  icon: string;
  label: string;
  online: boolean;
  pendingWrites: number;
  state: SyncState;
}

@Injectable({
  providedIn: 'root',
})
export class SyncStatusService {
  private readonly online = signal(this.isOnline());
  private readonly pendingWrites = signal(0);

  readonly status = computed<SyncStatus>(() => {
    const online = this.online();
    const pendingWrites = this.pendingWrites();

    if (!online) {
      return {
        icon: 'cloud_off',
        label: pendingWrites ? `${pendingWrites} waiting` : 'Offline',
        online,
        pendingWrites,
        state: 'offline',
      };
    }

    if (pendingWrites) {
      return {
        icon: 'sync',
        label: `${pendingWrites} syncing`,
        online,
        pendingWrites,
        state: 'syncing',
      };
    }

    return {
      icon: 'cloud_done',
      label: 'Synced',
      online,
      pendingWrites,
      state: 'online',
    };
  });

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => this.online.set(true));
      window.addEventListener('offline', () => this.online.set(false));
    }
  }

  trackWrite<T>(write: Promise<T>): Promise<T> {
    this.pendingWrites.update(count => count + 1);

    return write.finally(() => {
      this.pendingWrites.update(count => Math.max(0, count - 1));
    });
  }

  private isOnline(): boolean {
    if (typeof navigator === 'undefined') {
      return true;
    }

    return navigator.onLine;
  }
}
