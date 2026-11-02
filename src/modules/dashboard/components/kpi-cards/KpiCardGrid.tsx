import type { JSX } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import type { KpiCardGridProps } from '../../@types';
import { SKELETON_KPI_COUNT } from '../../constants';
import { KpiCard } from './KpiCard';

const GRID_CLASS_NAME = 'grid grid-cols-1 gap-4 md:grid-cols-3';

export function KpiCardGrid({
  kpis,
  isLoading,
}: KpiCardGridProps): JSX.Element {
  if (isLoading) {
    return (
      <div className={GRID_CLASS_NAME} aria-busy>
        {Array.from({ length: SKELETON_KPI_COUNT }, (_, index) => (
          <div
            key={index}
            className="flex items-center gap-4 rounded-xl border bg-card p-5"
          >
            <Skeleton className="size-11 rounded-lg bg-muted" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-40 bg-muted" />
              <Skeleton className="h-4 w-28 bg-muted" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={GRID_CLASS_NAME}>
      {kpis.map((kpi) => (
        <KpiCard key={kpi.id} kpi={kpi} />
      ))}
    </div>
  );
}
