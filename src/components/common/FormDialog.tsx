import type { JSX } from 'react';
import { LoaderCircle } from 'lucide-react';
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
import type { FormDialogProps } from './types';

/**
 * A dialog that wraps a short form: title and description, the fields, an
 * inline error, then Cancel and a primary submit. The submit shows a spinner
 * while saving and stays disabled until `canSubmit`. Wrap it in RHF's
 * <Form> and pass `form.handleSubmit(...)` as `onSubmit`.
 */
export function FormDialog({
  open,
  onOpenChange,
  title,
  description,
  onSubmit,
  submitLabel,
  pendingLabel,
  submitIcon: SubmitIcon,
  cancelLabel = 'Cancel',
  isSubmitting,
  canSubmit,
  error,
  className,
  children,
}: FormDialogProps): JSX.Element {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn('gap-6 sm:max-w-lg', className)}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>

        <form onSubmit={onSubmit} noValidate className="space-y-5">
          {children}

          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              {cancelLabel}
            </Button>
            <Button type="submit" disabled={!canSubmit || isSubmitting}>
              {isSubmitting ? (
                <LoaderCircle className="animate-spin" aria-hidden />
              ) : (
                SubmitIcon && <SubmitIcon aria-hidden />
              )}
              {isSubmitting ? (pendingLabel ?? submitLabel) : submitLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
