import type { JSX } from 'react';
import { Moon } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { SidebarNavItem } from './SidebarNavItem';
import type { ThemeToggleItemProps } from './types';

const THEME_SWITCH_ID = 'sidebar-theme-switch';

export function ThemeToggleItem({
  isCollapsed,
  isDark,
  onToggle,
}: ThemeToggleItemProps): JSX.Element {
  // Collapsed: icon-only button (with tooltip). Expanded: labelled switch row.
  if (isCollapsed) {
    return (
      <SidebarNavItem
        icon={Moon}
        label="Dark mode"
        isCollapsed
        role="switch"
        aria-checked={isDark}
        onClick={onToggle}
      />
    );
  }

  return (
    <div className="group flex h-10 items-center gap-3 rounded-md px-2.5 text-sm font-medium text-sidebar-foreground transition-colors duration-150 hover:bg-sidebar-accent hover:text-foreground">
      <Moon
        aria-hidden
        className="size-5 shrink-0 transition-transform duration-200 ease-out group-hover:scale-110"
      />
      <Label
        htmlFor={THEME_SWITCH_ID}
        className="flex-1 cursor-pointer truncate"
      >
        Dark mode
      </Label>
      <Switch
        id={THEME_SWITCH_ID}
        checked={isDark}
        onCheckedChange={onToggle}
      />
    </div>
  );
}
