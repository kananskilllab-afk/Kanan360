import { useNavigate } from 'react-router-dom';
import { Building2, Layers, DoorOpen, Armchair, MapPin } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import type { BranchWithStats } from '@/services/branchService';

function utilizationTone(pct: number): string {
  if (pct >= 90) return 'text-status-occupied';
  if (pct >= 60) return 'text-status-reserved';
  return 'text-status-available';
}

export function BranchCard({ branch }: { branch: BranchWithStats }) {
  const navigate = useNavigate();

  return (
    <Card
      role="link"
      tabIndex={0}
      onClick={() => navigate(`/admin/branches/${branch._id}`)}
      onKeyDown={(e) => e.key === 'Enter' && navigate(`/admin/branches/${branch._id}`)}
      className="group cursor-pointer gap-4 p-5 transition-all hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="truncate font-heading text-base font-semibold">{branch.name}</h3>
            <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 font-mono text-[10px] text-muted-foreground">
              {branch.code}
            </span>
          </div>
          <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="h-3 w-3" />
            {branch.location}
          </p>
        </div>
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
          <Building2 className="h-4.5 w-4.5" />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 text-center">
        <Stat icon={Layers} label="Floors" value={branch.totalFloors} />
        <Stat icon={DoorOpen} label="Areas" value={branch.totalAreas} />
        <Stat icon={Armchair} label="Seats" value={branch.totalSeats} />
      </div>

      <div className="space-y-1.5">
        <div className="flex items-baseline justify-between text-xs">
          <span className="text-muted-foreground">
            {branch.occupiedSeats} occupied · {branch.availableSeats} available
          </span>
          <span className={`font-mono font-semibold ${utilizationTone(branch.utilization)}`}>
            {branch.utilization}%
          </span>
        </div>
        <Progress value={branch.utilization} className="h-1.5" />
      </div>

      <div className="border-t pt-3 text-xs text-muted-foreground">
        {branch.totalAreaSqFt.toLocaleString('en-IN')} sq. ft. total
      </div>
    </Card>
  );
}

function Stat({ icon: Icon, label, value }: { icon: typeof Layers; label: string; value: number }) {
  return (
    <div className="rounded-md bg-muted/50 py-2">
      <Icon className="mx-auto mb-1 h-3.5 w-3.5 text-muted-foreground" />
      <div className="font-mono text-sm font-semibold tabular-nums">{value}</div>
      <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</div>
    </div>
  );
}
