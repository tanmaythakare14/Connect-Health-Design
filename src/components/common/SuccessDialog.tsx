import type { JSX } from 'react';
import { CircleCheckBig } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import type { SuccessDialogProps } from './types';

/**
 * Shared "it worked" popup for completed actions (created, imported, invited…).
 * No close button — the user moves on with one of the actions (Esc still closes).
 */
export function SuccessDialog({
  open,
  onOpenChange,
  title,
  description,
  primaryAction,
  secondaryAction,
}: SuccessDialogProps): JSX.Element {
  const runAndClose = (action: () => void): void => {
    onOpenChange(false);
    action();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="gap-6 overflow-hidden p-0 sm:max-w-md"
      >
        <div className="flex flex-col items-center gap-4 bg-gradient-to-b from-emerald-50/80 to-transparent px-6 pt-8 text-center dark:from-emerald-950/30">
          <span className="relative flex size-14 items-center justify-center">
            {/* Soft ring that pulses once on open */}
            <span
              aria-hidden
              className="absolute inset-0 rounded-full bg-emerald-400/25 animate-in zoom-in-50 fade-in-0 duration-700"
            />
            <span className="relative flex size-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 animate-in zoom-in-75 duration-300 dark:bg-emerald-900/50 dark:text-emerald-300">
              <CircleCheckBig className="size-7" aria-hidden />
            </span>
          </span>

          <DialogHeader className="gap-1.5 text-center sm:text-center">
            <DialogTitle className="text-xl">{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>
        </div>

        <DialogFooter
          className={cn(
            'px-6 pb-6',
            secondaryAction && 'sm:grid sm:grid-cols-2',
          )}
        >
          {secondaryAction && (
            <Button
              variant="outline"
              onClick={() => runAndClose(secondaryAction.onClick)}
            >
              {secondaryAction.label}
            </Button>
          )}
          <Button
            onClick={() => runAndClose(primaryAction.onClick)}
            className={cn(!secondaryAction && 'w-full')}
            autoFocus
          >
            {primaryAction.label}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
