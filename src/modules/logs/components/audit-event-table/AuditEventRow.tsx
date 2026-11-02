import type { JSX } from 'react';
import { Bot, ChevronRight, User } from 'lucide-react';
import { TableCell, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import type { AuditEventRowProps } from '../../@types';
import { AUDIT_ACTOR_TYPE } from '../../constants';
import {
  formatEventDateTime,
  formatEventFullTimestamp,
  formatEventYear,
} from '../../utils';
import { AuditActionBadge } from './AuditActionBadge';
import { AuditConnectionCell } from './AuditConnectionCell';
import { AuditStatusBadge } from './AuditStatusBadge';
import { AUDIT_EVENT_CELL_CLASS_NAME } from './columns';

export function AuditEventRow({
  event,
  isExpanded,
  detailId,
  onToggleExpanded,
}: AuditEventRowProps): JSX.Element {
  const ActorIcon = event.actorType === AUDIT_ACTOR_TYPE.SERVICE ? Bot : User;

  return (
    // `relative` anchors the chevron's stretched click target to this row.
    <TableRow
      className={cn(
        'group relative hover:bg-muted/40',
        isExpanded &&
          'border-b-0 border-l-2 border-l-primary bg-muted/70 hover:bg-muted/70',
      )}
    >
      <TableCell className={cn(AUDIT_EVENT_CELL_CLASS_NAME, 'pr-0')}>
        {/* The ::after overlay stretches this button over the whole row, so
            the row toggles with one click target and a single tab stop. */}
        <button
          type="button"
          onClick={() => onToggleExpanded(event)}
          aria-expanded={isExpanded}
          aria-controls={isExpanded ? detailId : undefined}
          aria-label={`${isExpanded ? 'Hide' : 'Show'} details for ${event.display}`}
          className="inline-flex size-7 items-center justify-center rounded-md text-muted-foreground outline-none transition-colors group-hover:text-foreground after:absolute after:inset-0 after:content-[''] focus-visible:ring-[3px] focus-visible:ring-ring/50"
        >
          <ChevronRight
            aria-hidden
            className={cn(
              'size-4 transition-transform duration-200',
              isExpanded && 'rotate-90 text-primary',
            )}
          />
        </button>
      </TableCell>
      <TableCell className={AUDIT_EVENT_CELL_CLASS_NAME}>
        <time
          dateTime={event.occurredAt}
          title={formatEventFullTimestamp(event.occurredAt)}
          className="block"
        >
          <span className="block text-sm text-foreground tabular-nums">
            {formatEventDateTime(event.occurredAt)}
          </span>
          <span className="block text-xs text-muted-foreground">
            {formatEventYear(event.occurredAt)}
          </span>
        </time>
      </TableCell>
      <TableCell className={AUDIT_EVENT_CELL_CLASS_NAME}>
        <span className="flex min-w-0 items-center gap-1.5 text-sm text-foreground">
          <ActorIcon
            aria-hidden
            className="size-3.5 shrink-0 text-muted-foreground"
          />
          <span className="truncate" title={event.actorName}>
            {event.actorName}
          </span>
        </span>
      </TableCell>
      <TableCell className={AUDIT_EVENT_CELL_CLASS_NAME}>
        <span
          title={event.display}
          className="block truncate text-sm text-foreground"
        >
          {event.display}
        </span>
      </TableCell>
      <TableCell className={AUDIT_EVENT_CELL_CLASS_NAME}>
        <p
          title={event.resourceName}
          className="truncate text-sm text-foreground"
        >
          {event.resourceName}
        </p>
        <p className="truncate text-xs text-primary">{event.resourceType}</p>
      </TableCell>
      <TableCell className={AUDIT_EVENT_CELL_CLASS_NAME}>
        <AuditActionBadge action={event.action} />
      </TableCell>
      <TableCell className={AUDIT_EVENT_CELL_CLASS_NAME}>
        <AuditStatusBadge status={event.status} />
      </TableCell>
      <TableCell className={AUDIT_EVENT_CELL_CLASS_NAME}>
        <AuditConnectionCell
          name={event.connectionName}
          type={event.connectionType}
        />
      </TableCell>
    </TableRow>
  );
}
