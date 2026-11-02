import type { JSX } from 'react';
import type { SettingsCardProps } from '../../@types';

/**
 * A titled group of related settings: icon, heading and description (with
 * an optional action on the right), then content.
 */
export function SettingsCard({
  id,
  title,
  description,
  icon: Icon,
  action,
  children,
}: SettingsCardProps): JSX.Element {
  const headingId = `${id}-heading`;

  return (
    <section
      aria-labelledby={headingId}
      className="overflow-hidden rounded-xl border bg-card"
    >
      <div className="flex items-start justify-between gap-4 border-b px-5 py-4">
        <div className="flex min-w-0 items-start gap-3">
          <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-accent text-primary">
            <Icon aria-hidden className="size-4" />
          </span>
          <div className="min-w-0 space-y-0.5">
            <h3
              id={headingId}
              className="text-sm font-semibold text-foreground"
            >
              {title}
            </h3>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
      <div className="px-5 py-4">{children}</div>
    </section>
  );
}
