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
import type { AuditEvent, AuditEventTableProps } from '../../@types';
import { SKELETON_ROW_COUNT } from '../../constants';
import { AuditEventDetailRow } from './AuditEventDetailRow';
import { AuditEventRow } from './AuditEventRow';
import { AUDIT_EVENT_CELL_CLASS_NAME, AUDIT_EVENT_COLUMNS } from './columns';

export function AuditEventTable({
  events,
  isLoading,
  emptyState,
  footer,
}: AuditEventTableProps): JSX.Element {
  // One event open at a time keeps the trail scannable.
  const [expandedEventId, setExpandedEventId] = useState<string | null>(null);

  const handleToggleExpanded = (event: AuditEvent): void => {
    setExpandedEventId((current) => (current === event.id ? null : event.id));
  };

  return (
    <div className="overflow-hidden rounded-lg border bg-card shadow-sm">
      <Table aria-busy={isLoading} className="table-fixed">
        <TableHeader className="bg-muted/40">
          <TableRow className="hover:bg-transparent">
            {AUDIT_EVENT_COLUMNS.map((column) => (
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
                {AUDIT_EVENT_COLUMNS.map((column) => (
                  <TableCell
                    key={column.key}
                    className={AUDIT_EVENT_CELL_CLASS_NAME}
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
                colSpan={AUDIT_EVENT_COLUMNS.length}
                className="p-0 whitespace-normal"
              >
                {emptyState}
              </TableCell>
            </TableRow>
          )}

          {!isLoading &&
            events.map((event) => {
              const isExpanded = expandedEventId === event.id;
              const detailId = `audit-event-detail-${event.id}`;
              return (
                <Fragment key={event.id}>
                  <AuditEventRow
                    event={event}
                    isExpanded={isExpanded}
                    detailId={detailId}
                    onToggleExpanded={handleToggleExpanded}
                  />
                  {isExpanded && (
                    <AuditEventDetailRow id={detailId} event={event} />
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
