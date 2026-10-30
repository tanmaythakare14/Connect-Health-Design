import type {
  RawEventLevel,
  RawEventLevelFilter,
  RawEventStatus,
  RawEventStatusFilter,
  RunStatus,
  RunStatusFilter,
} from '../@types';

export const RUN_STATUS = {
  RUNNING: 'running',
  SUCCESS: 'success',
  FAILED: 'failed',
} as const;

export const RUN_STATUS_LABELS: Record<RunStatus, string> = {
  running: 'Running',
  success: 'Success',
  failed: 'With errors',
};

export const RUN_STEP_STATUS = {
  SUCCESS: 'success',
  ERROR: 'error',
  PENDING: 'pending',
} as const;

/** Steps at or under this are "instant" and can be hidden in the timeline */
export const INSTANT_STEP_MAX_MS = 1;

export const ALL_WORKFLOWS_FILTER = 'all';
export const ALL_RUN_STATUSES_FILTER = 'all';

export const RUN_STATUS_FILTER_OPTIONS: Array<{
  value: RunStatusFilter;
  label: string;
}> = [
  { value: ALL_RUN_STATUSES_FILTER, label: 'All statuses' },
  { value: RUN_STATUS.FAILED, label: 'Failed with error' },
  { value: RUN_STATUS.SUCCESS, label: 'Success' },
];

export const LOG_TABS = {
  APPLICATION: 'application',
  AUDIT: 'audit',
} as const;

export const APPLICATION_LOG_TABS = {
  RUNS: 'runs',
  RAW: 'raw',
} as const;

/** Runs fetched per "Load more" */
export const RUNS_PAGE_SIZE = 15;
export const SKELETON_ROW_COUNT = 8;
export const SEARCH_DEBOUNCE_MS = 300;
/** How long rows from a refresh stay highlighted once they finish */
export const FRESH_RUN_HIGHLIGHT_MS = 2000;

// ── Raw application events ───────────────────────────────────────

export const RAW_EVENT_LEVEL = {
  INFO: 'info',
  WARN: 'warn',
} as const;

export const RAW_EVENT_LEVEL_LABELS: Record<RawEventLevel, string> = {
  info: 'Info Log',
  warn: 'Warn Log',
};

export const RAW_EVENT_STATUS = {
  SUCCESS: 'success',
  WARNING: 'warning',
  SERIOUS_FAILURE: 'serious_failure',
  MAJOR_FAILURE: 'major_failure',
} as const;

export const RAW_EVENT_STATUS_LABELS: Record<RawEventStatus, string> = {
  success: 'Success',
  warning: 'Warning',
  serious_failure: 'Serious failure',
  major_failure: 'Major failure',
};

export const ALL_RAW_EVENTS_FILTER = 'all';

export const RAW_EVENT_STATUS_FILTER_OPTIONS: Array<{
  value: RawEventStatusFilter;
  label: string;
}> = [
  { value: ALL_RAW_EVENTS_FILTER, label: 'All statuses' },
  { value: RAW_EVENT_STATUS.SUCCESS, label: 'Success' },
  { value: RAW_EVENT_STATUS.WARNING, label: 'Warning' },
  { value: RAW_EVENT_STATUS.SERIOUS_FAILURE, label: 'Serious failure' },
  { value: RAW_EVENT_STATUS.MAJOR_FAILURE, label: 'Major failure' },
];

export const RAW_EVENT_LEVEL_FILTER_OPTIONS: Array<{
  value: RawEventLevelFilter;
  label: string;
}> = [
  { value: ALL_RAW_EVENTS_FILTER, label: 'All events' },
  { value: RAW_EVENT_LEVEL.INFO, label: 'Info Log' },
  { value: RAW_EVENT_LEVEL.WARN, label: 'Warn Log' },
];

export const RAW_EVENT_PAGE_SIZE_OPTIONS = [10, 20, 50];
export const DEFAULT_RAW_EVENT_PAGE_SIZE = 10;
