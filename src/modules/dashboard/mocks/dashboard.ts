import type { DashboardStatsApiDto, RecentActivityApiDto } from '../@types';
import { ACTIVITY_STATUS } from '../constants';

/** MOCK headline counts. Delete once getDashboardStats() calls the API. */
export const MOCK_DASHBOARD_STATS: DashboardStatsApiDto = {
  connections: { active: 67, total: 97 },
  workflows: { active: 81, total: 95 },
  licenses: { used: 20, total: 35 },
};

const MINUTE_MS = 60 * 1000;

const ACTIVITY_TEMPLATES: Array<
  Omit<RecentActivityApiDto, 'id' | 'occurredAt'> & { minutesAgo: number }
> = [
  {
    minutesAgo: 8,
    actorName: 'Workflow Engine',
    action: 'Flow execution',
    status: ACTIVITY_STATUS.SUCCESS,
  },
  {
    minutesAgo: 8,
    actorName: 'Workflow Engine',
    action: 'Flow execution',
    status: ACTIVITY_STATUS.SUCCESS,
  },
  {
    minutesAgo: 10,
    actorName: 'ch-design',
    action: 'All workflows listed',
    status: ACTIVITY_STATUS.SUCCESS,
  },
  {
    minutesAgo: 10,
    actorName: 'ch-design',
    action: 'All workflows listed',
    status: ACTIVITY_STATUS.SUCCESS,
  },
  {
    minutesAgo: 12,
    actorName: 'Workflow Engine',
    action: 'Flow execution',
    status: ACTIVITY_STATUS.SUCCESS,
  },
  {
    minutesAgo: 16,
    actorName: 'ch-design',
    action: 'All workflows listed',
    status: ACTIVITY_STATUS.SUCCESS,
  },
  {
    minutesAgo: 16,
    actorName: 'Administrator',
    action: 'Connection retrieved',
    status: ACTIVITY_STATUS.SUCCESS,
  },
  {
    minutesAgo: 16,
    actorName: 'Administrator',
    action: 'Connections listed',
    status: ACTIVITY_STATUS.SUCCESS,
  },
  {
    minutesAgo: 24,
    actorName: 'Administrator',
    action: 'Connection updated',
    status: ACTIVITY_STATUS.SUCCESS,
  },
  {
    minutesAgo: 41,
    actorName: 'tanmay',
    action: 'Workflow created',
    status: ACTIVITY_STATUS.SUCCESS,
  },
  {
    minutesAgo: 58,
    actorName: 'Administrator',
    action: 'API key revoked',
    status: ACTIVITY_STATUS.SUCCESS,
  },
];

/** MOCK recent audit entries, newest first, relative to page load. */
export function buildMockRecentActivity(): RecentActivityApiDto[] {
  const now = Date.now();
  return ACTIVITY_TEMPLATES.map(({ minutesAgo, ...entry }, index) => ({
    ...entry,
    id: `act-${index + 1}`,
    occurredAt: new Date(now - minutesAgo * MINUTE_MS).toISOString(),
  }));
}
