import type { JSX } from 'react';
import type { ConnectionSourceCellProps } from '../../@types';
import { CONNECTION_SOURCE_LABELS } from '../../constants';

export function ConnectionSourceCell({
  source,
}: ConnectionSourceCellProps): JSX.Element {
  const label = CONNECTION_SOURCE_LABELS[source];

  // Monogram tile stands in for vendor logos until those assets are supplied.
  return (
    <div className="flex items-center gap-2.5">
      <span
        aria-hidden
        className="flex size-7 shrink-0 items-center justify-center rounded-md border bg-background text-xs font-semibold text-muted-foreground"
      >
        {label.charAt(0)}
      </span>
      <span className="truncate text-sm text-foreground">{label}</span>
    </div>
  );
}
