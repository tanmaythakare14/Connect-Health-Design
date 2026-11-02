import type { JSX } from 'react';
import { History } from 'lucide-react';
import { EmptyState } from '@/components/common';
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
import type { RecentActivityCardProps } from '../../@types';
import { SKELETON_ACTIVITY_ROWS } from '../../constants';
import { formatFullDateTime, formatRelativeTime } from '../../utils';
import { ActivityStatusBadge } from './ActivityStatusBadge';

const COLUMNS = ['When', 'User', 'Action', 'Status'] as const;
const CELL_CLASS_NAME = 'px-5 py-3.5';

/** The latest audit entries as a table card (the section supplies the heading). */
export function RecentActivityCard({
  activity,
  isLoading,
}: RecentActivityCardProps): JSX.Element {
  return (
    <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
      <Table aria-busy={isLoading} className="table-fixed">
        <TableHeader className="bg-muted/40">
          <TableRow className="hover:bg-transparent">
            {COLUMNS.map((column) => (
              <TableHead
                key={column}
                scope="col"
                className="h-10 px-5 text-xs font-medium tracking-wide text-muted-foreground uppercase"
              >
                {column}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>

        <TableBody>
          {isLoading &&
            Array.from({ length: SKELETON_ACTIVITY_ROWS }, (_, rowIndex) => (
              <TableRow key={rowIndex} className="hover:bg-transparent">
                {COLUMNS.map((column) => (
                  <TableCell key={column} className={CELL_CLASS_NAME}>
                    <Skeleton className="h-5 w-24 bg-muted" />
                  </TableCell>
                ))}
              </TableRow>
            ))}

          {!isLoading && activity.length === 0 && (
            <TableRow className="hover:bg-transparent">
              <TableCell
                colSpan={COLUMNS.length}
                className="p-0 whitespace-normal"
              >
                <EmptyState
                  icon={History}
                  title="No activity yet"
                  description="Actions people and workflows take will show up here."
                />
              </TableCell>
            </TableRow>
          )}

          {!isLoading &&
            activity.map((entry) => (
              <TableRow key={entry.id} className="hover:bg-muted/40">
                <TableCell
                  className={cn(CELL_CLASS_NAME, 'text-muted-foreground')}
                >
                  <time
                    dateTime={entry.occurredAt}
                    title={formatFullDateTime(entry.occurredAt)}
                  >
                    {formatRelativeTime(entry.occurredAt)}
                  </time>
                </TableCell>
                <TableCell className={CELL_CLASS_NAME}>
                  <span
                    title={entry.actorName}
                    className="block truncate font-medium text-foreground"
                  >
                    {entry.actorName}
                  </span>
                </TableCell>
                <TableCell className={CELL_CLASS_NAME}>
                  <span
                    title={entry.action}
                    className="block truncate text-foreground"
                  >
                    {entry.action}
                  </span>
                </TableCell>
                <TableCell className={CELL_CLASS_NAME}>
                  <ActivityStatusBadge status={entry.status} />
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>
    </div>
  );
}
