import type { LucideIcon } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { KpiCounter } from '@/components/dashboard/KpiCounter';
import { cn } from '@/lib/utils';

interface KpiCardProps {
  icon: LucideIcon;
  label: string;
  value: number;
  suffix?: string;
  tone?: 'default' | 'available' | 'occupied';
}

const TONE_CLASSES: Record<NonNullable<KpiCardProps['tone']>, string> = {
  default: 'bg-primary/10 text-primary',
  available: 'bg-status-available/10 text-status-available',
  occupied: 'bg-status-occupied/10 text-status-occupied',
};

export function KpiCard({ icon: Icon, label, value, suffix, tone = 'default' }: KpiCardProps) {
  return (
    <Card className="flex-row items-center gap-3.5 p-4">
      <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-lg', TONE_CLASSES[tone])}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <div className="font-mono text-xl font-semibold leading-none">
          <KpiCounter value={value} suffix={suffix} />
        </div>
        <div className="mt-1 truncate text-xs text-muted-foreground">{label}</div>
      </div>
    </Card>
  );
}
