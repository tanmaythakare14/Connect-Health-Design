import type { RunStatus, RunStatusFilter } from '../@types';

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
