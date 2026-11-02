import type { JSX } from 'react';
import { cva } from 'class-variance-authority';
import { CircleCheck, Layers, Workflow, type LucideIcon } from 'lucide-react';
import type { KpiCardProps, KpiId } from '../../@types';

const KPI_ICONS: Record<KpiId, LucideIcon> = {
  connections: CircleCheck,
  workflows: Workflow,
  licenses: Layers,
};

const iconTileVariants = cva(
  'flex size-11 shrink-0 items-center justify-center rounded-lg',
  {
    variants: {
      id: {
        connections:
          'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400',
        workflows:
          'bg-teal-50 text-teal-600 dark:bg-teal-950/40 dark:text-teal-400',
        licenses: 'bg-accent text-primary',
      },
    },
  },
);

/** Icon, then the headline number with its context line. */
export function KpiCard({ kpi }: KpiCardProps): JSX.Element {
  const Icon = KPI_ICONS[kpi.id];

  return (
    <article className="flex items-center gap-4 rounded-xl border bg-card p-5 shadow-sm">
      <span className={iconTileVariants({ id: kpi.id })}>
        <Icon aria-hidden className="size-5" />
      </span>
      <div className="min-w-0">
        <h2 className="text-lg font-semibold tracking-tight text-foreground">
          {kpi.title}: <span className="tabular-nums">{kpi.value}</span>
        </h2>
        <p className="text-sm text-muted-foreground">{kpi.caption}</p>
      </div>
    </article>
  );
}
