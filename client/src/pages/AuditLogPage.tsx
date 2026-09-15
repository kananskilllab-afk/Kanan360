import { useQuery } from '@tanstack/react-query';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { listAuditLogs } from '@/services/adminService';

export function AuditLogPage() {
  const { data: logs, isLoading } = useQuery({ queryKey: ['admin', 'audit-logs'], queryFn: listAuditLogs });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading text-xl font-semibold">Audit Log</h2>
        <p className="text-sm text-muted-foreground">Every administrative action taken on this system.</p>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>When</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Entity</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading &&
              Array.from({ length: 6 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={3}>
                    <Skeleton className="h-6 w-full" />
                  </TableCell>
                </TableRow>
              ))}
            {!isLoading && logs?.length === 0 && (
              <TableRow>
                <TableCell colSpan={3} className="py-10 text-center text-sm text-muted-foreground">
                  No administrative actions recorded yet.
                </TableCell>
              </TableRow>
            )}
            {logs?.map((log) => (
              <TableRow key={log._id}>
                <TableCell className="whitespace-nowrap font-mono text-xs text-muted-foreground">
                  {new Date(log.timestamp).toLocaleString('en-IN')}
                </TableCell>
                <TableCell>
                  <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-[11px]">{log.action}</span>
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {log.entityType} · {log.entityId}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
