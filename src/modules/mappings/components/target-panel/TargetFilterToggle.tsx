import type { JSX } from 'react';
import { cn } from '@/lib/utils';
import type { TargetFilter, TargetFilterToggleProps } from '../../@types';
import { TARGET_FILTER } from '../../constants';

const SEGMENT_CLASS_NAME =
  'flex h-7 items-center gap-1.5 rounded-md px-2.5 text-xs font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring/50';

/** All fields, or only the ones still waiting for a source. */
export function TargetFilterToggle({
  value,
  onChange,
  neededCount,
}: TargetFilterToggleProps): JSX.Element {
  const segment = (filter: TargetFilter, label: string): JSX.Element => {
    const isActive = value === filter;
    return (
      <button
        type="button"
        aria-pressed={isActive}
        onClick={() => onChange(filter)}
        className={cn(
          SEGMENT_CLASS_NAME,
          isActive
            ? 'bg-background text-foreground shadow-xs'
            : 'text-muted-foreground hover:text-foreground',
        )}
      >
        {label}
        {filter === TARGET_FILTER.NEEDED && (
          <span
            className={cn(
              'min-w-4 rounded-full px-1 text-center text-[10px] leading-4 font-semibold tabular-nums',
              neededCount > 0
                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300'
                : 'bg-muted-foreground/15 text-muted-foreground',
            )}
          >
            {neededCount}
          </span>
        )}
      </button>
    );
  };

  return (
    <div
      role="group"
      aria-label="Show fields"
      className="flex shrink-0 items-center gap-0.5 rounded-lg bg-muted p-0.5"
    >
      {segment(TARGET_FILTER.ALL, 'All')}
      {segment(TARGET_FILTER.NEEDED, 'Needed')}
    </div>
  );
}
