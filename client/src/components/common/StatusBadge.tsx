import type { SeatStatus } from '@kanan-baroda/shared';
import { STATUS_CONFIG } from '@kanan-baroda/shared';
import { cn } from '@/lib/utils';

// The one place a seat/area status becomes a color + label in the UI —
// every other component renders a status via this badge instead of
// re-deriving its own color (ARCH-SPEC DAT·02).
export function StatusBadge({ status, className }: { status: SeatStatus; className?: string }) {
  const config = STATUS_CONFIG[status];
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 font-mono text-[11px] font-medium',
        className,
      )}
      style={{ borderColor: `var(${config.colorVar})`, color: `var(${config.colorVar})` }}
    >
      <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: `var(${config.colorVar})` }} />
      {config.label}
    </span>
  );
}
