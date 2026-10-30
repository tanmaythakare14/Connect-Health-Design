import type { JSX } from 'react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import type { ConnectionActionsCellProps } from '../../@types';
import { CONNECTION_STATUS } from '../../constants';
import { isToggleableStatus } from '../../utils';

/**
 * Manage (primary-bordered) for every connection; Test (neutral outline) for live ones.
 * Test is disabled while a connection is inactive — there's nothing to reach.
 */
export function ConnectionActionsCell({
  connection,
  onManage,
  onTest,
}: ConnectionActionsCellProps): JSX.Element {
  const { name, status } = connection;
  const isInactive = status === CONNECTION_STATUS.INACTIVE;

  const testButton = (
    <Button
      variant="outline"
      size="sm"
      onClick={() => onTest(connection)}
      disabled={isInactive}
      aria-label={`Test ${name}`}
    >
      Test
    </Button>
  );

  return (
    <div className="flex items-center gap-2">
      {/* Primary-bordered so Manage reads as the main row action, above Test */}
      <Button
        variant="outline"
        size="sm"
        className="border-primary text-primary hover:bg-accent hover:text-primary"
        onClick={() => onManage(connection)}
        aria-label={`Manage ${name}`}
      >
        Manage
      </Button>

      {isToggleableStatus(status) &&
        (isInactive ? (
          // Disabled buttons don't receive pointer events, so the tooltip
          // hangs off a focusable wrapper that explains why Test is off.
          <Tooltip>
            <TooltipTrigger asChild>
              <span
                tabIndex={0}
                className="rounded-md outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
              >
                {testButton}
              </span>
            </TooltipTrigger>
            <TooltipContent>Activate the connection to test it</TooltipContent>
          </Tooltip>
        ) : (
          testButton
        ))}
    </div>
  );
}
