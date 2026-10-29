import type { JSX } from 'react';
import { Unplug } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import type { WorkflowConnectionChipsProps } from '../../@types';
import { CONNECTION_PREVIEW_COUNT } from '../../constants';

const CHIP_CLASS_NAME =
  'max-w-full rounded-md border-transparent bg-accent font-normal text-accent-foreground';

export function WorkflowConnectionChips({
  connections,
}: WorkflowConnectionChipsProps): JSX.Element {
  if (connections.length === 0) {
    return (
      <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Unplug className="size-3.5" aria-hidden />
        No connections
      </p>
    );
  }

  const visible = connections.slice(0, CONNECTION_PREVIEW_COUNT);
  const hidden = connections.slice(CONNECTION_PREVIEW_COUNT);

  return (
    <ul aria-label="Connections" className="flex flex-wrap gap-1.5">
      {visible.map((connection) => (
        <li key={connection.id} className="max-w-full">
          <Badge variant="outline" className={CHIP_CLASS_NAME}>
            <span className="truncate">{connection.name}</span>
          </Badge>
        </li>
      ))}
      {hidden.length > 0 && (
        // z-10 lifts the chip above the card's stretched click target
        <li className="relative z-10">
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge
                variant="outline"
                tabIndex={0}
                className={cn(CHIP_CLASS_NAME, 'cursor-default')}
                aria-label={`${hidden.length} more: ${hidden
                  .map((connection) => connection.name)
                  .join(', ')}`}
              >
                +{hidden.length}
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              {hidden.map((connection) => connection.name).join(' · ')}
            </TooltipContent>
          </Tooltip>
        </li>
      )}
    </ul>
  );
}
