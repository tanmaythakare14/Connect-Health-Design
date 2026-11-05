import type { JSX } from 'react';
import { Check, Copy } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useCopyToClipboard } from '@/hooks/useCopyToClipboard';
import type { LiquidFullScreenDialogProps } from '../../@types';
import { CodeEditor } from '../shared';

/** The same Liquid, with room to read long lines. Edits flow straight back. */
export function LiquidFullScreenDialog({
  open,
  onOpenChange,
  title,
  code,
  onChange,
}: LiquidFullScreenDialogProps): JSX.Element {
  const { isCopied, copy } = useCopyToClipboard();
  const isReadOnly = onChange === undefined;
  const ariaLabel = typeof title === 'string' ? title : 'Liquid';

  const handleCopy = async (): Promise<void> => {
    if (!(await copy(code))) {
      toast.error('Couldn’t copy the Liquid', {
        description: 'Your browser blocked clipboard access.',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="flex h-[min(88vh,900px)] flex-col gap-4 sm:max-w-[min(92vw,1200px)]"
      >
        <div className="flex items-center justify-between gap-4">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>
              {isReadOnly
                ? 'Read-only — it’s compiled from the repeating mapping.'
                : 'Edits here update the template, just like in the panel.'}
            </DialogDescription>
          </DialogHeader>
          <div className="flex shrink-0 items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => void handleCopy()}
              aria-label={isCopied ? 'Copied' : `Copy ${ariaLabel}`}
            >
              {isCopied ? (
                <Check aria-hidden className="size-3.5 text-emerald-600" />
              ) : (
                <Copy aria-hidden className="size-3.5" />
              )}
              {isCopied ? 'Copied' : 'Copy'}
            </Button>
            <DialogClose asChild>
              <Button type="button" variant="outline" size="sm">
                Close
              </Button>
            </DialogClose>
          </div>
        </div>
        <CodeEditor
          value={code}
          onChange={onChange}
          readOnly={isReadOnly}
          language="liquid"
          showLineNumbers
          ariaLabel={ariaLabel}
          className="h-auto min-h-0 flex-1"
        />
      </DialogContent>
    </Dialog>
  );
}
