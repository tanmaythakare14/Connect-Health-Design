import { useCallback, useEffect, useState, type JSX } from 'react';
import {
  ArrowRight,
  CircleAlert,
  Clock,
  Layers,
  LayoutDashboard,
  ShieldCheck,
} from 'lucide-react';
import { EmptyState } from '@/components/common';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { logger } from '@/utils/logger';
import type { DashboardScreenProps, DashboardState } from '../../@types';
import { PLATFORM_STANDARDS, RECENT_ACTIVITY_LIMIT } from '../../constants';
import {
  apiDtoToDashboardKpis,
  apiDtoToRecentActivity,
  getDashboardStats,
  listRecentActivity,
} from '../../service';
import { DashboardSection } from '../dashboard-section';
import { KpiCardGrid } from '../kpi-cards';
import { RecentActivityCard } from '../recent-activity';

export function DashboardScreen({
  onViewConnections,
  onViewLogs,
}: DashboardScreenProps): JSX.Element {
  const [state, setState] = useState<DashboardState>({ status: 'loading' });

  const loadDashboard = useCallback(async (): Promise<void> => {
    setState({ status: 'loading' });
    try {
      const [statsDto, activityDtos] = await Promise.all([
        getDashboardStats(),
        listRecentActivity(RECENT_ACTIVITY_LIMIT),
      ]);
      setState({
        status: 'success',
        kpis: apiDtoToDashboardKpis(statsDto),
        recentActivity: activityDtos.map(apiDtoToRecentActivity),
      });
    } catch (error) {
      logger.error('Loading the dashboard failed', { error });
      setState({ status: 'error' });
    }
  }, []);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  const isLoading = state.status === 'loading';

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Dashboard
          </h1>
          {/* Standards chips share the subheading's line, centred on it */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <p className="text-sm text-muted-foreground">
              Overview of your Health System connections
            </p>
            <ul
              aria-label="Supported standards"
              className="flex items-center gap-2"
            >
              {PLATFORM_STANDARDS.map((standard, index) => (
                // flex li: no inline line box, so the badge centres exactly
                <li key={standard} className="flex">
                  <Badge
                    variant="outline"
                    className="h-6 gap-1 rounded-md border-primary/25 bg-accent px-2 font-medium text-accent-foreground"
                  >
                    {index === 0 && (
                      <ShieldCheck aria-hidden className="size-3" />
                    )}
                    {standard}
                  </Badge>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {state.status === 'error' ? (
        <div className="rounded-xl border bg-card">
          <EmptyState
            tone="destructive"
            icon={CircleAlert}
            title="Dashboard didn’t load"
            description="We couldn’t load your overview. Please try again."
            action={
              <Button
                variant="outline"
                size="sm"
                onClick={() => void loadDashboard()}
              >
                Try again
              </Button>
            }
          />
        </div>
      ) : (
        <>
          <DashboardSection
            id="dashboard-overview"
            icon={LayoutDashboard}
            title="Platform overview"
            description="Live counts across your connections, workflows and licenses"
            action={
              <Button onClick={onViewConnections}>
                <Layers aria-hidden />
                View Connections
              </Button>
            }
          >
            <KpiCardGrid
              kpis={state.status === 'success' ? state.kpis : []}
              isLoading={isLoading}
            />
          </DashboardSection>

          <DashboardSection
            id="dashboard-recent-activity"
            variant="plain"
            icon={Clock}
            title="Recent activity"
            description="The latest actions taken by people and workflows"
            action={
              <Button
                variant="outline"
                onClick={onViewLogs}
                className="border-primary bg-card text-primary hover:bg-accent hover:text-primary"
              >
                View all logs
                <ArrowRight aria-hidden />
              </Button>
            }
          >
            <RecentActivityCard
              activity={state.status === 'success' ? state.recentActivity : []}
              isLoading={isLoading}
            />
          </DashboardSection>
        </>
      )}
    </div>
  );
}
