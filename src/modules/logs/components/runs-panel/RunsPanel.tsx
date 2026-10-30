import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type JSX,
} from 'react';
import { CircleAlert, ScrollText, SearchX } from 'lucide-react';
import { toast } from 'sonner';
import { EmptyState } from '@/components/common';
import { Button } from '@/components/ui/button';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { logger } from '@/utils/logger';
import type {
  Run,
  RunDetail,
  RunFilters,
  RunListState,
  RunStats,
  RunStatusFilter,
  RunWorkflowFilter,
  RunWorkflowOption,
} from '../../@types';
import {
  ALL_RUN_STATUSES_FILTER,
  ALL_WORKFLOWS_FILTER,
  FRESH_RUN_HIGHLIGHT_MS,
  RUN_STATUS,
  RUNS_PAGE_SIZE,
  SEARCH_DEBOUNCE_MS,
} from '../../constants';
import {
  apiDtoToRun,
  apiDtoToRunStats,
  apiDtoToRunWorkflowOption,
  getRunsByIds,
  getRunStats,
  listNewRuns,
  listRuns,
  listRunWorkflowOptions,
} from '../../service';
import { hasActiveRunFilters } from '../../utils';
import { RunListFooter, RunTable } from '../run-table';
import { RunsToolbar } from '../runs-toolbar';

const NO_FRESH_RUNS: ReadonlySet<string> = new Set();

const replaceRuns = (runs: Run[], updates: Run[]): Run[] => {
  const updatesById = new Map(updates.map((run) => [run.id, run]));
  return runs.map((run) => updatesById.get(run.id) ?? run);
};

