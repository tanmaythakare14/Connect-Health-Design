import type { JSX } from 'react';
import { ChevronRight } from 'lucide-react';
import { TableCell, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import type { RawEventRowProps } from '../../@types';
import {
  formatEventDateTime,
  formatEventFullTimestamp,
  formatEventYear,
} from '../../utils';
import { RAW_EVENT_CELL_CLASS_NAME } from './columns';
import { RawEventLevelBadge } from './RawEventLevelBadge';
import { RawEventStatusBadge } from './RawEventStatusBadge';

export function RawEventRow({
  event,
  isExpanded,
  detailId,
  onToggleExpanded,
}: RawEventRowProps): JSX.Element {
  return (
    // `relative` anchors the chevron's stretched click target to this row.
    <TableRow
      className={cn(
        'group relative hover:bg-muted/40',
        isExpanded &&
          'border-b-0 border-l-2 border-l-primary bg-muted/70 hover:bg-muted/70',
      )}
    >
      <TableCell className={cn(RAW_EVENT_CELL_CLASS_NAME, 'pr-0')}>
        {/* The ::after overlay stretches this button over the whole row, so
            the row toggles with one click target and a single tab stop. */}
        <button
          type="button"
          onClick={() => onToggleExpanded(event)}
          aria-expanded={isExpanded}
          aria-controls={isExpanded ? detailId : undefined}
          aria-label={`${isExpanded ? 'Hide' : 'Show'} details for event ${event.id}`}
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
      <TableCell className={RAW_EVENT_CELL_CLASS_NAME}>
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
      <TableCell className={RAW_EVENT_CELL_CLASS_NAME}>
        <RawEventLevelBadge level={event.level} />
      </TableCell>
      <TableCell className={cn(RAW_EVENT_CELL_CLASS_NAME, 'whitespace-normal')}>
        <p
          title={event.message}
          className="line-clamp-2 text-sm text-foreground"
        >
          {event.message}
        </p>
      </TableCell>
      <TableCell className={RAW_EVENT_CELL_CLASS_NAME}>
        <RawEventStatusBadge status={event.status} />
      </TableCell>
    </TableRow>
  );
}
