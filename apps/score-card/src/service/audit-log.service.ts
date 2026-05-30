import { Injectable } from '@angular/core';
import { addDoc, collection, CollectionReference, DocumentData, Firestore } from '@angular/fire/firestore';
import { AuditLog } from '../definitions';
import { SyncStatusService } from './sync-status.service';

@Injectable({
  providedIn: 'root',
})
export class AuditLogService {
  private logCollection: CollectionReference<AuditLog, DocumentData>;

  constructor(private store: Firestore, private syncStatus: SyncStatusService) {
    this.logCollection = collection(this.store, 'auditLogs') as CollectionReference<AuditLog, DocumentData>;
  }

  record(log: Omit<AuditLog, 'createdAt'>): void {
    const write = addDoc(this.logCollection, this.removeUndefined({
      ...log,
      createdAt: new Date(),
    }) as AuditLog);

    this.syncStatus.trackWrite(write).catch(error => console.error('Unable to write audit log', error));
  }

  private removeUndefined(value: unknown): unknown {
    if (Array.isArray(value)) {
      return value.map(item => this.removeUndefined(item));
    }

    if (value && typeof value === 'object' && !(value instanceof Date)) {
      return Object.fromEntries(
        Object.entries(value)
          .filter(([, entry]) => entry !== undefined)
          .map(([key, entry]) => [key, this.removeUndefined(entry)])
      );
    }

    return value;
  }
}
