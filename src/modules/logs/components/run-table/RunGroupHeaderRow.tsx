import type { JSX } from 'react';
import { ChevronDown } from 'lucide-react';
import { TableCell, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import type { RunGroupHeaderRowProps } from '../../@types';
import { formatDuration } from '../../utils';
import { RUN_COLUMNS } from './columns';

const countFormatter = new Intl.NumberFormat('en-US');

/**
 * Collapsible header above one workflow's runs: name, 24h volume, p95 run
 * time and how many of the loaded runs have errors.
 */
export function RunGroupHeaderRow({
  group,
  stats,
  isCollapsed,
  onToggleCollapsed,
}: RunGroupHeaderRowProps): JSX.Element {
  const loadedCount = group.runs.length;

  return (
    <TableRow className="bg-muted/30 hover:bg-muted/50">
      <TableCell colSpan={RUN_COLUMNS.length} className="p-0">
        <button
          type="button"
          onClick={() => onToggleCollapsed(group.workflowId)}
          aria-expanded={!isCollapsed}
          className="flex w-full min-w-0 items-center gap-3 px-4 py-2.5 text-left outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:ring-inset"
        >
          <ChevronDown
            aria-hidden
            className={cn(
              'size-4 shrink-0 text-muted-foreground transition-transform duration-200',
              isCollapsed && '-rotate-90',
            )}
          />
          <span className="truncate text-sm font-semibold text-foreground">
            {group.workflowName}
          </span>

          <span className="flex shrink-0 items-center gap-2 text-xs text-muted-foreground">
            {stats ? (
              <>
                <span>
                  <span className="font-medium text-foreground tabular-nums">
                    {countFormatter.format(stats.runsLast24h)}
                  </span>{' '}
                  {stats.runsLast24h === 1 ? 'run' : 'runs'} · 24h
                </span>
                {stats.p95DurationMs !== null && (
                  <>
                    <span
                      aria-hidden
                      className="size-1 rounded-full bg-muted-foreground/40"
                    />
                    <span>
                      p95{' '}
                      <span className="font-medium text-foreground tabular-nums">
                        {formatDuration(stats.p95DurationMs)}
                      </span>
                    </span>
                  </>
                )}
              </>
            ) : (
              <span>
                {loadedCount} {loadedCount === 1 ? 'run' : 'runs'}
              </span>
            )}
          </span>

          {group.failedCount > 0 && (
            <span className="inline-flex shrink-0 items-center rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-300">
              {group.failedCount} with errors
            </span>
          )}

          {isCollapsed && (
            <span className="ml-auto shrink-0 text-xs text-muted-foreground">
              {loadedCount} hidden
            </span>
          )}
        </button>
      </TableCell>
    </TableRow>
  );
}
