import type { JSX } from 'react';
import { cva } from 'class-variance-authority';
import { CircleCheck, LoaderCircle, TriangleAlert } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { RunStatusBadgeProps } from '../../@types';
import { RUN_STATUS, RUN_STATUS_LABELS } from '../../constants';

const runStatusBadgeVariants = cva('gap-1 rounded-full font-medium', {
  variants: {
    status: {
      success:
        'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300',
      running: 'border-primary/20 bg-accent text-accent-foreground',
      failed:
        'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-300',
    },
  },
});

const STATUS_ICONS = {
  success: CircleCheck,
  running: LoaderCircle,
  failed: TriangleAlert,
} as const;

export function RunStatusBadge({ status }: RunStatusBadgeProps): JSX.Element {
  const Icon = STATUS_ICONS[status];

  return (
    <Badge variant="outline" className={runStatusBadgeVariants({ status })}>
      <Icon
        aria-hidden
        className={cn(
          'size-3',
          status === RUN_STATUS.RUNNING && 'animate-spin',
        )}
      />
      {RUN_STATUS_LABELS[status]}
    </Badge>
  );
}
