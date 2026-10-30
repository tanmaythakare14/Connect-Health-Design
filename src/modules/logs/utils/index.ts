import type { DateRange } from 'react-day-picker';
import type {
  RawEventApiDto,
  RawEventFilters,
  RawEventLevelFilter,
  RawEventStatusFilter,
  Run,
  RunFilters,
  RunGroup,
  RunStatusFilter,
  RunStep,
} from '../@types';
import {
  ALL_RAW_EVENTS_FILTER,
  ALL_RUN_STATUSES_FILTER,
  ALL_WORKFLOWS_FILTER,
  INSTANT_STEP_MAX_MS,
  RAW_EVENT_LEVEL_FILTER_OPTIONS,
  RAW_EVENT_STATUS_FILTER_OPTIONS,
  RUN_STATUS,
  RUN_STATUS_FILTER_OPTIONS,
  RUN_STEP_STATUS,
} from '../constants';

// ── Raw application events ───────────────────────────────────────

const eventDateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hourCycle: 'h23',
});

const eventFullFormatter = new Intl.DateTimeFormat('en-US', {
  dateStyle: 'full',
  timeStyle: 'long',
});

export function isRawEventStatusFilter(
  value: string,
): value is RawEventStatusFilter {
  return RAW_EVENT_STATUS_FILTER_OPTIONS.some(
    (option) => option.value === value,
  );
}

export function isRawEventLevelFilter(
  value: string,
): value is RawEventLevelFilter {
  return RAW_EVENT_LEVEL_FILTER_OPTIONS.some(
    (option) => option.value === value,
  );
}

/** "Oct 30, 17:06:24" — the event's local date and time. */
export function formatEventDateTime(iso: string): string {
  return eventDateFormatter.format(new Date(iso));
}

/** "2026 (Local)" — the year line under the date. */
export function formatEventYear(iso: string): string {
  return `${new Date(iso).getFullYear()} (Local)`;
}

/** "Friday, October 30, 2026 at 5:06:24 PM GMT+5:30" — for the detail view. */
export function formatEventFullTimestamp(iso: string): string {
  return eventFullFormatter.format(new Date(iso));
}

/** Calendar days → inclusive ISO bounds (start of the first day, end of the last). */
export function dateRangeToIsoBounds(range: DateRange | undefined): {
  from: string | null;
  to: string | null;
} {
  if (!range?.from) return { from: null, to: null };
  const start = new Date(range.from);
  start.setHours(0, 0, 0, 0);
  const end = new Date(range.to ?? range.from);
  end.setHours(23, 59, 59, 999);
  return { from: start.toISOString(), to: end.toISOString() };
}

/** Search matches the message, event ID, correlation ID or source. */
export function matchesRawEventFilters(
  event: RawEventApiDto,
  filters: RawEventFilters,
): boolean {
  const query = filters.search.trim().toLowerCase();
  const matchesSearch =
    query === '' ||
    [event.message, event.id, event.correlationId ?? '', event.source].some(
      (field) => field.toLowerCase().includes(query),
    );
  const matchesLevel =
    filters.level === ALL_RAW_EVENTS_FILTER || event.level === filters.level;
  const matchesStatus =
    filters.status === ALL_RAW_EVENTS_FILTER || event.status === filters.status;
  const matchesRange =
    (filters.from === null || event.occurredAt >= filters.from) &&
    (filters.to === null || event.occurredAt <= filters.to);

  return matchesSearch && matchesLevel && matchesStatus && matchesRange;
}

export function hasActiveRawEventFilters(
  filters: Pick<RawEventFilters, 'search' | 'level' | 'status'> & {
    dateRange: DateRange | undefined;
  },
): boolean {
  return (
    filters.search.trim() !== '' ||
    filters.level !== ALL_RAW_EVENTS_FILTER ||
    filters.status !== ALL_RAW_EVENTS_FILTER ||
    Boolean(filters.dateRange?.from)
  );
}

// ── Runs ─────────────────────────────────────────────────────────

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
