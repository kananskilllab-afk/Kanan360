import { DoorOpen } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import type { AreaWithOccupancy } from '@/services/areaService';

const TYPE_LABELS: Record<string, string> = {
  CABIN: 'Cabin',
  OPEN_WORKSPACE: 'Open Workspace',
  MEETING_ROOM: 'Meeting Room',
  RECEPTION: 'Reception',
  DEPARTMENT_ZONE: 'Department Zone',
  UTILITY: 'Utility',
  CAFETERIA: 'Cafeteria',
  OTHER: 'Other',
};

export function AreaCard({ area, onClick }: { area: AreaWithOccupancy; onClick: () => void }) {
  const isBookable = area.seatingCapacity > 0;
  return (
    <Card
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}
      className="cursor-pointer gap-3 p-4 transition-all hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <DoorOpen className="h-4 w-4 shrink-0 text-muted-foreground" />
          <span className="truncate text-sm font-medium">{area.name}</span>
        </div>
        <Badge variant="secondary" className="shrink-0 text-[10px]">
          {TYPE_LABELS[area.type] ?? area.type}
        </Badge>
      </div>

      <div className="font-mono text-[11px] text-muted-foreground">{area.areaCode}</div>

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{area.areaSqFt.toLocaleString('en-IN')} sq. ft.</span>
        {isBookable && (
          <span>
            {area.occupiedSeats}/{area.seatingCapacity} seats
          </span>
        )}
      </div>

      {isBookable && <Progress value={area.utilization} className="h-1" />}
    </Card>
  );
}
