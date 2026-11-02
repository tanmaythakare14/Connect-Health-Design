import type { JSX } from 'react';
import type { AuditConnectionCellProps } from '../../@types';

/** EHR monogram + name + type, or a dash when the event touched no connection. */
export function AuditConnectionCell({
  name,
  type,
}: AuditConnectionCellProps): JSX.Element {
  if (!name) {
    return <span className="text-muted-foreground">—</span>;
  }

  return (
    <div className="flex min-w-0 items-center gap-2.5">
      <span
        aria-hidden
        className="flex size-8 shrink-0 items-center justify-center rounded-md border bg-background text-xs font-semibold text-primary uppercase"
      >
        {name.slice(0, 2)}
      </span>
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-foreground capitalize">
          {name}
        </p>
        {type && (
          <p className="truncate text-xs text-muted-foreground">{type}</p>
        )}
      </div>
    </div>
  );
}
