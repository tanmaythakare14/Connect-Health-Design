import type { JSX } from 'react';
import { cva } from 'class-variance-authority';
import { Badge } from '@/components/ui/badge';
import type { ConnectionTypeBadgeProps } from '../../@types';
import { CONNECTION_TYPE_LABELS } from '../../constants';

// Category tags: one calm tint per type so types are scannable, never louder than status.
const typeBadgeVariants = cva('font-medium', {
  variants: {
    type: {
      standalone:
        'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900/60 dark:bg-blue-950/40 dark:text-blue-300',
      embed:
        'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300',
      opendental:
        'border-lime-200 bg-lime-50 text-lime-700 dark:border-lime-900/60 dark:bg-lime-950/40 dark:text-lime-300',
      unity:
        'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-300',
      backend:
        'border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-800/40 dark:text-slate-300',
    },
  },
});

export function ConnectionTypeBadge({
  type,
}: ConnectionTypeBadgeProps): JSX.Element {
  return (
    <Badge variant="outline" className={typeBadgeVariants({ type })}>
      {CONNECTION_TYPE_LABELS[type]}
    </Badge>
  );
}
