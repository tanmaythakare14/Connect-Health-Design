import type {
  ListNewRunsParams,
  ListRawEventsParams,
  ListRunsParams,
  RawEventPageDto,
  RunApiDto,
  RunDetailApiDto,
  RunListPageDto,
  RunStatsApiDto,
  RunWorkflowOptionDto,
} from '../@types';
import {
  completeMockRuns,
  getMockRunDetail,
  getMockRuns,
  getMockRunStats,
  getMockRunWorkflows,
  spawnMockLiveRuns,
} from '../mocks/runs';
import { getMockRawEvents } from '../mocks/rawEvents';
import { matchesRawEventFilters, matchesRunFilters } from '../utils';

const MOCK_LATENCY_MS = 400;
/** Long enough to see refreshed runs as "Running" before they finish */
const MOCK_RUN_COMPLETION_MS = 1600;

const simulateLatency = (ms = MOCK_LATENCY_MS): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

// MOCK:API — no logs endpoints exist yet. Replace each body with a fetch to
// `${config.apiUrl}/api/v1/...` (see .claude/rules/api.md) and delete the mocks.

/** One page of runs, newest first (GET /logs/runs?search&workflowId&status&offset&limit). */
export async function listRuns(
  params: ListRunsParams,
): Promise<RunListPageDto> {
  await simulateLatency();
  const matching = getMockRuns().filter((run) =>
    matchesRunFilters(run, params),
  );
  return {
    runs: matching
      .slice(params.offset, params.offset + params.limit)
      .map((run) => ({ ...run })),
    total: matching.length,
  };
}

/** Runs started after `since` that match the filters (GET /logs/runs?since=…). */
export async function listNewRuns(
  params: ListNewRunsParams,
): Promise<RunApiDto[]> {
  await simulateLatency();
  return spawnMockLiveRuns()
    .filter((run) => matchesRunFilters(run, params))
    .map((run) => ({ ...run }));
}

/** Latest state of specific runs, e.g. ones still running (GET /logs/runs?ids=…). */
export async function getRunsByIds(ids: string[]): Promise<RunApiDto[]> {
  await simulateLatency(MOCK_RUN_COMPLETION_MS);
  return completeMockRuns(ids);
}

/** Run counts for the last 24 hours (GET /logs/runs/stats?window=24h). */
export async function getRunStats(): Promise<RunStatsApiDto> {
  await simulateLatency();
  return getMockRunStats();
}

/** A run with its step-by-step timeline (GET /logs/runs/:id). */
export async function getRunDetail(runId: string): Promise<RunDetailApiDto> {
  await simulateLatency();
  const detail = getMockRunDetail(runId);
  if (!detail) {
    throw new Error(`Unknown run: ${runId}`);
  }
  return detail;
}

/** Workflows for the filter (GET /workflows?fields=id,name). */
export async function listRunWorkflowOptions(): Promise<
  RunWorkflowOptionDto[]
> {
  await simulateLatency();
  return getMockRunWorkflows();
}

/**
 * One page of application events, newest first
 * (GET /logs/events?search&level&status&from&to&page&pageSize).
 */
export async function listRawEvents(
  params: ListRawEventsParams,
): Promise<RawEventPageDto> {
  await simulateLatency();
  const matching = getMockRawEvents().filter((event) =>
    matchesRawEventFilters(event, params),
  );
  const start = (params.page - 1) * params.pageSize;
  return {
    events: matching
      .slice(start, start + params.pageSize)
      .map((event) => ({ ...event })),
    total: matching.length,
  };
}
