import type { JSX } from 'react';
import { FileText, RefreshCw, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import type { SampleFileBarProps } from '../../@types';

/** The sample file a field tree is built from, with Replace and Remove. */
export function SampleFileBar({
  fileName,
  caption,
  noun,
  onReplace,
  onRemove,
}: SampleFileBarProps): JSX.Element {
  return (
    <div className="flex items-center gap-2.5 rounded-lg border bg-background py-1.5 pr-1.5 pl-2">
      <span
        aria-hidden
        className="flex size-7 shrink-0 items-center justify-center rounded-md bg-accent text-primary"
      >
        <FileText className="size-3.5" />
      </span>
      <div className="min-w-0 flex-1">
        <p
          title={fileName}
          className="truncate text-xs font-medium text-foreground"
        >
          {fileName}
        </p>
        <p className="text-[11px] text-muted-foreground">{caption}</p>
      </div>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={onReplace}
        className="h-7 px-2 text-xs"
      >
        <RefreshCw aria-hidden className="size-3.5" />
        Replace
      </Button>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onRemove}
            aria-label={`Remove ${noun}`}
            className="size-7 text-muted-foreground hover:text-destructive"
          >
            <X aria-hidden className="size-3.5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Remove {noun}</TooltipContent>
      </Tooltip>
    </div>
  );
}
