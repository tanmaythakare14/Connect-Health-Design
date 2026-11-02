import type { JSX } from 'react';
import { cva } from 'class-variance-authority';
import { Cloud, KeyRound, type LucideIcon } from 'lucide-react';
import type { LicenseSourceItemProps, LicenseSourceType } from '../../@types';
import { usageRatio } from '../../utils';
import { StatusPill } from '../shared';

const SOURCE_ICONS: Record<LicenseSourceType, LucideIcon> = {
  aws_marketplace: Cloud,
  connecthealth: KeyRound,
};

const iconTileVariants = cva(
  'flex size-10 shrink-0 items-center justify-center rounded-xl',
  {
    variants: {
      type: {
        aws_marketplace:
          'bg-teal-50 text-teal-600 dark:bg-teal-950/40 dark:text-teal-400',
        connecthealth: 'bg-accent text-primary',
      },
    },
  },
);

const barVariants = cva('', {
  variants: {
    type: {
      aws_marketplace: 'fill-teal-500',
      connecthealth: 'fill-primary',
    },
  },
});

/** One license source: name, connections in use, status and a usage bar. */
export function LicenseSourceItem({
  source,
}: LicenseSourceItemProps): JSX.Element {
  const Icon = SOURCE_ICONS[source.type];
  const ratio = usageRatio(source.inUse, source.connections);

  return (
    <li className="space-y-3 rounded-xl border bg-card p-4 transition-colors hover:border-primary/30">
      <div className="flex items-center gap-3">
        <span className={iconTileVariants({ type: source.type })}>
          <Icon aria-hidden className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-foreground">
            {source.name}
          </p>
          <p className="text-xs text-muted-foreground tabular-nums">
            {source.connections} connections · {source.inUse} in use
          </p>
        </div>
        <StatusPill
          isPositive={source.isActive}
          label={source.isActive ? 'Active' : 'Inactive'}
        />
      </div>

      {/* SVG keeps the bar data-driven without inline styles */}
      <svg
        role="img"
        aria-label={`${source.inUse} of ${source.connections} connections in use`}
        className="h-1.5 w-full"
        preserveAspectRatio="none"
      >
        <rect width="100%" height="100%" rx="3" className="fill-muted" />
        <rect
          width={`${ratio * 100}%`}
          height="100%"
          rx="3"
          className={barVariants({ type: source.type })}
        />
      </svg>
    </li>
  );
}
