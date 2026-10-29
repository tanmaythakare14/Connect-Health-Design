import type { JSX } from 'react';
import { cva } from 'class-variance-authority';
import { Badge } from '@/components/ui/badge';
import type { WorkflowStatusBadgeProps } from '../../@types';
import { WORKFLOW_STATUS_LABELS } from '../../constants';

// Inactive means paused on purpose, not failed — so it stays neutral, not red.
const statusBadgeVariants = cva('shrink-0 gap-1.5 rounded-full font-medium', {
  variants: {
    status: {
      active:
        'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300',
      inactive: 'border-border bg-muted text-muted-foreground',
    },
  },
});

const statusDotVariants = cva('size-1.5 rounded-full', {
  variants: {
    status: {
      active: 'bg-emerald-500',
      inactive: 'bg-muted-foreground/70',
    },
  },
});

export function WorkflowStatusBadge({
  status,
}: WorkflowStatusBadgeProps): JSX.Element {
  return (
    <Badge variant="outline" className={statusBadgeVariants({ status })}>
      <span aria-hidden className={statusDotVariants({ status })} />
      {WORKFLOW_STATUS_LABELS[status]}
    </Badge>
  );
}
