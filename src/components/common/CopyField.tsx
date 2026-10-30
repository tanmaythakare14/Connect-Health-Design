import type { JSX } from 'react';
import { Check, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCopyToClipboard } from '@/hooks/useCopyToClipboard';
import { cn } from '@/lib/utils';
import { ReadOnlyInput } from './ReadOnlyInput';
import type { CopyFieldProps } from './types';

/** Read-only value with a Copy button that confirms with "Copied". */
export function CopyField({
  value,
  label,
  id,
  onCopied,
}: CopyFieldProps): JSX.Element {
  const { isCopied, copy } = useCopyToClipboard();

  const handleCopy = async (): Promise<void> => {
    if (await copy(value)) {
      onCopied?.();
    }
  };

  return (
    <div className="flex gap-2">
      {/* The Copy button is the way to grab the value, so the field itself
          stays inert — no select-all highlight on focus. */}
      <ReadOnlyInput
        id={id}
        value={value}
        aria-label={label}
        className="min-w-0 flex-1 font-mono text-xs md:text-xs"
      />
      <Button
        type="button"
        variant="outline"
        onClick={() => void handleCopy()}
        aria-label={isCopied ? `${label} copied` : `Copy ${label}`}
        className={cn(
          'w-24 shrink-0',
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
