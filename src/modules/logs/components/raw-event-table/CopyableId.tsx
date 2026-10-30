import type { JSX } from 'react';
import { Check, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCopyToClipboard } from '@/hooks/useCopyToClipboard';
import type { CopyableIdProps } from '../../@types';

/** A monospace ID chip with an inline copy button. */
export function CopyableId({ value, label }: CopyableIdProps): JSX.Element {
  const { isCopied, copy } = useCopyToClipboard();

  return (
    <span className="inline-flex max-w-full min-w-0 items-center gap-1">
      <code className="truncate rounded border bg-background px-1.5 py-0.5 font-mono text-xs text-foreground">
        {value}
      </code>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={() => void copy(value)}
        aria-label={isCopied ? `${label} copied` : `Copy ${label}`}
        className="size-6 shrink-0 text-muted-foreground"
      >
        {isCopied ? (
          <Check aria-hidden className="size-3.5" />
        ) : (
          <Copy aria-hidden className="size-3.5" />
        )}
      </Button>
    </span>
  );
}
