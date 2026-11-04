import type { JSX } from 'react';
import type { MappingProgressProps } from '../../@types';

/** "16 of 20 mapped" with a thin bar; green once everything is mapped. */
export function MappingProgress({
  mapped,
  total,
}: MappingProgressProps): JSX.Element {
  const percent = total === 0 ? 0 : Math.round((mapped / total) * 100);
  const isComplete = total > 0 && mapped === total;

  return (
    <div className="flex items-center gap-2.5">
      <div
        role="progressbar"
        aria-label="Fields mapped"
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={mapped}
        className="h-1.5 w-16 overflow-hidden rounded-full bg-muted"
      >
        <div
          className={
            isComplete
              ? 'h-full rounded-full bg-emerald-500 transition-[width] duration-300'
              : 'h-full rounded-full bg-primary transition-[width] duration-300'
          }
          style={{ width: `${percent}%` }}
        />
      </div>
      <p className="text-xs whitespace-nowrap text-muted-foreground">
        <span className="font-medium text-foreground tabular-nums">
          {mapped}
        </span>{' '}
        of {total} mapped
      </p>
    </div>
  );
}
