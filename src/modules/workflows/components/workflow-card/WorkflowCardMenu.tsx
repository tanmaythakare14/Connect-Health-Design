import type { JSX } from 'react';
import {
  Download,
  EllipsisVertical,
  Pause,
  Play,
  Settings,
  Trash,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { WorkflowCardMenuProps } from '../../@types';
import { WORKFLOW_STATUS } from '../../constants';

export function WorkflowCardMenu({
  workflowName,
  status,
  onToggleStatus,
  onExport,
  onSettings,
  onDelete,
}: WorkflowCardMenuProps): JSX.Element {
  const isActive = status === WORKFLOW_STATUS.ACTIVE;

  return (
    // Non-modal: Delete opens a dialog straight from this menu, and a modal menu
    // can leave the page's pointer-events locked when the two overlap.
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        {/* z-10 lifts the trigger above the card's stretched click target */}
        <Button
          variant="ghost"
          size="icon"
          aria-label={`Actions for ${workflowName}`}
          className="relative z-10 -mr-2 size-8 text-muted-foreground hover:bg-accent hover:text-foreground data-[state=open]:bg-accent data-[state=open]:text-foreground"
        >
          <EllipsisVertical aria-hidden />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuItem onSelect={onToggleStatus}>
          {isActive ? <Pause aria-hidden /> : <Play aria-hidden />}
          {isActive ? 'Pause workflow' : 'Resume workflow'}
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={onExport}>
          <Download aria-hidden />
          Export
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={onSettings}>
          <Settings aria-hidden />
          Settings
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onSelect={onDelete}>
          <Trash aria-hidden />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
