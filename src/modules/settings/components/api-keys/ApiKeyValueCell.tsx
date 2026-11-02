import type { JSX } from 'react';
import { Check, Copy, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useCopyToClipboard } from '@/hooks/useCopyToClipboard';
import type { ApiKeyValueCellProps } from '../../@types';
import { maskApiKey } from '../../utils';

/** The key masked by default, with reveal and copy buttons. */
export function ApiKeyValueCell({
  apiKey,
  isRevealed,
  onToggleReveal,
}: ApiKeyValueCellProps): JSX.Element {
  const { isCopied, copy } = useCopyToClipboard();
  const revealLabel = isRevealed ? 'Hide key' : 'Show key';

  return (
    <div className="flex min-w-0 items-center gap-1">
      <code
        title={isRevealed ? apiKey.key : undefined}
        className="truncate rounded-md border bg-muted/50 px-2 py-1 font-mono text-xs text-foreground"
      >
        {isRevealed ? apiKey.key : maskApiKey(apiKey.key)}
      </code>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => onToggleReveal(apiKey)}
            aria-pressed={isRevealed}
            aria-label={`${revealLabel}: ${apiKey.name}`}
            className="size-7 shrink-0 text-muted-foreground"
          >
            {isRevealed ? <EyeOff aria-hidden /> : <Eye aria-hidden />}
          </Button>
        </TooltipTrigger>
        <TooltipContent>{revealLabel}</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => void copy(apiKey.key)}
            aria-label={
              isCopied ? `${apiKey.name} copied` : `Copy key: ${apiKey.name}`
            }
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
        <TooltipContent>{isCopied ? 'Copied' : 'Copy key'}</TooltipContent>
      </Tooltip>
    </div>
  );
}
