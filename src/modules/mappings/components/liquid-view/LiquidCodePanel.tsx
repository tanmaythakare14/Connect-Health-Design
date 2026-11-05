import type { JSX } from 'react';
import { Check, Copy, Maximize2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { useCopyToClipboard } from '@/hooks/useCopyToClipboard';
import type { LiquidCodePanelProps } from '../../@types';
import { CodeEditor } from '../shared';

/** Compiled Liquid with its size, Copy and Full screen; editable unless read-only. */
export function LiquidCodePanel({
  code,
  onChange,
  label,
  onOpenFullScreen,
}: LiquidCodePanelProps): JSX.Element {
  const { isCopied, copy } = useCopyToClipboard();
  const isReadOnly = onChange === undefined;
  const lineCount = code.split('\n').length;

  const handleCopy = async (): Promise<void> => {
    if (!(await copy(code))) {
      toast.error('Couldn’t copy the Liquid', {
        description: 'Your browser blocked clipboard access.',
      });
    }
  };

  return (
    <div className="overflow-hidden rounded-lg border bg-card">
      <div className="flex items-center gap-2 border-b bg-muted/40 px-3 py-1.5">
        {isReadOnly && (
          <span className="rounded border bg-background px-1.5 py-px font-mono text-[10px] font-semibold tracking-wider text-muted-foreground">
            READ-ONLY
          </span>
        )}
        <span className="font-mono text-[11px] text-muted-foreground tabular-nums">
          {lineCount} {lineCount === 1 ? 'line' : 'lines'} ·{' '}
          {code.length.toLocaleString()} chars
        </span>
        <div className="ml-auto flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => void handleCopy()}
            aria-label={isCopied ? 'Copied' : `Copy ${label}`}
            className="h-7 px-2 text-xs"
          >
            {isCopied ? (
              <Check aria-hidden className="size-3.5 text-emerald-600" />
            ) : (
              <Copy aria-hidden className="size-3.5" />
            )}
            {isCopied ? 'Copied' : 'Copy'}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onOpenFullScreen}
            aria-label={`Open ${label} full screen`}
            className="h-7 px-2 text-xs"
          >
            <Maximize2 aria-hidden className="size-3.5" />
            Full screen
          </Button>
        </div>
      </div>
      <CodeEditor
        value={code}
        onChange={onChange}
        readOnly={isReadOnly}
        language="liquid"
        showLineNumbers
        ariaLabel={label}
        className="h-72 rounded-none border-0 shadow-none focus-within:ring-0"
      />
    </div>
  );
}
