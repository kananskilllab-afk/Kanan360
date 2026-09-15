import { useQuery } from '@tanstack/react-query';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { getArea } from '@/services/areaService';

// The right-side panel opened by clicking an area — in a 2D card grid
// today, and by a raycast hit in the Phase 3/4 floor-plan renderer
// tomorrow. Both will call this same component with the same areaId, so
// the experience never diverges between the two (ARCH-SPEC IDX·03).
export function AreaInfoPanel({
  areaId,
  branchName,
  floorName,
  open,
  onOpenChange,
}: {
  areaId: string | null;
  branchName?: string;
  floorName?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { data, isLoading } = useQuery({
    queryKey: ['area', areaId],
    queryFn: () => getArea(areaId as string),
    enabled: open && !!areaId,
  });

  const area = data?.area;
  const employees = data?.employees ?? [];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full gap-0 overflow-y-auto sm:max-w-md">
        {isLoading || !area ? (
          <div className="space-y-4 p-6">
            <Skeleton className="h-6 w-2/3" />
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-24 w-full" />
          </div>
        ) : (
          <>
            <SheetHeader>
              <SheetTitle className="font-heading text-lg">{area.name}</SheetTitle>
              <SheetDescription className="font-mono text-xs">{area.areaCode}</SheetDescription>
            </SheetHeader>

            <div className="space-y-6 px-6 pb-6">
              <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                <Field label="Area Type" value={area.type.replace('_', ' ')} />
                <Field label="Floor" value={floorName ?? '—'} />
                <Field label="Branch" value={branchName ?? '—'} />
                <Field label="Total Area" value={`${area.areaSqFt.toLocaleString('en-IN')} sq. ft.`} />
                <Field label="Seating Capacity" value={String(area.seatingCapacity)} />
                <Field label="Occupied" value={String(area.occupiedSeats)} />
                <Field label="Available" value={String(area.availableSeats)} />
                <Field label="Utilization" value={`${area.utilization}%`} />
              </dl>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Occupancy</span>
                  <span className="font-mono">{area.utilization}%</span>
                </div>
                <Progress value={area.utilization} className="h-1.5" />
              </div>

              <div>
                <h4 className="mb-2 font-mono text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Assigned Employees ({employees.length})
                </h4>
                {employees.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No employees are currently assigned here.</p>
                ) : (
                  <ul className="space-y-2">
                    {employees.map((emp) => (
                      <li key={emp._id} className="flex items-center gap-3 rounded-md border p-2">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-[11px]">
                            {emp.name.split(' ').map((p) => p[0]).slice(0, 2).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-sm font-medium">{emp.name}</div>
                          <div className="truncate text-xs text-muted-foreground">{emp.designation}</div>
                        </div>
                        <span className="font-mono text-[10px] text-muted-foreground">{emp.employeeId}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="font-medium">{value}</dd>
    </div>
  );
}
