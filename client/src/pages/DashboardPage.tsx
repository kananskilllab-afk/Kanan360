import { useQuery } from '@tanstack/react-query';
import { Building2, Layers, DoorOpen, Armchair, CheckCircle2, Ruler, Gauge } from 'lucide-react';
import { KpiCard } from '@/components/dashboard/KpiCard';
import { BranchCard } from '@/components/dashboard/BranchCard';
import { Skeleton } from '@/components/ui/skeleton';
import { getOverview } from '@/services/analyticsService';
import { listBranches } from '@/services/branchService';

export function DashboardPage() {
  const overview = useQuery({ queryKey: ['analytics', 'overview'], queryFn: getOverview });
  const branches = useQuery({ queryKey: ['branches'], queryFn: listBranches });

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-heading text-xl font-semibold">Portfolio overview</h2>
        <p className="text-sm text-muted-foreground">Live figures across all active branches.</p>
      </div>

      <section className="space-y-3">
        <SectionLabel>Portfolio</SectionLabel>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <KpiCard icon={Building2} label="Total Branches" value={overview.data?.totalBranches ?? 0} />
          <KpiCard icon={Layers} label="Total Floors" value={overview.data?.totalFloors ?? 0} />
          <KpiCard icon={DoorOpen} label="Total Areas" value={overview.data?.totalAreas ?? 0} />
          <KpiCard icon={Armchair} label="Total Seats" value={overview.data?.totalSeats ?? 0} />
        </div>
      </section>

      <section className="space-y-3">
        <SectionLabel>Occupancy</SectionLabel>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <KpiCard icon={CheckCircle2} label="Occupied Seats" value={overview.data?.occupiedSeats ?? 0} tone="occupied" />
          <KpiCard icon={Armchair} label="Available Seats" value={overview.data?.availableSeats ?? 0} tone="available" />
          <KpiCard icon={Gauge} label="Overall Utilization" value={overview.data?.overallUtilization ?? 0} suffix="%" />
        </div>
      </section>

      <section className="space-y-3">
        <SectionLabel>Space</SectionLabel>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <KpiCard icon={Ruler} label="Total Office Area (sq. ft.)" value={overview.data?.totalOfficeAreaSqFt ?? 0} />
          <KpiCard icon={Ruler} label="Used Area (sq. ft.)" value={overview.data?.usedAreaSqFt ?? 0} tone="occupied" />
          <KpiCard icon={Ruler} label="Available Area (sq. ft.)" value={overview.data?.availableAreaSqFt ?? 0} tone="available" />
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-baseline justify-between">
          <SectionLabel>Branches</SectionLabel>
          <span className="text-xs text-muted-foreground">{branches.data?.length ?? 0} active</span>
        </div>
        {branches.isLoading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-56 rounded-lg" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {branches.data?.map((branch) => (
              <BranchCard key={branch._id} branch={branch} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="font-mono text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
      {children}
    </h3>
  );
}
