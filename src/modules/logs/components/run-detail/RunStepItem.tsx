import type { JSX } from 'react';
import { CircleCheck, CircleDashed, CircleX } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { RunStepItemProps } from '../../@types';
import { RUN_STEP_STATUS } from '../../constants';
import { formatDuration } from '../../utils';
import { RunStepErrorCallout } from './RunStepErrorCallout';

/** Keeps instant steps visible as a sliver on the timeline */
const MIN_BAR_PERCENT = 0.6;

const STEP_ICONS = {
  success: CircleCheck,
  error: CircleX,
  pending: CircleDashed,
} as const;

/**
 * One node: name and type, a waterfall bar, then "+offset · duration".
 * A node that errored also gets its error facts right underneath.
 */
export function RunStepItem({
  step,
  stepNumber,
  totalMs,
  onOpenRawLogs,
}: RunStepItemProps): JSX.Element {
  const Icon = STEP_ICONS[step.status];
  const isError = step.status === RUN_STEP_STATUS.ERROR;
  const isTimed = step.offsetMs !== null && step.durationMs !== null;
  const widthPercent = isTimed
    ? Math.max(MIN_BAR_PERCENT, ((step.durationMs ?? 0) / totalMs) * 100)
    : 0;
  const leftPercent = isTimed
    ? Math.min(100 - widthPercent, ((step.offsetMs ?? 0) / totalMs) * 100)
    : 0;

  return (
    <li className="space-y-2 py-1.5">
      <div className="grid grid-cols-1 items-center gap-x-6 gap-y-1.5 md:grid-cols-[minmax(0,22rem)_minmax(0,1fr)_9rem]">
        <div className="flex min-w-0 items-center gap-2.5">
          <Icon
            aria-hidden
            className={cn(
              'size-4 shrink-0',
              step.status === RUN_STEP_STATUS.SUCCESS && 'text-primary',
              step.status === RUN_STEP_STATUS.ERROR && 'text-destructive',
              step.status === RUN_STEP_STATUS.PENDING &&
                'text-muted-foreground',
            )}
          />
          <span
            title={step.name}
            className={cn(
              'truncate text-sm text-foreground',
              step.status === RUN_STEP_STATUS.PENDING &&
                'text-muted-foreground',
              isError && 'font-medium text-destructive',
            )}
          >
            {step.name}
          </span>
          <span className="shrink-0 rounded border bg-background px-1.5 py-0.5 font-mono text-xs text-muted-foreground">
            {step.nodeType}
          </span>
        </div>

        {/* SVG keeps the bar's position data-driven without inline styles */}
        <svg aria-hidden className="h-2 w-full" preserveAspectRatio="none">
          <rect width="100%" height="100%" rx="4" className="fill-background" />
          {isTimed && (
            <rect
              x={`${leftPercent}%`}
              width={`${widthPercent}%`}
              height="100%"
              rx="4"
              className={isError ? 'fill-destructive' : 'fill-primary'}
            />
          )}
        </svg>

        <p className="text-xs text-muted-foreground tabular-nums md:text-right">
          {isTimed ? (
            <>
              <span className="sr-only">Started at </span>+
              {formatDuration(step.offsetMs ?? 0)}
              <span aria-hidden> · </span>
              <span className="sr-only">, took </span>
              <span className="text-foreground">
                {formatDuration(step.durationMs ?? 0)}
              </span>
            </>
          ) : (
            'Not run yet'
          )}
        </p>
      </div>

      {step.error && (
        <RunStepErrorCallout
          error={step.error}
          stepNumber={stepNumber}
          onOpenRawLogs={onOpenRawLogs}
        />
      )}
    </li>
  );
}
