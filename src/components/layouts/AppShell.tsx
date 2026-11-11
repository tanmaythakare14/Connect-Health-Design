import { useState, type JSX } from 'react';
import { LogOut } from 'lucide-react';
import { ConfirmDialog } from '@/components/common';
import {
  GET_STARTED_GUIDES,
  MAIN_NAV_ITEMS,
  PAGE_GUIDES,
  PRODUCT_LOGO_DARK_SRC,
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
import { UserMenuPopover } from './UserMenuPopover';
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
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);

  return (
    // The shell is locked to the viewport: the page itself never scrolls, only
    // <main> (and the sidebar nav) scroll internally. `relative` matters as much
    // as `overflow-hidden`: absolutely positioned descendants (sr-only labels,
    // Radix's hidden native inputs) are only clipped by an overflow container
    // that is also their containing block — without it they stretch the
    // document and the whole window scrolls.
    <div className="relative flex h-screen flex-col overflow-hidden bg-canvas">
      <AppTopBar
        logoSrc={PRODUCT_LOGO_SRC}
        logoDarkSrc={PRODUCT_LOGO_DARK_SRC}
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
              <UserMenuPopover
                user={user}
                isCollapsed={isCollapsed}
                onLogout={() => setIsLogoutOpen(true)}
              />
            </>
          }
        />

        <main className="relative min-w-0 flex-1 overflow-y-auto">
          {children}
        </main>
      </div>

      <ConfirmDialog
        open={isLogoutOpen}
        onOpenChange={setIsLogoutOpen}
        destructive
        title="Log out?"
        description={`You’ll be signed out of ${PRODUCT_NAME}. Any unsaved changes on this page will be lost.`}
        confirmLabel="Log out"
        confirmIcon={LogOut}
        pendingLabel="Logging out…"
        onConfirm={onLogout}
        errorMessage="We couldn’t log you out. Please try again."
      />
    </div>
  );
}
