import type { JSX } from 'react';
import { cn } from '@/lib/utils';
import type { UsageStatTilesProps } from '../../../@types';

/** Four headline numbers; the first (used / plan) is highlighted. */
export function UsageStatTiles({ usage }: UsageStatTilesProps): JSX.Element {
  const tiles = [
    {
      label: 'Used / plan',
      value: (
        <>
          {usage.usedSlots}
          <span className="text-base font-medium text-muted-foreground">
            {' '}
            / {usage.planSlots}
          </span>
        </>
      ),
      isHighlighted: true,
    },
    { label: 'Connections remaining', value: usage.remainingSlots },
    { label: 'Active connections', value: usage.activeConnections },
    { label: 'Total connections', value: usage.totalConnections },
  ];

  return (
    <dl className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {tiles.map((tile) => (
        <div
          key={tile.label}
          className={cn(
            'flex flex-col-reverse gap-1 rounded-xl border p-4',
            tile.isHighlighted ? 'border-primary/25 bg-accent' : 'bg-muted/30',
          )}
        >
          <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            {tile.label}
          </dt>
          <dd
            className={cn(
              'text-2xl font-semibold tracking-tight tabular-nums',
              tile.isHighlighted ? 'text-primary' : 'text-foreground',
            )}
          >
            {tile.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}
