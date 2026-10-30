import type { JSX } from 'react';
import { cva } from 'class-variance-authority';
import { Badge } from '@/components/ui/badge';
import type { ConnectionStatusBadgeProps } from '../../@types';
import { CONNECTION_STATUS_LABELS } from '../../constants';

// Active is live (green), inactive uses the danger (destructive) tokens per
// client feedback, draft isn't set up yet (blue, as in the original console).
const statusBadgeVariants = cva('gap-1.5 rounded-full font-medium', {
  variants: {
    status: {
      active:
        'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300',
      inactive: 'border-destructive/25 bg-destructive/10 text-destructive',
      draft:
        'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900/60 dark:bg-blue-950/40 dark:text-blue-300',
    },
  },
});

const statusDotVariants = cva('size-1.5 rounded-full', {
  variants: {
    status: {
      active: 'bg-emerald-500',
      inactive: 'bg-destructive',
      draft: 'bg-blue-500',
    },
  },
});

export function ConnectionStatusBadge({
  status,
}: ConnectionStatusBadgeProps): JSX.Element {
  return (
    <Badge variant="outline" className={statusBadgeVariants({ status })}>
      <span aria-hidden className={statusDotVariants({ status })} />
      {CONNECTION_STATUS_LABELS[status]}
    </Badge>
  );
}
