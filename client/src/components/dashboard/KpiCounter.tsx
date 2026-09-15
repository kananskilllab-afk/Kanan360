import { useEffect, useState } from 'react';
import { animate } from 'framer-motion';

interface KpiCounterProps {
  value: number;
  suffix?: string;
  formatter?: (value: number) => string;
}

// Animates from its previous value to the next whenever `value` changes —
// used for every headline number on the dashboard so a refetch reads as a
// gentle count rather than a jarring replace.
export function KpiCounter({ value, suffix = '', formatter }: KpiCounterProps) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const controls = animate(display, value, {
      duration: 0.8,
      ease: 'easeOut',
      onUpdate: (latest) => setDisplay(latest),
    });
    return controls.stop;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const rounded = Math.round(display);
  return (
    <span className="tabular-nums">
      {formatter ? formatter(rounded) : rounded.toLocaleString('en-IN')}
      {suffix}
    </span>
  );
}
