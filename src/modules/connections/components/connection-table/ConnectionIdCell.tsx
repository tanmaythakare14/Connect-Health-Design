import { useEffect, useRef, useState, type JSX } from 'react';
import { Check, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { logger } from '@/utils/logger';
import type { ConnectionIdCellProps } from '../../@types';

const COPIED_RESET_MS = 1500;

export function ConnectionIdCell({ id }: ConnectionIdCellProps): JSX.Element {
  const [isCopied, setIsCopied] = useState(false);
  const resetTimer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(resetTimer.current), []);

  const handleCopy = async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(id);
      setIsCopied(true);
      window.clearTimeout(resetTimer.current);
      resetTimer.current = window.setTimeout(
        () => setIsCopied(false),
        COPIED_RESET_MS,
      );
    } catch (error) {
      logger.warn('Copying connection ID failed', { error });
    }
  };

  return (
    <div className="flex items-center gap-1">
      <code
        title={id}
        className="min-w-0 truncate rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-muted-foreground"
      >
        {id}
      </code>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="size-7 shrink-0 text-muted-foreground hover:bg-accent hover:text-foreground"
            onClick={handleCopy}
            aria-label={
              isCopied ? 'Connection ID copied' : 'Copy connection ID'
            }
          >
            {isCopied ? (
              <Check className="text-primary" aria-hidden />
            ) : (
              <Copy aria-hidden />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>Copy ID</TooltipContent>
      </Tooltip>
    </div>
  );
}
