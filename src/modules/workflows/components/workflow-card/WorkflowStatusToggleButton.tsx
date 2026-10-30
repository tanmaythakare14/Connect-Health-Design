import type { JSX } from 'react';
import { Pause, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import type { WorkflowStatusToggleButtonProps } from '../../@types';
import { WORKFLOW_STATUS } from '../../constants';

/** One-click pause / resume, kept outside the card menu because it's used most. */
export function WorkflowStatusToggleButton({
  workflowName,
  status,
  onToggleStatus,
}: WorkflowStatusToggleButtonProps): JSX.Element {
  const isActive = status === WORKFLOW_STATUS.ACTIVE;
  const label = isActive ? 'Pause workflow' : 'Resume workflow';

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        {/* z-10 lifts the button above the card's stretched click target */}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onToggleStatus}
          aria-label={`${label}: ${workflowName}`}
          className="relative z-10 size-8 text-muted-foreground hover:bg-accent hover:text-primary"
        >
          {isActive ? <Pause aria-hidden /> : <Play aria-hidden />}
        </Button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}
