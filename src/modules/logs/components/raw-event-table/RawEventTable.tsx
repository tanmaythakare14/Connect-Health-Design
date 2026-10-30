import { Fragment, useState, type JSX } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import type { RawEvent, RawEventTableProps } from '../../@types';
import { SKELETON_ROW_COUNT } from '../../constants';
import { RAW_EVENT_CELL_CLASS_NAME, RAW_EVENT_COLUMNS } from './columns';
import { RawEventDetailRow } from './RawEventDetailRow';
import { RawEventRow } from './RawEventRow';

export function RawEventTable({
  events,
  isLoading,
  emptyState,
  footer,
}: RawEventTableProps): JSX.Element {
  // One event open at a time keeps the log scannable.
  const [expandedEventId, setExpandedEventId] = useState<string | null>(null);

  const handleToggleExpanded = (event: RawEvent): void => {
    setExpandedEventId((current) => (current === event.id ? null : event.id));
  };

  return (
    <div className="overflow-hidden rounded-lg border bg-card shadow-sm">
      <Table aria-busy={isLoading} className="table-fixed">
        <TableHeader className="bg-muted/40">
          <TableRow className="hover:bg-transparent">
            {RAW_EVENT_COLUMNS.map((column) => (
              <TableHead
                key={column.key}
                scope="col"
                className={cn(
                  'h-10 px-4 text-xs font-medium tracking-wide text-muted-foreground uppercase',
                  column.headClassName,
                )}
              >
                {column.label || <span className="sr-only">Expand</span>}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>

        <TableBody>
          {isLoading &&
            Array.from({ length: SKELETON_ROW_COUNT }, (_, rowIndex) => (
              <TableRow key={rowIndex} className="hover:bg-transparent">
                {RAW_EVENT_COLUMNS.map((column) => (
                  <TableCell
                    key={column.key}
                    className={RAW_EVENT_CELL_CLASS_NAME}
                  >
                    <Skeleton
                      className={cn('h-5 bg-muted', column.skeletonClassName)}
                    />
                  </TableCell>
                ))}
              </TableRow>
            ))}

          {!isLoading && events.length === 0 && (
            <TableRow className="hover:bg-transparent">
              <TableCell
                colSpan={RAW_EVENT_COLUMNS.length}
                className="p-0 whitespace-normal"
              >
                {emptyState}
              </TableCell>
            </TableRow>
          )}

          {!isLoading &&
            events.map((event) => {
              const isExpanded = expandedEventId === event.id;
              const detailId = `raw-event-detail-${event.id}`;
              return (
                <Fragment key={event.id}>
                  <RawEventRow
                    event={event}
                    isExpanded={isExpanded}
                    detailId={detailId}
                    onToggleExpanded={handleToggleExpanded}
                  />
                  {isExpanded && (
                    <RawEventDetailRow id={detailId} event={event} />
                  )}
                </Fragment>
              );
            })}
        </TableBody>
      </Table>

      {footer && <div className="border-t">{footer}</div>}
    </div>
  );
}
