import type { JSX } from 'react';
import { cn } from '@/lib/utils';
import type { UsageRingProps } from '../../@types';
import { USAGE_WARNING_RATIO } from '../../constants';
import { usageRatio } from '../../utils';

const SIZE = 112;
const STROKE = 10;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

/** Donut showing how much of the plan is used, with the percentage inside. */
export function UsageRing({ used, limit }: UsageRingProps): JSX.Element {
  const ratio = usageRatio(used, limit);
  const percent = Math.round(ratio * 100);
  const isRunningLow = ratio >= USAGE_WARNING_RATIO;

  return (
    <div className="relative size-28 shrink-0">
      {/* SVG attributes keep the arc data-driven without inline styles */}
      <svg
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        role="img"
        aria-label={`${percent}% of integrations used`}
        className="size-full -rotate-90"
      >
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          fill="none"
          strokeWidth={STROKE}
          className="stroke-primary/15"
        />
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          fill="none"
          strokeWidth={STROKE}
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={CIRCUMFERENCE * (1 - ratio)}
          className={cn(
            'transition-[stroke-dashoffset] duration-700 ease-out',
            isRunningLow ? 'stroke-amber-500' : 'stroke-primary',
          )}
        />
      </svg>
      <div
        aria-hidden
        className="absolute inset-0 flex flex-col items-center justify-center"
      >
        <span className="text-xl font-semibold text-foreground tabular-nums">
          {percent}%
        </span>
        <span className="text-xs text-muted-foreground">used</span>
      </div>
    </div>
  );
}
