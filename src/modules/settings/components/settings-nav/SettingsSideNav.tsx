import type { JSX } from 'react';
import { cn } from '@/lib/utils';
import { SettingsSideNavItem } from './SettingsSideNavItem';
import type { SettingsSideNavProps } from '../../@types';

/**
 * The Settings side menu: one entry per section.
 * It fills its parent's height on large screens and doesn't scroll with the
 * content; below lg it becomes a horizontally scrolling strip.
 */
export function SettingsSideNav({
  items,
  activeId,
  onSelect,
  ariaLabel,
  className,
}: SettingsSideNavProps): JSX.Element {
  return (
    <nav
      aria-label={ariaLabel}
      className={cn(
        'shrink-0 rounded-xl border bg-card p-2 shadow-sm lg:h-full lg:w-60',
        className,
      )}
    >
      <ul className="flex gap-1 overflow-x-auto lg:flex-col lg:overflow-visible">
        {items.map((item) => (
          <li key={item.id} className="lg:w-full">
            <SettingsSideNavItem
              item={item}
              isActive={item.id === activeId}
              onSelect={onSelect}
            />
          </li>
        ))}
      </ul>
    </nav>
  );
}
