import type { JSX } from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { StatusPillProps } from '../../@types';

/** Small dot-and-label status: green when positive, grey otherwise. */
export function StatusPill({
  isPositive,
  label,
}: StatusPillProps): JSX.Element {
  return (
    <Badge
      variant="outline"
      className={cn(
        'gap-1.5 rounded-full font-medium',
        isPositive
          ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300'
          : 'border-border bg-muted text-muted-foreground',
      )}
    >
      <span
        aria-hidden
        className={cn(
          'size-1.5 rounded-full',
          isPositive ? 'bg-emerald-500' : 'bg-muted-foreground',
        )}
      />
      {label}
    </Badge>
  );
}
