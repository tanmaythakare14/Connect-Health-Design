import { useState, type JSX } from 'react';
import { LoaderCircle } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { logger } from '@/utils/logger';
import type { ConfirmDialogProps } from './types';

/**
 * Shared confirmation prompt (delete / deactivate / log out…). Handles async
 * confirms itself: shows a spinner, stays open until `onConfirm` settles,
 * closes on success and shows `errorMessage` on failure.
 */
export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  pendingLabel,
  cancelLabel = 'Cancel',
  destructive = false,
  onConfirm,
  errorMessage = 'Something went wrong. Please try again.',
}: ConfirmDialogProps): JSX.Element {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleOpenChange = (nextOpen: boolean): void => {
    if (isPending) {
      return; // don't dismiss mid-action
    }
    if (!nextOpen) {
      setError(null);
    }
    onOpenChange(nextOpen);
  };

  const handleConfirm = async (): Promise<void> => {
    setIsPending(true);
    setError(null);
    try {
      await onConfirm();
      onOpenChange(false);
    } catch (confirmError) {
      logger.error('Confirmed action failed', { error: confirmError });
      setError(errorMessage);
    } finally {
      setIsPending(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent className="gap-6 rounded-xl sm:max-w-md">
        <AlertDialogHeader className="gap-2 text-left">
          <AlertDialogTitle className="text-base">{title}</AlertDialogTitle>
          <AlertDialogDescription className="leading-relaxed wrap-anywhere">
            {description}
          </AlertDialogDescription>
          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>
            {cancelLabel}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(event) => {
              // AlertDialogAction closes on click by default; keep it open
              // until the (possibly async) onConfirm settles.
              event.preventDefault();
              void handleConfirm();
            }}
            disabled={isPending}
            className={cn(
              destructive && buttonVariants({ variant: 'destructive' }),
            )}
          >
            {isPending ? (
              <>
                <LoaderCircle className="animate-spin" aria-hidden />
                {pendingLabel ?? confirmLabel}
              </>
            ) : (
              confirmLabel
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
