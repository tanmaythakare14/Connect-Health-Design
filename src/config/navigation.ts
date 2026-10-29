import {
  BookOpen,
  Cable,
  LayoutDashboard,
  Play,
  ScrollText,
  Settings,
  Shuffle,
  Workflow,
} from 'lucide-react';
import connectHealthLogo from '@/assets/connecthealth-logo.svg';
import type { HelpGuide, NavItem } from '@/components/layouts/types';

export const PRODUCT_NAME = 'ConnectHealth';

export const PRODUCT_LOGO_SRC = connectHealthLogo;

export const MAIN_NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'workflows', label: 'Workflows', icon: Workflow },
  { id: 'mappings', label: 'Mappings', icon: Shuffle },
  { id: 'connections', label: 'Connections', icon: Cable },
  { id: 'logs', label: 'Logs', icon: ScrollText },
];

export const SETTINGS_NAV_ITEM: NavItem = {
  id: 'settings',
  label: 'Settings',
  icon: Settings,
};

export const GET_STARTED_GUIDES: HelpGuide[] = [
  {
    id: 'welcome-tour',
    title: 'Welcome tour',
    description: 'A two-minute tour of the platform',
    steps: 11,
    icon: Play,
  },
];

/** "On this page" guides, keyed by nav item id. Pages without an entry hide the section. */
export const PAGE_GUIDES: Record<string, HelpGuide[]> = {
  dashboard: [
    {
      id: 'dashboard-guide',
      title: 'Dashboard guide',
      description: 'Your connection and workflow counts, and recent activity',
      steps: 2,
      icon: BookOpen,
      isNew: true,
    },
  ],
};
