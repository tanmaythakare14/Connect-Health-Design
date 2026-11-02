import type { JSX } from 'react';
import type { SettingsPageHeaderProps } from '../../@types';

/** Heading, subheading and optional actions at the top of a settings screen. */
export function SettingsPageHeader({
  section,
  actions,
}: SettingsPageHeaderProps): JSX.Element {
  const { icon: Icon, label, description } = section;

  return (
    <div className="flex flex-wrap items-start justify-between gap-4 border-b pb-5">
      <div className="flex min-w-0 items-start gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-accent text-primary">
          <Icon aria-hidden className="size-5" />
        </span>
        <div className="min-w-0 space-y-0.5">
          <h2 className="text-lg font-semibold tracking-tight text-foreground">
            {label}
          </h2>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}
