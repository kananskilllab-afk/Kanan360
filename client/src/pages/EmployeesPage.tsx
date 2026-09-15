import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { listEmployees } from '@/services/employeeService';

export function EmployeesPage() {
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebouncedValue(query, 300);
  const highlightId = searchParams.get('highlight');

  const { data: employees, isLoading } = useQuery({
    queryKey: ['employees', debouncedQuery],
    queryFn: () => listEmployees({ q: debouncedQuery || undefined }),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="font-heading text-xl font-semibold">Employees</h2>
          <p className="text-sm text-muted-foreground">{employees?.length ?? 0} shown · directory &amp; seating</p>
        </div>
        <div className="relative w-full max-w-xs">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search name, ID, department…"
            className="pl-8"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Employee</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Designation</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Employee ID</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading &&
              Array.from({ length: 6 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={5}>
                    <Skeleton className="h-8 w-full" />
                  </TableCell>
                </TableRow>
              ))}

            {!isLoading && employees?.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="py-10 text-center text-sm text-muted-foreground">
                  No employees match "{debouncedQuery}".
                </TableCell>
              </TableRow>
            )}

            {employees?.map((emp) => (
              <TableRow key={emp._id} className={emp._id === highlightId ? 'bg-accent/40' : undefined}>
                <TableCell>
                  <div className="flex items-center gap-2.5">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-[11px]">
                        {emp.name.split(' ').map((p) => p[0]).slice(0, 2).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium">{emp.name}</div>
                      <div className="truncate text-xs text-muted-foreground">{emp.email}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-sm">
                  {typeof emp.department === 'string' ? emp.department : emp.department?.name}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">{emp.designation}</TableCell>
                <TableCell>
                  <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">
                    {emp.status.replace('_', ' ')}
                  </span>
                </TableCell>
                <TableCell className="text-right font-mono text-xs text-muted-foreground">
                  {emp.employeeId}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
