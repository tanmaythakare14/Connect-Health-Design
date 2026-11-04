import type { JSX } from 'react';
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { AppTopBarProps } from './types';

export function AppTopBar({
  logoSrc,
  productName,
  isSidebarCollapsed,
  onToggleSidebar,
}: AppTopBarProps): JSX.Element {
  const ToggleIcon = isSidebarCollapsed ? PanelLeftOpen : PanelLeftClose;

  return (
    <header className="flex h-14 shrink-0 items-center gap-4 border-b bg-background pr-4 pl-3.5">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleSidebar}
          aria-label={
            isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'
          }
          aria-expanded={!isSidebarCollapsed}
          className="text-muted-foreground hover:bg-sidebar-accent hover:text-foreground"
        >
          <ToggleIcon className="size-5" aria-hidden />
        </Button>

        <img
          src={logoSrc}
          alt={productName}
          className="h-5 w-auto select-none"
          draggable={false}
        />
      </div>
    </header>
  );
}
