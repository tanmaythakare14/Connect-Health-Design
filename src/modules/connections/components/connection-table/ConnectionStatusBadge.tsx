import type { JSX } from 'react';
import { cva } from 'class-variance-authority';
import { Badge } from '@/components/ui/badge';
import type { ConnectionStatusBadgeProps } from '../../@types';
import { CONNECTION_STATUS_LABELS } from '../../constants';

// Draft is a neutral, not-yet-live state — kept quiet so future failure states stand out.
const statusBadgeVariants = cva('gap-1.5 rounded-full font-medium', {
  variants: {
    status: {
      draft: 'border-border bg-muted text-muted-foreground',
    },
  },
});

const statusDotVariants = cva('size-1.5 rounded-full', {
  variants: {
    status: {
      draft: 'bg-muted-foreground/70',
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
