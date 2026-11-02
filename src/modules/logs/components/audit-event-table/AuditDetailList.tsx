import type { JSX } from 'react';
import type { AuditDetailListProps } from '../../@types';

/** A titled group of label / value lines, right-aligned values, thin dividers. */
export function AuditDetailList({
  title,
  icon: Icon,
  items,
}: AuditDetailListProps): JSX.Element {
  return (
    <section className="min-w-0 space-y-2">
      <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
        <Icon aria-hidden className="size-4 text-muted-foreground" />
        {title}
      </h3>
      <dl className="divide-y divide-border/70">
        {items.map((item) => (
          <div
            key={item.label}
            className="flex items-start justify-between gap-6 py-2.5 text-sm"
          >
            <dt className="shrink-0 text-muted-foreground">{item.label}</dt>
            <dd className="min-w-0 text-right break-all text-foreground">
              {item.value}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
