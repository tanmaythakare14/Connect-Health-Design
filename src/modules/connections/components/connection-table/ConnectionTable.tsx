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
import { CELL_CLASS_NAME, CONNECTION_COLUMNS } from './columns';
import { ConnectionTableRow } from './ConnectionTableRow';

export function ConnectionTable({
  connections,
  isLoading,
  skeletonRowCount,
  emptyState,
  footer,
  onManage,
}: ConnectionTableProps): JSX.Element {
  return (
    <div className="overflow-hidden rounded-lg border bg-card shadow-sm">
      <Table aria-busy={isLoading} className="table-fixed">
        <TableHeader className="bg-muted/40">
          <TableRow className="hover:bg-transparent">
            {CONNECTION_COLUMNS.map((column) => (
              <TableHead
                key={column.key}
                scope="col"
                className={cn(
                  'h-10 px-4 text-xs font-medium tracking-wide text-muted-foreground uppercase',
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
                  <TableCell key={column.key} className={CELL_CLASS_NAME}>
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
                onManage={onManage}
              />
            ))}
        </TableBody>
      </Table>

      {footer && <div className="border-t">{footer}</div>}
    </div>
  );
}
