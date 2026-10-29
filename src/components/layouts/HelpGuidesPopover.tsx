import { useEffect, useRef, useState, type JSX, type MouseEvent } from 'react';
import { ChevronRight, LifeBuoy } from 'lucide-react';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { HelpGuideItem } from './HelpGuideItem';
import { SidebarNavItem } from './SidebarNavItem';
import type { HelpGuidesPopoverProps } from './types';

// Grace period so the pointer can cross the gap between trigger and panel.
const CLOSE_DELAY_MS = 150;
const AUTO_OPEN_SWITCH_ID = 'guides-auto-open-switch';

export function HelpGuidesPopover({
  isCollapsed,
  getStartedGuides,
  pageGuides,
  autoOpenDisabled,
  onToggleAutoOpen,
  onStartGuide,
}: HelpGuidesPopoverProps): JSX.Element {
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

  const handleSelect = (guideId: string): void => {
    setIsOpen(false);
    onStartGuide(guideId);
  };

  const sections = [
    { title: 'Get started', guides: getStartedGuides },
    { title: 'On this page', guides: pageGuides },
  ].filter((section) => section.guides.length > 0);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <SidebarNavItem
          icon={LifeBuoy}
          label="Help & tutorials"
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
        className="w-80 overflow-hidden rounded-xl p-0 shadow-lg"
        onMouseEnter={openNow}
        onMouseLeave={closeSoon}
        onOpenAutoFocus={(event) => {
          if (!openedByKeyboard.current) {
            event.preventDefault();
          }
        }}
      >
        <div className="px-4 pt-4 pb-1">
          <h2 className="text-base font-semibold text-foreground">
            Help &amp; guides
          </h2>
        </div>

        {sections.map((section) => (
          <section key={section.title} className="px-2 pb-2">
            <h3 className="px-2 pt-2 pb-1.5 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              {section.title}
            </h3>
            <ul className="space-y-1">
              {section.guides.map((guide) => (
                <li key={guide.id}>
                  <HelpGuideItem guide={guide} onSelect={handleSelect} />
                </li>
              ))}
            </ul>
          </section>
        ))}

        <div className="flex items-start gap-3 border-t px-4 py-3">
          <div className="flex-1 space-y-1">
            <Label
              htmlFor={AUTO_OPEN_SWITCH_ID}
              className="cursor-pointer text-sm font-semibold text-foreground"
            >
              Don&apos;t show guides automatically
            </Label>
            <p className="text-xs text-muted-foreground">
              When on, guides open only when you choose them here
            </p>
          </div>
          <Switch
            id={AUTO_OPEN_SWITCH_ID}
            checked={autoOpenDisabled}
            onCheckedChange={onToggleAutoOpen}
            className="mt-0.5"
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}
