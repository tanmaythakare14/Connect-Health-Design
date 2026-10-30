import type { JSX } from 'react';
import type { RunStepTimelineProps } from '../../@types';
import { RunStepItem } from './RunStepItem';

/** Waterfall of a run's nodes, scaled to the run's total time. */
export function RunStepTimeline({
  steps,
  hiddenStepIds,
  totalMs,
  onOpenRawLogs,
}: RunStepTimelineProps): JSX.Element {
  return (
    <ol aria-label="Run steps" className="divide-y divide-border/60">
      {steps.map((step, index) =>
        hiddenStepIds.has(step.id) ? null : (
          <RunStepItem
            key={step.id}
            step={step}
            // Numbered across all steps, so hiding instant ones keeps the
            // numbers the error callout refers to.
            stepNumber={index + 1}
            totalMs={totalMs}
            onOpenRawLogs={onOpenRawLogs}
          />
        ),
      )}
    </ol>
  );
}
