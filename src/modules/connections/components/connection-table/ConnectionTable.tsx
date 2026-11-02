import type { JSX } from 'react';
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
import type { ConnectionTableProps } from '../../@types';
import { CONNECTION_COLUMNS, connectionCellVariants } from './columns';
import { ConnectionTableRow } from './ConnectionTableRow';

export function ConnectionTable({
  connections,
  isLoading,
  skeletonRowCount,
  emptyState,
  footer,
  density = 'comfortable',
  fillHeight = false,
  onManage,
  onToggleActive,
  onTest,
}: ConnectionTableProps): JSX.Element {
  // Computed once so data rows and skeleton rows always share a height.
  const cellClassName = connectionCellVariants({ density });

  return (
    <div
      className={cn(
        'overflow-hidden rounded-lg border bg-card shadow-sm',
        fillHeight && 'flex flex-1 flex-col',
      )}
    >
      <Table aria-busy={isLoading} className="table-fixed">
        <TableHeader className="bg-muted/40">
          <TableRow className="hover:bg-transparent">
            {CONNECTION_COLUMNS.map((column) => (
              <TableHead
                key={column.key}
                scope="col"
                className={cn(
                  'h-11 px-4 text-xs font-medium tracking-wide text-muted-foreground uppercase',
                  column.headClassName,
                )}
              >
                {column.label}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>

        <TableBody>
          {isLoading &&
            Array.from({ length: skeletonRowCount }, (_, rowIndex) => (
              <TableRow key={rowIndex} className="hover:bg-transparent">
                {CONNECTION_COLUMNS.map((column) => (
                  <TableCell key={column.key} className={cellClassName}>
                    <Skeleton
                      className={cn('h-5 bg-muted', column.skeletonClassName)}
                    />
                  </TableCell>
                ))}
              </TableRow>
            ))}

          {!isLoading && connections.length === 0 && (
            <TableRow className="hover:bg-transparent">
              <TableCell
                colSpan={CONNECTION_COLUMNS.length}
                className="p-0 whitespace-normal"
              >
                {emptyState}
              </TableCell>
            </TableRow>
          )}

          {!isLoading &&
            connections.map((connection) => (
              <ConnectionTableRow
                key={connection.id}
                connection={connection}
                cellClassName={cellClassName}
                onManage={onManage}
                onToggleActive={onToggleActive}
                onTest={onTest}
              />
            ))}
        </TableBody>
      </Table>

      {/* mt-auto pins the footer to the bottom when the card fills the screen */}
      {footer && <div className="mt-auto border-t">{footer}</div>}
    </div>
  );
}
