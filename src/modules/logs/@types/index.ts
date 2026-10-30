import type { ReactNode } from 'react';
import type { DateRange } from 'react-day-picker';
import type {
  ALL_RAW_EVENTS_FILTER,
  ALL_RUN_STATUSES_FILTER,
  ALL_WORKFLOWS_FILTER,
  RAW_EVENT_LEVEL,
  RAW_EVENT_STATUS,
  RUN_STATUS,
  RUN_STEP_STATUS,
} from '../constants';

export type RunStatus = (typeof RUN_STATUS)[keyof typeof RUN_STATUS];

export type RunStepStatus =
  (typeof RUN_STEP_STATUS)[keyof typeof RUN_STEP_STATUS];

// DTO — one workflow run, as returned by the API (currently mocks/runs.ts)
export interface RunApiDto {
  id: string;
  correlationId: string;
  status: RunStatus;
  /** ISO timestamp */
  startedAt: string;
  /** What started the run: an endpoint, schedule, webhook or event */
  trigger: string;
  workflowId: string;
  workflowName: string;
  stepsCompleted: number;
  stepsTotal: number;
  /** Null while the run is still going */
  durationMs: number | null;
  /** Name of the node that errored; null unless the run has errors */
  failedAt: string | null;
}

// DTO — what went wrong in a node that errored
export interface RunStepErrorApiDto {
  /** Error type thrown by the node, e.g. "AIProviderError" */
  errorClass: string;
  /** Machine-readable reason, e.g. "AUTH_ERROR" */
  code: string;
  httpStatus: number | null;
  /** Error values, when the node recorded them */
  detail: string | null;
}

// DTO — one node's execution within a run
export interface RunStepApiDto {
  id: string;
  name: string;
  /** Node kind, e.g. "function", "ai-agent", "http_response" */
  nodeType: string;
  status: RunStepStatus;
  /** Start, relative to the run's start; null until the step runs */
  offsetMs: number | null;
  durationMs: number | null;
  /** Set only when status is "error" */
  error: RunStepErrorApiDto | null;
}

export interface RunStepError {
  errorClass: string;
  code: string;
  httpStatus: number | null;
  detail: string | null;
}

// DTO — a run plus its step timeline (GET /logs/runs/:id)
export interface RunDetailApiDto extends RunApiDto {
  steps: RunStepApiDto[];
}

export interface RunStep {
  id: string;
  name: string;
  nodeType: string;
  status: RunStepStatus;
  offsetMs: number | null;
  durationMs: number | null;
  error: RunStepError | null;
}

export interface RunDetail {
  id: string;
  workflowId: string;
  workflowName: string;
  trigger: string;
  startedAt: string;
  durationMs: number | null;
  steps: RunStep[];
}

export type RunDetailState =
  | { status: 'loading' }
  | { status: 'success'; data: RunDetail }
  | { status: 'error' };

// Domain shape used through the UI
export interface Run {
  id: string;
  correlationId: string;
  status: RunStatus;
  startedAt: string;
  trigger: string;
  workflowId: string;
  workflowName: string;
  stepsCompleted: number;
  stepsTotal: number;
  durationMs: number | null;
  failedAt: string | null;
}

/** Minimal workflow shape owned by this module (for the workflow filter). */
export interface RunWorkflowOptionDto {
  id: string;
  name: string;
}

export interface RunWorkflowOption {
  id: string;
  name: string;
}

/** 'all' or a workflow id */
export type RunWorkflowFilter = typeof ALL_WORKFLOWS_FILTER | string;

/** Running runs only show under "all" */
export type RunStatusFilter =
  | typeof ALL_RUN_STATUSES_FILTER
  | typeof RUN_STATUS.FAILED
  | typeof RUN_STATUS.SUCCESS;

export interface RunFilters {
  search: string;
  workflowId: RunWorkflowFilter;
  status: RunStatusFilter;
}

export interface ListRunsParams extends RunFilters {
  offset: number;
  limit: number;
}

export interface ListNewRunsParams extends RunFilters {
  /** ISO timestamp of the newest run already shown */
  since: string | null;
}

export interface RunListPageDto {
  runs: RunApiDto[];
  /** Matching runs across all pages */
  total: number;
}

export type RunListState =
  | { status: 'loading' }
  | { status: 'success'; runs: Run[]; total: number }
  | { status: 'error' };

// DTO — one workflow's last-24h numbers
export interface RunWorkflowStatsApiDto {
  workflowId: string;
  runsLast24h: number;
  /** 95th-percentile run time; null when no run has finished */
  p95DurationMs: number | null;
}

// DTO — run counts for the last 24 hours, across all workflows
export interface RunStatsApiDto {
  runsLast24h: number;
  /** Runs that finished with errors */
  needAttentionCount: number;
  workflows: RunWorkflowStatsApiDto[];
}

export interface RunWorkflowStats {
  workflowId: string;
  runsLast24h: number;
  p95DurationMs: number | null;
}

export interface RunStats {
  runsLast24h: number;
  needAttentionCount: number;
  /** Keyed by workflow id, for the grouped view's headers */
  byWorkflow: ReadonlyMap<string, RunWorkflowStats>;
}

export interface RunGroup {
  workflowId: string;
  workflowName: string;
  runs: Run[];
  failedCount: number;
}

// ── Component props ──────────────────────────────────────────────

export interface RunStatusBadgeProps {
  status: RunStatus;
}

