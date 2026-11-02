import type { JSX } from 'react';
import { cn } from '@/lib/utils';
import type { SideNavPanelItemProps } from './types';

/** One SideNavPanel entry, styled like the app sidebar's items. */
export function SideNavPanelItem<TId extends string>({
  item,
  isActive,
  onSelect,
}: SideNavPanelItemProps<TId>): JSX.Element {
  const { icon: Icon, label } = item;

  return (
    <button
      type="button"
      onClick={() => onSelect(item.id)}
      aria-current={isActive ? 'page' : undefined}
      className={cn(
        'group relative flex h-10 w-full shrink-0 items-center gap-3 rounded-md px-3 text-sm font-medium whitespace-nowrap text-muted-foreground outline-none transition-colors duration-150',
        'hover:bg-sidebar-accent hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50',
        isActive && 'bg-sidebar-accent text-primary hover:text-primary',
      )}
    >
      {/* Active indicator — grows in from the panel's left edge */}
      <span
        aria-hidden
        className={cn(
          'absolute top-1/2 left-0 h-5 w-1 -translate-y-1/2 rounded-r-full bg-primary transition-transform duration-200 ease-out',
          isActive ? 'scale-y-100' : 'scale-y-0',
        )}
      />
      <Icon
        aria-hidden
        className="size-4.5 shrink-0 transition-transform duration-200 ease-out group-hover:scale-110"
      />
      <span className="truncate">{label}</span>
    </button>
  );
}
