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
import type { Run, RunTableProps } from '../../@types';
import { SKELETON_ROW_COUNT } from '../../constants';
import { groupRunsByWorkflow } from '../../utils';
import { RunDetailRow } from '../run-detail';
import { RUN_CELL_CLASS_NAME, RUN_COLUMNS } from './columns';
import { RunGroupHeaderRow } from './RunGroupHeaderRow';
import { RunTableRow } from './RunTableRow';

export function RunTable({
  runs,
  isLoading,
  isGrouped,
  freshRunIds,
  stats,
  emptyState,
  footer,
  onOpenWorkflow,
  onOpenRawLogs,
}: RunTableProps): JSX.Element {
  // One run open at a time keeps the list scannable.
  const [expandedRunId, setExpandedRunId] = useState<string | null>(null);
  // Groups start open; collapsed ones stay collapsed as more runs load.
  const [collapsedWorkflowIds, setCollapsedWorkflowIds] = useState<
    ReadonlySet<string>
  >(new Set());

  const handleToggleExpanded = (run: Run): void => {
    setExpandedRunId((current) => (current === run.id ? null : run.id));
  };

  const handleToggleCollapsed = (workflowId: string): void => {
    setCollapsedWorkflowIds((current) => {
      const next = new Set(current);
      if (next.has(workflowId)) {
        next.delete(workflowId);
      } else {
        next.add(workflowId);
      }
      return next;
    });
  };

  const renderRow = (run: Run): JSX.Element => {
    const isExpanded = expandedRunId === run.id;
    const detailId = `run-detail-${run.id}`;
    return (
      <Fragment key={run.id}>
        <RunTableRow
          run={run}
          isFresh={freshRunIds.has(run.id)}
          isExpanded={isExpanded}
          detailId={detailId}
          onToggleExpanded={handleToggleExpanded}
        />
        {isExpanded && (
          <RunDetailRow
            id={detailId}
            run={run}
            onOpenWorkflow={onOpenWorkflow}
            onOpenRawLogs={onOpenRawLogs}
          />
        )}
      </Fragment>
    );
  };

  return (
    <div className="overflow-hidden rounded-lg border bg-card shadow-sm">
      <Table aria-busy={isLoading} className="table-fixed">
        <TableHeader className="bg-muted/40">
          <TableRow className="hover:bg-transparent">
            {RUN_COLUMNS.map((column) => (
              <TableHead
                key={column.key}
                scope="col"
                className={cn(
                  'h-10 px-4 text-xs font-medium tracking-wide text-muted-foreground uppercase',
                  column.headClassName,
                )}
              >
                {column.label || <span className="sr-only">Actions</span>}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>

        <TableBody>
          {isLoading &&
            Array.from({ length: SKELETON_ROW_COUNT }, (_, rowIndex) => (
              <TableRow key={rowIndex} className="hover:bg-transparent">
                {RUN_COLUMNS.map((column) => (
                  <TableCell key={column.key} className={RUN_CELL_CLASS_NAME}>
                    <Skeleton
                      className={cn('h-5 bg-muted', column.skeletonClassName)}
                    />
                  </TableCell>
                ))}
              </TableRow>
            ))}

          {!isLoading && runs.length === 0 && (
            <TableRow className="hover:bg-transparent">
              <TableCell
                colSpan={RUN_COLUMNS.length}
                className="p-0 whitespace-normal"
              >
                {emptyState}
              </TableCell>
            </TableRow>
          )}

          {!isLoading &&
            (isGrouped
              ? groupRunsByWorkflow(runs).map((group) => {
                  const isCollapsed = collapsedWorkflowIds.has(
                    group.workflowId,
                  );
                  return (
                    <Fragment key={group.workflowId}>
                      <RunGroupHeaderRow
                        group={group}
                        stats={stats?.byWorkflow.get(group.workflowId)}
                        isCollapsed={isCollapsed}
                        onToggleCollapsed={handleToggleCollapsed}
                      />
                      {!isCollapsed && group.runs.map(renderRow)}
                    </Fragment>
                  );
                })
              : runs.map(renderRow))}
        </TableBody>
      </Table>

      {footer && <div className="border-t">{footer}</div>}
    </div>
  );
}
