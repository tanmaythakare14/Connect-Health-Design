import type { JSX } from 'react';
import { ChevronRight } from 'lucide-react';
import { TableCell, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import type { RunTableRowProps } from '../../@types';
import { formatDuration, formatRunDateTime, formatRunTime } from '../../utils';
import { RUN_CELL_CLASS_NAME } from './columns';
import { RunStatusBadge } from './RunStatusBadge';

const EMPTY_VALUE = '—';

export function RunTableRow({
  run,
  isFresh,
  isExpanded,
  detailId,
  onToggleExpanded,
}: RunTableRowProps): JSX.Element {
  return (
    // `relative` anchors the chevron's stretched click target to this row.
    <TableRow
      data-state={isExpanded ? 'selected' : undefined}
      className={cn(
        'group relative hover:bg-muted/40',
        // Expanded run and its detail row share a tint and a primary edge,
        // so they read as one block apart from the other runs.
        isExpanded &&
          'border-b-0 border-l-2 border-l-primary bg-muted/70 hover:bg-muted/70 data-[state=selected]:bg-muted/70',
        isFresh && 'bg-accent/40 animate-in fade-in-0 slide-in-from-top-1',
      )}
    >
      <TableCell className={RUN_CELL_CLASS_NAME}>
        <RunStatusBadge status={run.status} />
      </TableCell>
      <TableCell className={cn(RUN_CELL_CLASS_NAME, 'text-muted-foreground')}>
        <time
          dateTime={run.startedAt}
          title={formatRunDateTime(run.startedAt)}
          className="tabular-nums"
        >
          {formatRunTime(run.startedAt)}
        </time>
      </TableCell>
      <TableCell className={RUN_CELL_CLASS_NAME}>
        <span
          title={run.trigger}
          className="block truncate text-xs text-muted-foreground"
        >
          {run.trigger}
        </span>
      </TableCell>
      <TableCell className={RUN_CELL_CLASS_NAME}>
        <span
          title={run.workflowName}
          className="block truncate font-medium text-foreground"
        >
          {run.workflowName}
        </span>
      </TableCell>
      <TableCell
        className={cn(RUN_CELL_CLASS_NAME, 'text-foreground tabular-nums')}
      >
        {run.stepsCompleted} / {run.stepsTotal}
      </TableCell>
      <TableCell
        className={cn(RUN_CELL_CLASS_NAME, 'text-foreground tabular-nums')}
      >
        {run.durationMs === null ? (
          <span className="text-muted-foreground">{EMPTY_VALUE}</span>
        ) : (
          formatDuration(run.durationMs)
        )}
      </TableCell>
      <TableCell className={RUN_CELL_CLASS_NAME}>
        {run.failedAt ? (
          <span
            title={run.failedAt}
            className="block truncate font-mono text-xs text-destructive"
          >
            {run.failedAt}
          </span>
        ) : (
          <span className="text-muted-foreground">{EMPTY_VALUE}</span>
        )}
      </TableCell>
      <TableCell className={cn(RUN_CELL_CLASS_NAME, 'text-right')}>
        {/* The ::after overlay stretches this button over the whole row, so
            the row toggles with one click target and a single tab stop. */}
        <button
          type="button"
          onClick={() => onToggleExpanded(run)}
          aria-expanded={isExpanded}
          aria-controls={isExpanded ? detailId : undefined}
          aria-label={`${isExpanded ? 'Hide' : 'Show'} details for run ${run.id}`}
          className="inline-flex size-7 items-center justify-center rounded-md text-muted-foreground outline-none transition-colors group-hover:text-foreground after:absolute after:inset-0 after:content-[''] focus-visible:ring-[3px] focus-visible:ring-ring/50"
        >
          <ChevronRight
            aria-hidden
            className={cn(
              'size-4 transition-transform duration-200',
              isExpanded && 'rotate-90 text-foreground',
            )}
          />
        </button>
      </TableCell>
    </TableRow>
  );
}
