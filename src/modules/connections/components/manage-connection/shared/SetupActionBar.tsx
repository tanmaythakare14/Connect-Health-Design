import { useState, type JSX } from 'react';
import { ArrowRight, CircleCheck, LoaderCircle, Save } from 'lucide-react';
import { ConfirmDialog } from '@/components/common';
import { Button } from '@/components/ui/button';
import type { SetupActionBarProps } from '../../../@types';

/**
 * Docked footer for setup forms: what's left to do, plus Discard / Save draft /
 * Continue. Must be the last child of a flex-column form inside the manage
 * shell — mt-auto pushes it down on short pages, sticky keeps it in view while
 * scrolling, and the negative margins cancel the shell's p-6 so it runs edge
 * to edge.
 */
export function SetupActionBar({
  missingStepTitles,
  isDirty,
  savingMode,
  canContinue,
  onSaveDraft,
  onDiscard,
  continueLabel = 'Continue',
}: SetupActionBarProps): JSX.Element {
  const [isDiscardOpen, setIsDiscardOpen] = useState(false);
  const isSaving = savingMode !== null;

  return (
    <>
      <div className="sticky bottom-0 z-10 -mx-6 -mb-6 mt-auto flex flex-wrap items-center justify-between gap-3 border-t bg-card/95 px-6 py-3 backdrop-blur-sm">
        <p
          aria-live="polite"
          className="flex items-center gap-2 text-sm text-muted-foreground"
        >
          {missingStepTitles.length === 0 ? (
            <>
              <CircleCheck
                className="size-4 text-emerald-600 dark:text-emerald-400"
                aria-hidden
              />
              All set — you’re ready to {continueLabel.toLowerCase()}.
            </>
          ) : (
            <>
              Still to do:{' '}
              <span className="font-medium text-foreground">
                {missingStepTitles.join(', ')}
              </span>
            </>
          )}
        </p>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            onClick={() => setIsDiscardOpen(true)}
            disabled={!isDirty || isSaving}
            className="text-muted-foreground hover:text-foreground"
          >
            Discard
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={onSaveDraft}
            disabled={isSaving}
          >
            {savingMode === 'draft' ? (
              <LoaderCircle className="animate-spin" aria-hidden />
            ) : (
              <Save aria-hidden />
            )}
            Save draft
          </Button>
          <Button type="submit" disabled={!canContinue || isSaving}>
            {savingMode === 'continue' && (
              <LoaderCircle className="animate-spin" aria-hidden />
            )}
            {continueLabel}
            {savingMode !== 'continue' && <ArrowRight aria-hidden />}
          </Button>
        </div>
      </div>

      <ConfirmDialog
        open={isDiscardOpen}
        onOpenChange={setIsDiscardOpen}
        destructive
        title="Discard changes?"
        description="Your unsaved changes will be lost and the form will go back to the last saved version."
        confirmLabel="Discard changes"
        cancelLabel="Keep editing"
        onConfirm={onDiscard}
      />
    </>
  );
}
