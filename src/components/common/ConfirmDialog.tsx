import { useId, useState, type JSX } from 'react';
import { LoaderCircle, TriangleAlert } from 'lucide-react';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { logger } from '@/utils/logger';
import type { ConfirmDialogProps } from './types';

/**
 * Shared confirmation prompt (delete / deactivate / log out…). Handles async
 * confirms itself: shows a spinner, stays open until `onConfirm` settles,
 * closes on success and shows `errorMessage` on failure. Riskier actions can
 * add a `warning` callout and a type-to-confirm `confirmationText`.
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
  confirmIcon: ConfirmIcon,
  warning,
  confirmationText,
}: ConfirmDialogProps): JSX.Element {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [typedText, setTypedText] = useState('');
  const confirmInputId = useId();

  const isConfirmationMet =
    confirmationText === undefined || typedText.trim() === confirmationText;

  const handleOpenChange = (nextOpen: boolean): void => {
    if (isPending) {
      return; // don't dismiss mid-action
    }
    if (!nextOpen) {
      setError(null);
      setTypedText('');
    }
    onOpenChange(nextOpen);
  };

  const handleConfirm = async (): Promise<void> => {
    if (!isConfirmationMet) return;
    setIsPending(true);
    setError(null);
    try {
      await onConfirm();
      setTypedText('');
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
        </AlertDialogHeader>

        {warning && (
          <div
            role="note"
            className="flex gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-900/60 dark:bg-amber-950/30"
          >
            <TriangleAlert
              aria-hidden
              className="mt-0.5 size-4 shrink-0 text-amber-600 dark:text-amber-400"
            />
            <div className="min-w-0 space-y-1">
              <p className="text-sm font-semibold text-amber-800 dark:text-amber-200">
                {warning.title}
              </p>
              <p className="text-sm text-amber-800/90 dark:text-amber-200/90">
                {warning.description}
              </p>
            </div>
          </div>
        )}

        {confirmationText !== undefined && (
          <form
            className="space-y-2"
            onSubmit={(event) => {
              event.preventDefault();
              void handleConfirm();
            }}
          >
            <Label htmlFor={confirmInputId} className="font-normal">
              <span>
                To confirm, type{' '}
                <span className="font-semibold wrap-anywhere text-foreground">
                  {confirmationText}
                </span>{' '}
                below
              </span>
            </Label>
            <Input
              id={confirmInputId}
              value={typedText}
              onChange={(event) => setTypedText(event.target.value)}
              placeholder={`Type ${confirmationText} to confirm`}
              autoComplete="off"
              autoCapitalize="none"
              spellCheck={false}
              autoFocus
              disabled={isPending}
            />
          </form>
        )}

        {error && (
          <p role="alert" className="-mt-2 text-sm text-destructive">
            {error}
          </p>
        )}

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
            disabled={isPending || !isConfirmationMet}
            className={cn(
              destructive && buttonVariants({ variant: 'destructive' }),
            )}
          >
            {isPending ? (
              <LoaderCircle className="animate-spin" aria-hidden />
            ) : (
              ConfirmIcon && <ConfirmIcon aria-hidden />
            )}
            {isPending ? (pendingLabel ?? confirmLabel) : confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
