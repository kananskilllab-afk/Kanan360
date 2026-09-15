import type { AuditAction } from '@kanan-baroda/shared';
import { AuditLog } from '../models/index.js';

interface WriteAuditInput {
  userId: string;
  action: AuditAction;
  entityType: string;
  entityId: string;
  before?: unknown;
  after?: unknown;
  ipAddress?: string;
}

// The only place an AuditLog row gets written — called from services after
// a mutation actually succeeds, never from a controller directly, so no
// admin action can bypass the trail (ARCH-SPEC "Audit Log").
export async function writeAudit(input: WriteAuditInput): Promise<void> {
  await AuditLog.create({ ...input, timestamp: new Date() });
}
