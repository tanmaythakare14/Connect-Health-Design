import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import type { ACTIVITY_STATUS, KPI_ID } from '../constants';

export type KpiId = (typeof KPI_ID)[keyof typeof KPI_ID];

export type ActivityStatus =
  (typeof ACTIVITY_STATUS)[keyof typeof ACTIVITY_STATUS];

// DTO — headline counts (currently mocks/dashboard.ts)
export interface DashboardStatsApiDto {
  connections: { active: number; total: number };
  workflows: { active: number; total: number };
  licenses: { used: number; total: number };
}

// DTO — one recent audit entry
export interface RecentActivityApiDto {
  id: string;
  /** ISO timestamp */
  occurredAt: string;
  actorName: string;
  /** Human summary, e.g. "All workflows listed" */
  action: string;
  status: ActivityStatus;
}

/** One KPI card, ready to render. */
export interface DashboardKpi {
  id: KpiId;
  title: string;
  value: number;
  /** Second line, e.g. "Total connections: 97" */
  caption: string;
}

export interface RecentActivity {
  id: string;
  occurredAt: string;
  actorName: string;
  action: string;
  status: ActivityStatus;
}

export type DashboardState =
  | { status: 'loading' }
  | {
      status: 'success';
      kpis: DashboardKpi[];
      recentActivity: RecentActivity[];
    }
  | { status: 'error' };

// ── Component props ──────────────────────────────────────────────

export interface DashboardScreenProps {
  onViewConnections: () => void;
  onViewLogs: () => void;
}

export interface KpiCardProps {
  kpi: DashboardKpi;
}

export interface KpiCardGridProps {
  kpis: DashboardKpi[];
  isLoading: boolean;
}

export interface RecentActivityCardProps {
  activity: RecentActivity[];
  isLoading: boolean;
}

export interface DashboardSectionProps {
  /** Ties the section to its heading for screen readers */
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  /** Shown on the right of the heading, e.g. a "View all" button */
  action?: ReactNode;
  /** "contained" (default) wraps the block in a light panel; "plain" doesn't */
  variant?: 'contained' | 'plain';
  children: ReactNode;
}

export interface ActivityStatusBadgeProps {
  status: ActivityStatus;
}
