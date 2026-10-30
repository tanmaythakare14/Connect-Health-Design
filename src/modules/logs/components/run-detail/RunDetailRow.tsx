import { useCallback, useEffect, useState, type JSX } from 'react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { TableCell, TableRow } from '@/components/ui/table';
import { logger } from '@/utils/logger';
import type { RunDetailRowProps, RunDetailState } from '../../@types';
import { apiDtoToRunDetail, getRunDetail } from '../../service';
import { RUN_COLUMNS } from '../run-table/columns';
import { RunDetailPanel } from './RunDetailPanel';

const SKELETON_STEP_COUNT = 4;

/** Full-width row under an expanded run: loads and shows its details. */
export function RunDetailRow({
  run,
  id,
  onOpenWorkflow,
  onOpenRawLogs,
}: RunDetailRowProps): JSX.Element {
  const [detailState, setDetailState] = useState<RunDetailState>({
    status: 'loading',
  });

  const loadDetail = useCallback(async (): Promise<void> => {
    setDetailState({ status: 'loading' });
    try {
      const dto = await getRunDetail(run.id);
      setDetailState({ status: 'success', data: apiDtoToRunDetail(dto) });
    } catch (error) {
      logger.error('Loading run details failed', { runId: run.id, error });
      setDetailState({ status: 'error' });
    }
  }, [run.id]);

  // Reloads when a running run finishes, so the timeline fills in.
  useEffect(() => {
    void loadDetail();
  }, [loadDetail, run.status]);

  return (
    <TableRow
      id={id}
      className="border-l-2 border-l-primary bg-muted/40 hover:bg-muted/40 animate-in fade-in-0 slide-in-from-top-1 duration-200"
    >
      <TableCell colSpan={RUN_COLUMNS.length} className="p-0 whitespace-normal">
        {detailState.status === 'loading' && (
          <div className="space-y-3 px-6 py-4" aria-busy>
            <Skeleton className="h-5 w-72 bg-muted" />
            <Skeleton className="h-4 w-96 bg-muted" />
            {Array.from({ length: SKELETON_STEP_COUNT }, (_, index) => (
              <Skeleton key={index} className="h-6 w-full bg-muted" />
            ))}
          </div>
        )}

        {detailState.status === 'error' && (
          <div
            role="alert"
            className="flex items-center gap-2 px-6 py-4 text-sm text-destructive"
          >
            We couldn’t load this run’s details.
            <Button
              variant="link"
              className="h-auto p-0 text-sm"
              onClick={() => void loadDetail()}
            >
              Try again
            </Button>
          </div>
        )}

        {detailState.status === 'success' && (
          <RunDetailPanel
            detail={detailState.data}
            onOpenWorkflow={onOpenWorkflow}
            onOpenRawLogs={onOpenRawLogs}
          />
        )}
      </TableCell>
    </TableRow>
  );
}
