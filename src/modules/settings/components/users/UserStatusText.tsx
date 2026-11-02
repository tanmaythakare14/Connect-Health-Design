import type { JSX } from 'react';
import { cn } from '@/lib/utils';
import type { UserStatusTextProps } from '../../@types';

/** Plain dot-and-text status for table cells — lighter than a badge. */
export function UserStatusText({
  tone,
  label,
}: UserStatusTextProps): JSX.Element {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 text-sm font-medium',
        tone === 'positive' && 'text-emerald-700 dark:text-emerald-400',
        tone === 'warning' && 'text-amber-700 dark:text-amber-400',
        tone === 'neutral' && 'text-muted-foreground',
      )}
    >
      <span
        aria-hidden
        className={cn(
          'size-1.5 shrink-0 rounded-full',
          tone === 'positive' && 'bg-emerald-500',
          tone === 'warning' && 'bg-amber-500',
          tone === 'neutral' && 'bg-muted-foreground/60',
        )}
      />
      {label}
    </span>
  );
}
