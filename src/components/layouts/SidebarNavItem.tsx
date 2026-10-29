import type { JSX } from 'react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import type { SidebarNavItemProps } from './types';

export function SidebarNavItem({
  icon: Icon,
  label,
  isCollapsed,
  isActive = false,
  showTooltip = true,
  trailing,
  className,
  ...props
}: SidebarNavItemProps): JSX.Element {
  const item = (
    <Button
      type="button"
      variant="ghost"
      aria-current={isActive ? 'page' : undefined}
      className={cn(
        'group relative h-10 w-full justify-start gap-3 px-2.5 has-[>svg]:px-2.5 text-sm font-medium text-sidebar-foreground transition-colors duration-150',
        'hover:bg-sidebar-accent hover:text-foreground',
        isActive && 'bg-sidebar-accent text-primary hover:text-primary',
        className,
      )}
      {...props}
    >
      {/* Active indicator — grows in from the sidebar edge */}
      <span
        aria-hidden
        className={cn(
          'absolute top-1/2 -left-3 h-5 w-1 -translate-y-1/2 rounded-r-full bg-primary transition-transform duration-200 ease-out',
          isActive ? 'scale-y-100' : 'scale-y-0',
        )}
      />
      <Icon
        aria-hidden
        className="size-5 shrink-0 transition-transform duration-200 ease-out group-hover:scale-110"
      />
      <span
        className={cn(
          'flex-1 truncate text-left transition-opacity duration-200',
          isCollapsed && 'opacity-0',
        )}
      >
        {label}
      </span>
      {!isCollapsed && trailing}
    </Button>
  );

  if (!isCollapsed || !showTooltip) {
    return item;
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>{item}</TooltipTrigger>
      <TooltipContent side="right" sideOffset={12}>
        {label}
      </TooltipContent>
    </Tooltip>
  );
}
