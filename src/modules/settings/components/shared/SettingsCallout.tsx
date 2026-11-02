import { useId, type JSX } from 'react';
import type { SettingsCalloutProps } from '../../@types';

/** Soft amber notice for security guidance under a settings screen. */
export function SettingsCallout({
  title,
  icon: Icon,
  children,
}: SettingsCalloutProps): JSX.Element {
  const headingId = useId();

  return (
    <section
      aria-labelledby={headingId}
      className="flex gap-3 rounded-xl border border-amber-200 bg-amber-50 px-5 py-4 dark:border-amber-900/60 dark:bg-amber-950/30"
    >
      <Icon
        aria-hidden
        className="mt-0.5 size-5 shrink-0 text-amber-600 dark:text-amber-400"
      />
      <div className="min-w-0 space-y-2">
        <h3
          id={headingId}
          className="text-sm font-semibold text-amber-800 dark:text-amber-200"
        >
          {title}
        </h3>
        <div className="text-sm text-amber-800/90 dark:text-amber-200/90">
          {children}
        </div>
      </div>
    </section>
  );
}
