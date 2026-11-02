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
import type { DataTableProps } from './types';

const DEFAULT_SKELETON_ROWS = 6;
const CELL_CLASS_NAME = 'px-4 py-3';

/**
 * A column-driven table card in the app's style: muted uppercase header,
 * row hover, loading placeholders, an empty state and an optional footer.
 * Each column says how to render its cell, so feature tables only describe
 * their columns.
 */
export function DataTable<TRow>({
  columns,
  rows,
  getRowKey,
  isLoading = false,
  skeletonRowCount = DEFAULT_SKELETON_ROWS,
  emptyState,
  footer,
  rowClassName,
  ariaLabel,
}: DataTableProps<TRow>): JSX.Element {
  return (
    <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
      <Table
        aria-busy={isLoading}
        aria-label={ariaLabel}
        className="table-fixed"
      >
        <TableHeader className="bg-muted/40">
          <TableRow className="hover:bg-transparent">
            {columns.map((column) => (
              <TableHead
                key={column.key}
                scope="col"
                className={cn(
                  'h-10 px-4 text-xs font-medium tracking-wide text-muted-foreground uppercase',
                  column.headClassName,
                )}
              >
                {column.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>

        <TableBody>
          {isLoading &&
            Array.from({ length: skeletonRowCount }, (_, rowIndex) => (
              <TableRow key={rowIndex} className="hover:bg-transparent">
                {columns.map((column) => (
                  <TableCell key={column.key} className={CELL_CLASS_NAME}>
                    <Skeleton
                      className={cn(
                        'h-5 w-24 bg-muted',
                        column.skeletonClassName,
                      )}
                    />
                  </TableCell>
                ))}
              </TableRow>
            ))}

          {!isLoading && rows.length === 0 && emptyState && (
            <TableRow className="hover:bg-transparent">
              <TableCell
                colSpan={columns.length}
                className="p-0 whitespace-normal"
              >
                {emptyState}
              </TableCell>
            </TableRow>
          )}

          {!isLoading &&
            rows.map((row) => (
              <TableRow
                key={getRowKey(row)}
                className={cn('hover:bg-muted/40', rowClassName?.(row))}
              >
                {columns.map((column) => (
                  <TableCell
                    key={column.key}
                    className={cn(CELL_CLASS_NAME, column.cellClassName)}
                  >
                    {column.cell(row)}
                  </TableCell>
                ))}
              </TableRow>
            ))}
        </TableBody>
      </Table>

      {footer && <div className="border-t">{footer}</div>}
    </div>
  );
}
