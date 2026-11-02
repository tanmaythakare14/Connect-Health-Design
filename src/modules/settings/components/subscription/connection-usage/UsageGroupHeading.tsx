import type { JSX } from 'react';
import type { UsageGroupHeadingProps } from '../../../@types';

/** "Using a slot (20)"-style group title with a tinted icon. */
export function UsageGroupHeading({
  icon: Icon,
  title,
  count,
}: UsageGroupHeadingProps): JSX.Element {
  return (
    <h4 className="flex items-center gap-2 text-sm font-semibold text-foreground">
      <Icon
        aria-hidden
        className="size-4 text-emerald-600 dark:text-emerald-400"
      />
      {title}
      <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground tabular-nums">
        {count}
      </span>
    </h4>
  );
}
