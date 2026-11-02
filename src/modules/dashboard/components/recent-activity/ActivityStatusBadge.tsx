import type { JSX } from 'react';
import { cva } from 'class-variance-authority';
import { CircleCheck, CircleX } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { ActivityStatusBadgeProps } from '../../@types';
import { ACTIVITY_STATUS_LABELS } from '../../constants';

const statusBadgeVariants = cva('gap-1 rounded-full font-medium', {
  variants: {
    status: {
      success:
        'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300',
      failed: 'border-destructive/25 bg-destructive/10 text-destructive',
    },
  },
});

const STATUS_ICONS = {
  success: CircleCheck,
  failed: CircleX,
} as const;

export function ActivityStatusBadge({
  status,
}: ActivityStatusBadgeProps): JSX.Element {
  const Icon = STATUS_ICONS[status];

  return (
    <Badge variant="outline" className={statusBadgeVariants({ status })}>
      <Icon aria-hidden className="size-3" />
      {ACTIVITY_STATUS_LABELS[status]}
    </Badge>
  );
}
