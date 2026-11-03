import type { JSX } from 'react';
import type { ConnectionSourceCellProps } from '../../@types';
import { CONNECTION_SOURCE_LABELS } from '../../constants';
import { getEhrLogo } from '../../utils';
import { EhrLogo } from '../shared';

export function ConnectionSourceCell({
  source,
}: ConnectionSourceCellProps): JSX.Element {
  const label = CONNECTION_SOURCE_LABELS[source];
  const logo = getEhrLogo(source);

  // The wordmark carries the name; alt and title keep it readable and hoverable.
  if (logo) {
    return (
      <span title={label} className="inline-flex">
        <EhrLogo src={logo} alt={label} className="h-8 max-w-32 px-2 py-1.5" />
      </span>
    );
  }

  // Monogram tile for sources without a logo yet.
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
