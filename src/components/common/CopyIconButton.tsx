import type { JSX } from 'react';
import { Check, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useCopyToClipboard } from '@/hooks/useCopyToClipboard';
import type { CopyIconButtonProps } from './types';

/** Compact copy button; shows a green check and "Copied" briefly after copying. */
export function CopyIconButton({
  value,
  label,
}: CopyIconButtonProps): JSX.Element {
  const { isCopied, copy } = useCopyToClipboard();

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => void copy(value)}
          aria-label={isCopied ? `${label} copied` : `Copy ${label}`}
          className="size-7 shrink-0 text-muted-foreground"
        >
          {isCopied ? (
            <Check
              aria-hidden
              className="text-emerald-600 dark:text-emerald-400"
            />
          ) : (
            <Copy aria-hidden />
          )}
        </Button>
      </TooltipTrigger>
      <TooltipContent>{isCopied ? 'Copied' : 'Copy'}</TooltipContent>
    </Tooltip>
  );
}
