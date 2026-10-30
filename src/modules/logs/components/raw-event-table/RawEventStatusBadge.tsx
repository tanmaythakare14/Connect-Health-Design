import type { JSX } from 'react';
import { cva } from 'class-variance-authority';
import {
  CircleAlert,
  CircleCheck,
  OctagonAlert,
  TriangleAlert,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { RawEventStatusBadgeProps } from '../../@types';
import { RAW_EVENT_STATUS_LABELS } from '../../constants';

// Severity climbs from green to amber to soft red to solid red, so a major
// failure stands out from across the table.
const statusBadgeVariants = cva('gap-1 rounded-full font-medium', {
  variants: {
    status: {
      success:
        'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300',
      warning:
        'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-300',
      serious_failure:
        'border-destructive/25 bg-destructive/10 text-destructive',
      major_failure:
        'border-transparent bg-destructive text-destructive-foreground',
    },
  },
});

const STATUS_ICONS = {
  success: CircleCheck,
  warning: TriangleAlert,
  serious_failure: CircleAlert,
  major_failure: OctagonAlert,
} as const;

export function RawEventStatusBadge({
  status,
}: RawEventStatusBadgeProps): JSX.Element {
  const Icon = STATUS_ICONS[status];

  return (
    <Badge variant="outline" className={statusBadgeVariants({ status })}>
      <Icon aria-hidden className="size-3" />
      {RAW_EVENT_STATUS_LABELS[status]}
    </Badge>
  );
}
