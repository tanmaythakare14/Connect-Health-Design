import type { JSX } from 'react';
import { cn } from '@/lib/utils';
import { SideNavPanelItem } from './SideNavPanelItem';
import type { SideNavPanelProps } from './types';

/**
 * A secondary side menu for screens with sub-sections (e.g. Settings).
 * It fills its parent's height on large screens and doesn't scroll with the
 * content; below lg it becomes a horizontally scrolling strip.
 */
export function SideNavPanel<TId extends string>({
  items,
  activeId,
  onSelect,
  ariaLabel,
  className,
}: SideNavPanelProps<TId>): JSX.Element {
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
            <SideNavPanelItem
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
