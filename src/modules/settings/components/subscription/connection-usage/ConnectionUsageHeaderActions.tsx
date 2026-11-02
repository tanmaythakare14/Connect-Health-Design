import type { JSX } from 'react';
import { ChevronDown, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import type { ConnectionUsageHeaderActionsProps } from '../../../@types';

/** Refresh, then the collapse chevron, on the right of the section header. */
export function ConnectionUsageHeaderActions({
  isOpen,
  onToggleOpen,
  isRefreshing,
  onRefresh,
  refreshDisabled,
  bodyId,
}: ConnectionUsageHeaderActionsProps): JSX.Element {
  const toggleLabel = isOpen
    ? 'Collapse connection usage'
    : 'Expand connection usage';

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        onClick={onRefresh}
        disabled={refreshDisabled || isRefreshing}
      >
        <RefreshCw aria-hidden className={cn(isRefreshing && 'animate-spin')} />
        {isRefreshing ? 'Refreshing…' : 'Refresh'}
      </Button>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            onClick={onToggleOpen}
            aria-expanded={isOpen}
            aria-controls={bodyId}
            aria-label={toggleLabel}
          >
            <ChevronDown
              aria-hidden
              className={cn(
                'transition-transform duration-200',
                isOpen && 'rotate-180',
              )}
            />
          </Button>
        </TooltipTrigger>
        <TooltipContent>{isOpen ? 'Collapse' : 'Expand'}</TooltipContent>
      </Tooltip>
    </div>
  );
}