/** Application → Runs: searchable, filterable run history with live refresh. */
export function RunsPanel(): JSX.Element {
  const [listState, setListState] = useState<RunListState>({
    status: 'loading',
  });
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search, SEARCH_DEBOUNCE_MS);
  const [workflowFilter, setWorkflowFilter] =
    useState<RunWorkflowFilter>(ALL_WORKFLOWS_FILTER);
  const [statusFilter, setStatusFilter] = useState<RunStatusFilter>(
    ALL_RUN_STATUSES_FILTER,
  );
  const [workflowOptions, setWorkflowOptions] = useState<RunWorkflowOption[]>(
    [],
  );
  const [stats, setStats] = useState<RunStats | null>(null);
  const [isGrouped, setIsGrouped] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [freshRunIds, setFreshRunIds] =
    useState<ReadonlySet<string>>(NO_FRESH_RUNS);
  // Ignores responses for filters the user has already moved on from.
  const latestRequestId = useRef(0);

  const filters = useMemo<RunFilters>(
    () => ({
      search: debouncedSearch.trim(),
      workflowId: workflowFilter,
      status: statusFilter,
    }),
    [debouncedSearch, workflowFilter, statusFilter],
  );

  const loadRuns = useCallback(async (): Promise<void> => {
    const requestId = ++latestRequestId.current;
    setListState({ status: 'loading' });
    setFreshRunIds(NO_FRESH_RUNS);
    try {
      const page = await listRuns({
        ...filters,
        offset: 0,
        limit: RUNS_PAGE_SIZE,
      });
      if (requestId !== latestRequestId.current) return;
      setListState({
        status: 'success',
        runs: page.runs.map(apiDtoToRun),
        total: page.total,
      });
    } catch (error) {
      if (requestId !== latestRequestId.current) return;
      logger.error('Loading runs failed', { error });
      setListState({ status: 'error' });
    }
  }, [filters]);

  useEffect(() => {
    void loadRuns();
  }, [loadRuns]);

  useEffect(() => {
    listRunWorkflowOptions()
      .then((dtos) => setWorkflowOptions(dtos.map(apiDtoToRunWorkflowOption)))
      .catch((error: unknown) => {
        // The filter still offers "All workflows"; nothing else to show.
        logger.warn('Loading workflow filter options failed', { error });
      });
  }, []);

  // Counts are informational, so a failure just leaves the chips hidden.
  const loadStats = useCallback(async (): Promise<void> => {
    try {
      setStats(apiDtoToRunStats(await getRunStats()));
    } catch (error) {
      logger.warn('Loading run stats failed', { error });
    }
  }, []);

  useEffect(() => {
    void loadStats();
  }, [loadStats]);

  const runs = listState.status === 'success' ? listState.runs : [];
  const isFiltered = hasActiveRunFilters({
    search,
    workflowId: workflowFilter,
    status: statusFilter,
  });

  const handleClearFilters = (): void => {
    setSearch('');
    setWorkflowFilter(ALL_WORKFLOWS_FILTER);
    setStatusFilter(ALL_RUN_STATUSES_FILTER);
  };

  const handleLoadMore = async (): Promise<void> => {
    if (listState.status !== 'success') return;
    const requestId = latestRequestId.current;
    setIsLoadingMore(true);
    try {
      const page = await listRuns({
        ...filters,
        offset: listState.runs.length,
        limit: RUNS_PAGE_SIZE,
      });
      if (requestId !== latestRequestId.current) return;
      setListState((current) =>
        current.status === 'success'
          ? {
              ...current,
              runs: [...current.runs, ...page.runs.map(apiDtoToRun)],
              total: page.total,
            }
          : current,
      );
    } catch (error) {
      logger.error('Loading more runs failed', { error });
      toast.error('Couldn’t load more runs', {
        description: 'Please try again.',
      });
    } finally {
      setIsLoadingMore(false);
    }
  };

  /**
   * Pulls in runs started since the newest one shown — they arrive as
   * "Running" — then waits for every running run to finish. The refresh
   * button spins until they're all done.
   */
  const handleRefresh = async (): Promise<void> => {
    if (listState.status !== 'success' || isRefreshing) return;
    const requestId = latestRequestId.current;
    setIsRefreshing(true);
    try {
      const newRuns = (
        await listNewRuns({
          ...filters,
          since: listState.runs[0]?.startedAt ?? null,
        })
      ).map(apiDtoToRun);
      if (requestId !== latestRequestId.current) return;

      setFreshRunIds(new Set(newRuns.map((run) => run.id)));
      setListState((current) =>
        current.status === 'success'
          ? {
              ...current,
              runs: [...newRuns, ...current.runs],
              total: current.total + newRuns.length,
            }
          : current,
      );

      const runningIds = [...newRuns, ...listState.runs]
        .filter((run) => run.status === RUN_STATUS.RUNNING)
        .map((run) => run.id);
      if (runningIds.length > 0) {
        const finishedRuns = (await getRunsByIds(runningIds)).map(apiDtoToRun);
        if (requestId !== latestRequestId.current) return;
        setListState((current) =>
          current.status === 'success'
            ? { ...current, runs: replaceRuns(current.runs, finishedRuns) }
            : current,
        );
      }

      setTimeout(() => setFreshRunIds(NO_FRESH_RUNS), FRESH_RUN_HIGHLIGHT_MS);
      await loadStats();
    } catch (error) {
      logger.error('Refreshing runs failed', { error });
      toast.error('Couldn’t refresh runs', {
        description: 'Please try again.',
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  // MOCK: the workflow builder and raw log views don't exist yet.
  const handleOpenWorkflow = (detail: RunDetail): void => {
    logger.info('Open workflow requested', { workflowId: detail.workflowId });
  };
  const handleOpenRawLogs = (detail: RunDetail): void => {
    logger.info('Raw logs requested', { runId: detail.id });
  };

  if (listState.status === 'error') {
    return (
      <div className="rounded-xl border bg-card">
        <EmptyState
          tone="destructive"
          icon={CircleAlert}
          title="Runs didn’t load"
          description="We couldn’t load the run history. Please try again."
          action={
            <Button variant="outline" size="sm" onClick={() => void loadRuns()}>
              Try again
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <RunsToolbar
        search={search}
        onSearchChange={setSearch}
        workflowFilter={workflowFilter}
        onWorkflowFilterChange={setWorkflowFilter}
        workflowOptions={workflowOptions}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        isGrouped={isGrouped}
        onGroupedChange={setIsGrouped}
        isRefreshing={isRefreshing}
        onRefresh={() => void handleRefresh()}
        stats={stats}
        disabled={listState.status === 'loading'}
      />

      <p className="sr-only" aria-live="polite">
        {isRefreshing ? 'Refreshing runs' : ''}
      </p>

      <RunTable
        runs={runs}
        isLoading={listState.status === 'loading'}
        isGrouped={isGrouped}
        freshRunIds={freshRunIds}
        stats={stats}
        onOpenWorkflow={handleOpenWorkflow}
        onOpenRawLogs={handleOpenRawLogs}
        emptyState={
          isFiltered ? (
            <EmptyState
              icon={SearchX}
              title="No runs match your filters"
              description="Try a different run ID, correlation ID, workflow or status."
              action={
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClearFilters}
                >
                  Clear filters
                </Button>
              }
            />
          ) : (
            <EmptyState
              icon={ScrollText}
              title="No runs yet"
              description="Runs show up here as soon as a workflow is triggered."
            />
          )
        }
        footer={
          listState.status === 'success' &&
          runs.length > 0 && (
            <RunListFooter
              loadedCount={runs.length}
              total={listState.total}
              isLoadingMore={isLoadingMore}
              onLoadMore={() => void handleLoadMore()}
            />
          )
        }
      />
    </div>
  );
}
