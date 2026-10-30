import type { JSX } from 'react';
import { CircleAlert } from 'lucide-react';
import type { RunStepErrorCalloutProps } from '../../@types';

/** The errored node's failure facts, shown right under its timeline line. */
export function RunStepErrorCallout({
  error,
  stepNumber,
  onOpenRawLogs,
}: RunStepErrorCalloutProps): JSX.Element {
  const facts = [
    { label: 'Step', value: String(stepNumber) },
    { label: 'Class', value: error.errorClass },
    { label: 'Code', value: error.code },
    ...(error.httpStatus === null
      ? []
      : [{ label: 'HTTP', value: String(error.httpStatus) }]),
  ];

  return (
    <div
      role="note"
      aria-label={`Error in step ${stepNumber}`}
      className="flex items-start gap-2.5 rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2.5 text-xs"
    >
      <CircleAlert
        aria-hidden
        className="mt-px size-4 shrink-0 text-destructive"
      />
      <div className="min-w-0 space-y-1.5">
        <dl className="flex flex-wrap items-center gap-x-4 gap-y-1">
          {facts.map((fact) => (
            <div key={fact.label} className="flex items-center gap-1.5">
              <dt className="text-destructive/70">{fact.label}</dt>
              <dd className="font-mono font-medium text-destructive">
                {fact.value}
              </dd>
            </div>
          ))}
        </dl>
        {error.detail ? (
          <p className="font-mono break-words text-foreground">
            {error.detail}
          </p>
        ) : (
          <p className="text-muted-foreground">
            Error values weren’t recorded —{' '}
            <button
              type="button"
              onClick={onOpenRawLogs}
              className="rounded-sm font-medium text-primary underline-offset-2 outline-none hover:underline focus-visible:ring-[3px] focus-visible:ring-ring/50"
            >
              check this run’s raw logs
            </button>{' '}
            for detail.
          </p>
        )}
      </div>
    </div>
  );
}
