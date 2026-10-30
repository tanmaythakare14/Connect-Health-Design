import type { JSX } from 'react';
import { Check, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useCopyToClipboard } from '@/hooks/useCopyToClipboard';
import { cn } from '@/lib/utils';
import type { CopyTextBlockProps } from './types';

/**
 * Multi-line read-only value (certificates, keys, JSON…) with a Copy button.
 * Styled like ReadOnlyInput so it reads as locked.
 */
export function CopyTextBlock({
  value,
  label,
  id,
  onCopied,
}: CopyTextBlockProps): JSX.Element {
  const { isCopied, copy } = useCopyToClipboard();

  const handleCopy = async (): Promise<void> => {
    if (await copy(value)) {
      onCopied?.();
    }
  };

  return (
    <div className="space-y-2">
      <Textarea
        id={id}
        value={value}
        readOnly
        aria-readonly
        aria-label={label}
        className={cn(
          'max-h-40 min-h-24 cursor-not-allowed resize-none break-all border-input bg-muted font-mono text-xs leading-relaxed text-muted-foreground shadow-none md:text-xs',
          'focus-visible:border-input focus-visible:ring-0',
          'selection:bg-muted-foreground/20 selection:text-foreground',
        )}
      />
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => void handleCopy()}
        aria-label={isCopied ? `${label} copied` : `Copy ${label}`}
        className={cn(
          isCopied &&
            'border-emerald-300 text-emerald-700 hover:text-emerald-700 dark:border-emerald-800 dark:text-emerald-300',
        )}
      >
        {isCopied ? <Check aria-hidden /> : <Copy aria-hidden />}
        {isCopied ? 'Copied' : 'Copy'}
      </Button>
    </div>
  );
}
