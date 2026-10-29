import type { ComponentProps, ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import type { Button } from '@/components/ui/button';

export interface NavItem {
  id: string;
  label: string;
  icon: LucideIcon;
}

export interface AppUser {
  name: string;
}

export interface HelpGuide {
  id: string;
  title: string;
  description: string;
  steps: number;
  icon: LucideIcon;
  isNew?: boolean;
}

export interface AppTopBarProps {
  user: AppUser;
  logoSrc: string;
  productName: string;
  isSidebarCollapsed: boolean;
  onToggleSidebar: () => void;
}

export interface AppSidebarProps {
  items: NavItem[];
  activeItemId: string;
  isCollapsed: boolean;
  onNavigate: (itemId: string) => void;
  /** Pinned to the bottom of the sidebar (help, settings, theme, logout). */
  footer?: ReactNode;
}

export interface SidebarNavItemProps extends ComponentProps<typeof Button> {
  icon: LucideIcon;
  label: string;
  isCollapsed: boolean;
  isActive?: boolean;
  /** Shows the label in a tooltip while collapsed. Off for items that open their own popover. */
  showTooltip?: boolean;
  /** Extra content on the right of the label (hidden while collapsed). */
  trailing?: ReactNode;
}

export interface HelpGuidesPopoverProps {
  isCollapsed: boolean;
  getStartedGuides: HelpGuide[];
  pageGuides: HelpGuide[];
  autoOpenDisabled: boolean;
  onToggleAutoOpen: () => void;
  onStartGuide: (guideId: string) => void;
}

export interface HelpGuideItemProps {
  guide: HelpGuide;
  onSelect: (guideId: string) => void;
}

export interface ThemeToggleItemProps {
  isCollapsed: boolean;
  isDark: boolean;
  onToggle: () => void;
}

export interface AppShellProps {
  user: AppUser;
  activeItemId: string;
  onNavigate: (itemId: string) => void;
  onLogout: () => void;
  onStartGuide: (guideId: string) => void;
  children: ReactNode;
}
