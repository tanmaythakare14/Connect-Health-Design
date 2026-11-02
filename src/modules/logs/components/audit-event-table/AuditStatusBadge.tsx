import type { JSX } from 'react';
import { cva } from 'class-variance-authority';
import { Ban, CircleCheck, CircleX } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { AuditStatusBadgeProps } from '../../@types';
import { AUDIT_STATUS_LABELS } from '../../constants';

const statusBadgeVariants = cva('gap-1 rounded-full font-medium', {
  variants: {
    status: {
      success:
        'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300',
      failed: 'border-destructive/25 bg-destructive/10 text-destructive',
      denied:
        'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-300',
    },
  },
});

const STATUS_ICONS = {
  success: CircleCheck,
  failed: CircleX,
  denied: Ban,
} as const;

export function AuditStatusBadge({
  status,
}: AuditStatusBadgeProps): JSX.Element {
  const Icon = STATUS_ICONS[status];

  return (
    <Badge variant="outline" className={statusBadgeVariants({ status })}>
      <Icon aria-hidden className="size-3" />
      {AUDIT_STATUS_LABELS[status]}
    </Badge>
  );
}
