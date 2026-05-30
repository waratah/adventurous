export interface AuditLog {
  action: string;
  actorId?: string;
  after?: unknown;
  before?: unknown;
  collectionName: string;
  createdAt: Date;
  documentId: string;
  itemId?: string;
  targetUserId?: string;
}
