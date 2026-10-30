import type { JSX } from 'react';
import { cn } from '@/lib/utils';
import { SidebarNavItem } from './SidebarNavItem';
import type { AppSidebarProps } from './types';

export function AppSidebar({
  items,
  activeItemId,
  isCollapsed,
  onNavigate,
  footer,
}: AppSidebarProps): JSX.Element {
  return (
    <aside
      data-collapsed={isCollapsed}
      className={cn(
        'flex h-full shrink-0 flex-col overflow-x-hidden border-r border-sidebar-border bg-sidebar transition-[width] duration-300 ease-in-out',
        isCollapsed ? 'w-16' : 'w-60',
      )}
    >
      <nav
        aria-label="Main"
        className="relative flex-1 space-y-1 overflow-y-auto p-3"
      >
        {items.map((item) => (
          <SidebarNavItem
            key={item.id}
            icon={item.icon}
            label={item.label}
            isCollapsed={isCollapsed}
            isActive={item.id === activeItemId}
            onClick={() => onNavigate(item.id)}
          />
        ))}
      </nav>

      {footer && (
        <div className="space-y-1 border-t border-sidebar-border p-3">
          {footer}
        </div>
      )}
    </aside>
  );
}
