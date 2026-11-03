import type { JSX } from 'react';
import { LineTabsList, LineTabsTrigger } from '@/components/common';
import { cn } from '@/lib/utils';
import type { SettingsTabsProps } from '../../@types';

/**
 * The Settings menu as line tabs, one per section — the same tab bar as Logs.
 * Render inside a `Tabs` root; it scrolls sideways when the tabs don't fit.
 */
export function SettingsTabs({
  items,
  ariaLabel,
  className,
}: SettingsTabsProps): JSX.Element {
  return (
    <LineTabsList
      aria-label={ariaLabel}
      className={cn('overflow-x-auto overflow-y-hidden', className)}
    >
      {items.map(({ id, label }) => (
        <LineTabsTrigger key={id} value={id}>
          {label}
        </LineTabsTrigger>
      ))}
    </LineTabsList>
  );
}
