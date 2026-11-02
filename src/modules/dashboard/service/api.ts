import type { DashboardStatsApiDto, RecentActivityApiDto } from '../@types';
import {
  buildMockRecentActivity,
  MOCK_DASHBOARD_STATS,
} from '../mocks/dashboard';

const MOCK_LATENCY_MS = 400;

const simulateLatency = (): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, MOCK_LATENCY_MS));

// MOCK:API — no dashboard endpoints exist yet. Replace each body with a fetch
// to `${config.apiUrl}/api/v1/...` (see .claude/rules/api.md) and delete the mocks.

/** Headline counts for the KPI cards (GET /dashboard/stats). */
export async function getDashboardStats(): Promise<DashboardStatsApiDto> {
  await simulateLatency();
  return {
    connections: { ...MOCK_DASHBOARD_STATS.connections },
    workflows: { ...MOCK_DASHBOARD_STATS.workflows },
    licenses: { ...MOCK_DASHBOARD_STATS.licenses },
  };
}

/** The latest audit entries, newest first (GET /logs/audit?limit=…). */
export async function listRecentActivity(
  limit: number,
): Promise<RecentActivityApiDto[]> {
  await simulateLatency();
  return buildMockRecentActivity().slice(0, limit);
}
