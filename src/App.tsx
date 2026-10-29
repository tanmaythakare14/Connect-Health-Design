import { useState, type JSX } from 'react';
import { AppShell, type AppUser } from '@/components/layouts';
import { Toaster } from '@/components/ui/sonner';
import { MAIN_NAV_ITEMS, SETTINGS_NAV_ITEM } from '@/config/navigation';
import { useApplyTheme } from '@/hooks/useApplyTheme';
import { ConnectionsScreen } from '@/modules/connections';
import { SignInScreen } from '@/modules/onboarding';
import { WorkflowsScreen } from '@/modules/workflows';
import { useAppSelector } from '@/store/hooks';
import { selectTheme } from '@/store/slices/uiSlice';
import { logger } from '@/utils/logger';

const DEFAULT_PAGE_ID = MAIN_NAV_ITEMS[0].id;
const ALL_PAGES = [...MAIN_NAV_ITEMS, SETTINGS_NAV_ITEM];

function App(): JSX.Element {
  useApplyTheme();
  const theme = useAppSelector(selectTheme);

  // MOCK: session and routing are local state until auth and a router are added.
  const [user, setUser] = useState<AppUser | null>(null);
  const [activePageId, setActivePageId] = useState(DEFAULT_PAGE_ID);

  const activePage = ALL_PAGES.find((page) => page.id === activePageId);

  const handleLogout = (): void => {
    setUser(null);
    setActivePageId(DEFAULT_PAGE_ID);
  };

  return (
    <>
      {user ? (
        <AppShell
          user={user}
          activeItemId={activePageId}
          onNavigate={setActivePageId}
          onLogout={handleLogout}
          onStartGuide={(guideId) =>
            logger.info('Guide requested', { guideId })
          }
        >
          {activePageId === 'connections' ? (
            <ConnectionsScreen />
          ) : activePageId === 'workflows' ? (
            <WorkflowsScreen />
          ) : (
            // Placeholder until each page is designed
            <div className="p-6">
              <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                {activePage?.label}
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                This page hasn&apos;t been designed yet.
              </p>
            </div>
          )}
        </AppShell>
      ) : (
        <SignInScreen onSignedIn={(username) => setUser({ name: username })} />
      )}

      {/* One app-wide toast host; screens call toast() from 'sonner'.
          Top offset clears the 56px top bar so toasts don't cover the avatar. */}
      <Toaster
        theme={theme}
        position="top-right"
        offset={{ top: 72, right: 24 }}
      />
    </>
  );
}

export default App;
