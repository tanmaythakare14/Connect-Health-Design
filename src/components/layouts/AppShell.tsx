import type { JSX } from 'react';
import { LogOut } from 'lucide-react';
import {
  GET_STARTED_GUIDES,
  MAIN_NAV_ITEMS,
  PAGE_GUIDES,
  PRODUCT_LOGO_SRC,
  PRODUCT_NAME,
  SETTINGS_NAV_ITEM,
} from '@/config/navigation';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  selectGuidesAutoOpenDisabled,
  selectSidebarCollapsed,
  selectTheme,
  toggleGuidesAutoOpen,
  toggleSidebar,
  toggleTheme,
} from '@/store/slices/uiSlice';
import { AppSidebar } from './AppSidebar';
import { AppTopBar } from './AppTopBar';
import { HelpGuidesPopover } from './HelpGuidesPopover';
import { SidebarNavItem } from './SidebarNavItem';
import { ThemeToggleItem } from './ThemeToggleItem';
import type { AppShellProps } from './types';

export function AppShell({
  user,
  activeItemId,
  onNavigate,
  onLogout,
  onStartGuide,
  children,
}: AppShellProps): JSX.Element {
  const dispatch = useAppDispatch();
  const isCollapsed = useAppSelector(selectSidebarCollapsed);
  const theme = useAppSelector(selectTheme);
  const guidesAutoOpenDisabled = useAppSelector(selectGuidesAutoOpenDisabled);

  return (
    <div className="flex h-screen flex-col bg-canvas">
      <AppTopBar
        user={user}
        logoSrc={PRODUCT_LOGO_SRC}
        productName={PRODUCT_NAME}
        isSidebarCollapsed={isCollapsed}
        onToggleSidebar={() => dispatch(toggleSidebar())}
      />

      <div className="flex min-h-0 flex-1">
        <AppSidebar
          items={MAIN_NAV_ITEMS}
          activeItemId={activeItemId}
          isCollapsed={isCollapsed}
          onNavigate={onNavigate}
          footer={
            <>
              <HelpGuidesPopover
                isCollapsed={isCollapsed}
                getStartedGuides={GET_STARTED_GUIDES}
                pageGuides={PAGE_GUIDES[activeItemId] ?? []}
                autoOpenDisabled={guidesAutoOpenDisabled}
                onToggleAutoOpen={() => dispatch(toggleGuidesAutoOpen())}
                onStartGuide={onStartGuide}
              />
              <SidebarNavItem
                icon={SETTINGS_NAV_ITEM.icon}
                label={SETTINGS_NAV_ITEM.label}
                isCollapsed={isCollapsed}
                isActive={activeItemId === SETTINGS_NAV_ITEM.id}
                onClick={() => onNavigate(SETTINGS_NAV_ITEM.id)}
              />
              <ThemeToggleItem
                isCollapsed={isCollapsed}
                isDark={theme === 'dark'}
                onToggle={() => dispatch(toggleTheme())}
              />
              <SidebarNavItem
                icon={LogOut}
                label="Log out"
                isCollapsed={isCollapsed}
                onClick={onLogout}
                className="hover:bg-destructive/10 hover:text-destructive"
              />
            </>
          }
        />

        <main className="min-w-0 flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
