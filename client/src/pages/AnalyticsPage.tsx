import { useQuery } from '@tanstack/react-query';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { STATUS_CONFIG } from '@kanan-baroda/shared';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { getBranchAnalytics, getOverview, getUtilization } from '@/services/analyticsService';

const DEPT_COLORS = [
  'var(--dept-1)',
  'var(--dept-2)',
  'var(--dept-3)',
  'var(--dept-4)',
  'var(--dept-5)',
  'var(--dept-6)',
  'var(--dept-7)',
];

export function AnalyticsPage() {
  const overview = useQuery({ queryKey: ['analytics', 'overview'], queryFn: getOverview });
  const branchAnalytics = useQuery({ queryKey: ['analytics', 'branches'], queryFn: getBranchAnalytics });
  const utilization = useQuery({ queryKey: ['analytics', 'utilization'], queryFn: () => getUtilization({}) });

  const seatStatusData = overview.data
    ? (Object.keys(overview.data.seatsByStatus) as Array<keyof typeof overview.data.seatsByStatus>).map((key) => ({
        name: STATUS_CONFIG[key].label,
        value: overview.data!.seatsByStatus[key],
        colorVar: STATUS_CONFIG[key].colorVar,
      }))
    : [];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading text-xl font-semibold">Analytics</h2>
        <p className="text-sm text-muted-foreground">Utilization across branches, seats, and departments.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="p-5">
          <h3 className="font-heading text-sm font-semibold">Branch-wise seating utilization</h3>
          <p className="mb-4 text-xs text-muted-foreground">Occupied seats as a % of total seats, per branch.</p>
          {branchAnalytics.isLoading ? (
            <Skeleton className="h-64 w-full" />
          ) : (
            <ResponsiveContainer width="100%" height={260} debounce={100}>
              <BarChart data={branchAnalytics.data} margin={{ left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="code" tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} unit="%" />
                <Tooltip
                  contentStyle={{ background: 'var(--popover)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }}
                  formatter={(value) => [`${value}%`, 'Utilization']}
                />
                <Bar dataKey="utilization" fill="var(--primary)" radius={[4, 4, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>

        <Card className="p-5">
          <h3 className="font-heading text-sm font-semibold">Seats by status</h3>
          <p className="mb-4 text-xs text-muted-foreground">All seats across every active branch.</p>
          {overview.isLoading ? (
            <Skeleton className="h-64 w-full" />
          ) : (
            <ResponsiveContainer width="100%" height={260} debounce={100}>
              <PieChart>
                <Pie data={seatStatusData} dataKey="value" nameKey="name" innerRadius="55%" outerRadius="80%" paddingAngle={2}>
                  {seatStatusData.map((entry) => (
                    <Cell key={entry.name} fill={`var(${entry.colorVar})`} stroke="var(--card)" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: 'var(--popover)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  formatter={(value) => <span className="text-xs text-muted-foreground">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </Card>

        <Card className="p-5 lg:col-span-2">
          <h3 className="font-heading text-sm font-semibold">Department-wise area utilization</h3>
          <p className="mb-4 text-xs text-muted-foreground">Proportional sq. ft. in use, by department, across all branches.</p>
          {utilization.isLoading ? (
            <Skeleton className="h-64 w-full" />
          ) : (
            <ResponsiveContainer width="100%" height={260} debounce={100}>
              <BarChart data={utilization.data?.departments} layout="vertical" margin={{ left: 24 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                <XAxis type="number" unit="%" tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={160}
                  tick={{ fontSize: 12, fill: 'var(--foreground)' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{ background: 'var(--popover)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }}
                  formatter={(value) => [`${value}%`, 'Utilization']}
                />
                <Bar dataKey="utilization" radius={[0, 4, 4, 0]} maxBarSize={22}>
                  {utilization.data?.departments.map((_, i) => (
                    <Cell key={i} fill={DEPT_COLORS[i % DEPT_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>
      </div>
    </div>
  );
}
