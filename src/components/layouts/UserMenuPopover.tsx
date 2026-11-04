import { useEffect, useRef, useState, type JSX, type MouseEvent } from 'react';
import { ChevronRight, CircleUserRound, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { SidebarNavItem } from './SidebarNavItem';
import type { UserMenuPopoverProps } from './types';

// Grace period so the pointer can cross the gap between trigger and panel.
const CLOSE_DELAY_MS = 150;

/** The signed-in user in the sidebar; hover (or click) shows their name and Log out. */
export function UserMenuPopover({
  user,
  isCollapsed,
  onLogout,
}: UserMenuPopoverProps): JSX.Element {
  const [isOpen, setIsOpen] = useState(false);
  const closeTimer = useRef<number | undefined>(undefined);
  // Hover-open must not steal focus; keyboard-open should move focus into the panel.
  const openedByKeyboard = useRef(false);

  useEffect(() => () => window.clearTimeout(closeTimer.current), []);

  const openNow = (): void => {
    window.clearTimeout(closeTimer.current);
    setIsOpen(true);
  };

  const closeSoon = (): void => {
    window.clearTimeout(closeTimer.current);
    closeTimer.current = window.setTimeout(
      () => setIsOpen(false),
      CLOSE_DELAY_MS,
    );
  };

  const handleHoverOpen = (): void => {
    openedByKeyboard.current = false;
    openNow();
  };

  // Click/Enter always opens (rather than toggling a panel hover already opened).
  const handleTriggerClick = (event: MouseEvent<HTMLButtonElement>): void => {
    event.preventDefault();
    openedByKeyboard.current = event.detail === 0;
    openNow();
  };

  const handleLogout = (): void => {
    setIsOpen(false);
    onLogout();
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <SidebarNavItem
          icon={CircleUserRound}
          label={user.name}
          aria-label={`Account: ${user.name}`}
          isCollapsed={isCollapsed}
          showTooltip={false}
          onMouseEnter={handleHoverOpen}
          onMouseLeave={closeSoon}
          onClick={handleTriggerClick}
          className={cn(isOpen && 'bg-sidebar-accent text-foreground')}
          trailing={
            <ChevronRight
              aria-hidden
              className={cn(
                'size-4 text-muted-foreground transition-transform duration-200 ease-out',
                isOpen && 'translate-x-0.5 text-foreground',
              )}
            />
          }
        />
      </PopoverTrigger>

      <PopoverContent
        side="right"
        align="end"
        sideOffset={16}
        className="w-64 overflow-hidden rounded-xl p-0 shadow-lg"
        onMouseEnter={openNow}
        onMouseLeave={closeSoon}
        onOpenAutoFocus={(event) => {
          if (!openedByKeyboard.current) {
            event.preventDefault();
          }
        }}
      >
        <div className="flex items-center gap-3 px-4 py-3.5">
          <span
            aria-hidden
            className="flex size-9 shrink-0 items-center justify-center rounded-full bg-accent text-primary"
          >
            <CircleUserRound className="size-5" />
          </span>
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">Signed in as</p>
            <p
              title={user.name}
              className="truncate text-sm font-semibold text-foreground"
            >
              {user.name}
            </p>
          </div>
        </div>

        <div className="border-t p-1.5">
          <Button
            type="button"
            variant="ghost"
            onClick={handleLogout}
            className="w-full justify-start gap-2.5 px-2.5 text-sm font-medium text-destructive hover:bg-destructive/10 hover:text-destructive"
          >
            <LogOut aria-hidden className="size-4" />
            Log out
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
