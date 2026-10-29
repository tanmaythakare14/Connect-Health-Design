import type { JSX } from 'react';
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { getInitials } from '@/utils/name';
import type { AppTopBarProps } from './types';

export function AppTopBar({
  user,
  logoSrc,
  productName,
  isSidebarCollapsed,
  onToggleSidebar,
}: AppTopBarProps): JSX.Element {
  const ToggleIcon = isSidebarCollapsed ? PanelLeftOpen : PanelLeftClose;

  return (
    <header className="flex h-14 shrink-0 items-center justify-between gap-4 border-b bg-background pr-4 pl-3.5">
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

      <div className="flex items-center gap-3">
        <span className="hidden text-sm font-medium text-foreground sm:inline">
          {user.name}
        </span>
        <Avatar className="size-9">
          <AvatarFallback className="bg-accent text-xs font-semibold text-accent-foreground">
            {getInitials(user.name)}
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
