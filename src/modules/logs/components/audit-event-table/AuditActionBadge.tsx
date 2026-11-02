import type { JSX } from 'react';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import type { AuditActionBadgeProps } from '../../@types';
import { AUDIT_ACTION_LABELS } from '../../constants';

/** One-letter CRUD chip; the tooltip spells it out. */
export function AuditActionBadge({
  action,
}: AuditActionBadgeProps): JSX.Element {
  const label = AUDIT_ACTION_LABELS[action];

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Badge
          variant="outline"
          aria-label={label}
          className="relative z-10 size-6 justify-center rounded-md border-border bg-background p-0 font-mono text-xs font-semibold text-foreground"
        >
          {action}
        </Badge>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}
