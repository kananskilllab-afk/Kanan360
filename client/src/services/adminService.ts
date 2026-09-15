import type { AuditLogEntry, Role } from '@kanan-baroda/shared';
import { apiClient } from '@/lib/apiClient';

export interface AuditLogRow extends Omit<AuditLogEntry, 'userId'> {
  userId: { _id: string; name: string; email: string; role: Role } | string;
}

export async function listAuditLogs(): Promise<AuditLogRow[]> {
  const { data } = await apiClient.get<{ logs: AuditLogRow[] }>('/admin/audit-logs');
  return data.logs;
}
