import type {
  Run,
  RunFilters,
  RunGroup,
  RunStatusFilter,
  RunStep,
} from '../@types';
import {
  ALL_RUN_STATUSES_FILTER,
  ALL_WORKFLOWS_FILTER,
  INSTANT_STEP_MAX_MS,
  RUN_STATUS,
  RUN_STATUS_FILTER_OPTIONS,
  RUN_STEP_STATUS,
} from '../constants';

const timeFormatter = new Intl.DateTimeFormat('en-GB', {
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hourCycle: 'h23',
});

const fullDateFormatter = new Intl.DateTimeFormat(undefined, {
  dateStyle: 'medium',
  timeStyle: 'medium',
});

export function isRunStatusFilter(value: string): value is RunStatusFilter {
  return RUN_STATUS_FILTER_OPTIONS.some((option) => option.value === value);
}

/** 24-hour start time, e.g. "14:33:04". */
export function formatRunTime(iso: string): string {
  return timeFormatter.format(new Date(iso));
}

/** Full date and time, for the start time's tooltip. */
export function formatRunDateTime(iso: string): string {
  return fullDateFormatter.format(new Date(iso));
}

const timestampFormatter = new Intl.DateTimeFormat('en-GB', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hourCycle: 'h23',
});

/** "30/10/2026, 15:20:38" — for the run detail's start time. */
export function formatRunTimestamp(iso: string): string {
  return timestampFormatter.format(new Date(iso));
}

/** Near-zero steps that can be hidden — never the step that errored. */
export function isInstantStep(
  step: Pick<RunStep, 'durationMs' | 'status'>,
): boolean {
  return (
    step.status !== RUN_STEP_STATUS.ERROR &&
    step.durationMs !== null &&
    step.durationMs <= INSTANT_STEP_MAX_MS
  );
}

/** "28ms", "31.18s" or "2m 05s". */
export function formatDuration(durationMs: number): string {
  if (durationMs < 1000) {
    return `${durationMs}ms`;
  }
  if (durationMs < 60_000) {
    return `${(durationMs / 1000).toFixed(2)}s`;
  }
  const minutes = Math.floor(durationMs / 60_000);
  const seconds = Math.floor((durationMs % 60_000) / 1000);
  return `${minutes}m ${String(seconds).padStart(2, '0')}s`;
}

/** Search matches run ID, correlation ID or workflow name (case-insensitive). */
export function matchesRunFilters(
  run: Pick<
    Run,
    'id' | 'correlationId' | 'workflowId' | 'workflowName' | 'status'
  >,
  filters: RunFilters,
): boolean {
  const query = filters.search.trim().toLowerCase();
  const matchesSearch =
    query === '' ||
    [run.id, run.correlationId, run.workflowName].some((field) =>
      field.toLowerCase().includes(query),
    );
  const matchesWorkflow =
    filters.workflowId === ALL_WORKFLOWS_FILTER ||
    run.workflowId === filters.workflowId;
  const matchesStatus =
    filters.status === ALL_RUN_STATUSES_FILTER || run.status === filters.status;

  return matchesSearch && matchesWorkflow && matchesStatus;
}

export function hasActiveRunFilters(filters: RunFilters): boolean {
  return (
    filters.search.trim() !== '' ||
    filters.workflowId !== ALL_WORKFLOWS_FILTER ||
    filters.status !== ALL_RUN_STATUSES_FILTER
  );
}

/** Groups keep the order of each workflow's most recent run. */
export function groupRunsByWorkflow(runs: Run[]): RunGroup[] {
  const groups = new Map<string, RunGroup>();
  for (const run of runs) {
    const group = groups.get(run.workflowId) ?? {
      workflowId: run.workflowId,
      workflowName: run.workflowName,
      runs: [],
      failedCount: 0,
    };
    group.runs.push(run);
    if (run.status === RUN_STATUS.FAILED) {
      group.failedCount += 1;
    }
    groups.set(run.workflowId, group);
  }
  return [...groups.values()];
}