export interface RunsToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  workflowFilter: RunWorkflowFilter;
  onWorkflowFilterChange: (value: RunWorkflowFilter) => void;
  workflowOptions: RunWorkflowOption[];
  statusFilter: RunStatusFilter;
  onStatusFilterChange: (value: RunStatusFilter) => void;
  isGrouped: boolean;
  onGroupedChange: (isGrouped: boolean) => void;
  isRefreshing: boolean;
  onRefresh: () => void;
  /** Null until the counts load */
  stats: RunStats | null;
  disabled?: boolean;
}

export interface RunStatsBadgesProps {
  stats: RunStats;
  /** True while the list shows only runs with errors */
  isShowingNeedAttention: boolean;
  onShowNeedAttention: () => void;
}

export interface RunTableProps {
  runs: Run[];
  isLoading: boolean;
  isGrouped: boolean;
  /** Runs that arrived on the latest refresh, highlighted briefly */
  freshRunIds: ReadonlySet<string>;
  /** Per-workflow 24h numbers for the group headers; null until loaded */
  stats: RunStats | null;
  emptyState: ReactNode;
  footer?: ReactNode;
  onOpenWorkflow: (detail: RunDetail) => void;
  onOpenRawLogs: (detail: RunDetail) => void;
}

export interface RunTableRowProps {
  run: Run;
  isFresh: boolean;
  isExpanded: boolean;
  /** id of the detail row this row expands */
  detailId: string;
  onToggleExpanded: (run: Run) => void;
}

export interface RunDetailRowProps {
  run: Run;
  id: string;
  onOpenWorkflow: (detail: RunDetail) => void;
  onOpenRawLogs: (detail: RunDetail) => void;
}

export interface RunDetailPanelProps {
  detail: RunDetail;
  onOpenWorkflow: (detail: RunDetail) => void;
  onOpenRawLogs: (detail: RunDetail) => void;
}

export interface RunStepTimelineProps {
  /** Every step, in order — numbering comes from here */
  steps: RunStep[];
  /** Steps hidden from view (e.g. instant ones) */
  hiddenStepIds: ReadonlySet<string>;
  /** Total run time — the timeline's full width */
  totalMs: number;
  onOpenRawLogs: () => void;
}

export interface RunStepItemProps {
  step: RunStep;
  /** 1-based position in the run */
  stepNumber: number;
  totalMs: number;
  onOpenRawLogs: () => void;
}

export interface RunStepErrorCalloutProps {
  error: RunStepError;
  stepNumber: number;
  onOpenRawLogs: () => void;
}

export interface RunGroupHeaderRowProps {
  group: RunGroup;
  stats: RunWorkflowStats | undefined;
  isCollapsed: boolean;
  onToggleCollapsed: (workflowId: string) => void;
}

export interface RunListFooterProps {
  loadedCount: number;
  total: number;
  isLoadingMore: boolean;
  onLoadMore: () => void;
}

export interface LogsPlaceholderProps {
  title: string;
  description: string;
}

// ── Raw application events ───────────────────────────────────────

export type RawEventLevel =
  (typeof RAW_EVENT_LEVEL)[keyof typeof RAW_EVENT_LEVEL];

export type RawEventStatus =
  (typeof RAW_EVENT_STATUS)[keyof typeof RAW_EVENT_STATUS];

export type RawEventLevelFilter = typeof ALL_RAW_EVENTS_FILTER | RawEventLevel;

export type RawEventStatusFilter =
  | typeof ALL_RAW_EVENTS_FILTER
  | RawEventStatus;

// DTO — one application log event (currently mocks/rawEvents.ts)
export interface RawEventApiDto {
  id: string;
  /** ISO timestamp */
  occurredAt: string;
  level: RawEventLevel;
  status: RawEventStatus;
  /** Instance that wrote the event, e.g. "healthconnect-ip-10-0-2-58.ec2.internal-34" */
  source: string;
  message: string;
  correlationId: string | null;
}

export interface RawEvent {
  id: string;
  occurredAt: string;
  level: RawEventLevel;
  status: RawEventStatus;
  source: string;
  message: string;
  correlationId: string | null;
}

export interface RawEventFilters {
  search: string;
  level: RawEventLevelFilter;
  status: RawEventStatusFilter;
  /** ISO bounds, inclusive; null = open-ended */
  from: string | null;
  to: string | null;
}

export interface ListRawEventsParams extends RawEventFilters {
  /** 1-based */
  page: number;
  pageSize: number;
}

export interface RawEventPageDto {
  events: RawEventApiDto[];
  /** Matching events across all pages */
  total: number;
}

export type RawEventListState =
  | { status: 'loading' }
  | { status: 'success'; events: RawEvent[]; total: number }
  | { status: 'error' };

export interface RawEventsToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  dateRange: DateRange | undefined;
  onDateRangeChange: (range: DateRange | undefined) => void;
  status: RawEventStatusFilter;
  onStatusChange: (value: RawEventStatusFilter) => void;
  level: RawEventLevelFilter;
  onLevelChange: (value: RawEventLevelFilter) => void;
  isRefreshing: boolean;
  onRefresh: () => void;
  disabled?: boolean;
}

export interface RawEventTableProps {
  events: RawEvent[];
  isLoading: boolean;
  emptyState: ReactNode;
  footer?: ReactNode;
}

export interface RawEventRowProps {
  event: RawEvent;
  isExpanded: boolean;
  detailId: string;
  onToggleExpanded: (event: RawEvent) => void;
}

export interface RawEventDetailRowProps {
  event: RawEvent;
  id: string;
}

export interface CopyableIdProps {
  value: string;
  /** Lower-case noun for the copy button, e.g. "event ID" */
  label: string;
}

export interface RawEventStatusBadgeProps {
  status: RawEventStatus;
}

export interface RawEventLevelBadgeProps {
  level: RawEventLevel;
}
