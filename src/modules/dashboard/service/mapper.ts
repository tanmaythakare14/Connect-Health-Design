import type {
  DashboardKpi,
  DashboardStatsApiDto,
  RecentActivity,
  RecentActivityApiDto,
} from '../@types';
import { KPI_ID } from '../constants';

/** Counts → the three KPI cards, in display order. */
export function apiDtoToDashboardKpis(
  dto: DashboardStatsApiDto,
): DashboardKpi[] {
  const { connections, workflows, licenses } = dto;

  return [
    {
      id: KPI_ID.CONNECTIONS,
      title: 'Active connections',
      value: connections.active,
      caption: `Total connections: ${connections.total}`,
    },
    {
      id: KPI_ID.WORKFLOWS,
      title: 'Active workflows',
      value: workflows.active,
      caption: `Total workflows: ${workflows.total}`,
    },
    {
      id: KPI_ID.LICENSES,
      title: 'License remaining',
      value: Math.max(0, licenses.total - licenses.used),
      caption: `License used: ${licenses.used}`,
    },
  ];
}

export function apiDtoToRecentActivity(
  dto: RecentActivityApiDto,
): RecentActivity {
  return {
    id: dto.id,
    occurredAt: dto.occurredAt,
    actorName: dto.actorName,
    action: dto.action,
    status: dto.status,
  };
}
