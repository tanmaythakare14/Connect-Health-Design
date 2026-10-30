import { useMemo, useState, type JSX } from 'react';
import { Check, Copy, Eye, EyeOff, ScrollText, Workflow } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useCopyToClipboard } from '@/hooks/useCopyToClipboard';
import type { RunDetailPanelProps } from '../../@types';
import { formatDuration, formatRunTimestamp, isInstantStep } from '../../utils';
import { RunStepTimeline } from './RunStepTimeline';

/** Run summary, quick links and the step waterfall. */
export function RunDetailPanel({
  detail,
  onOpenWorkflow,
  onOpenRawLogs,
}: RunDetailPanelProps): JSX.Element {
  const [hideInstantSteps, setHideInstantSteps] = useState(false);
  const { isCopied, copy } = useCopyToClipboard();

  const instantStepCount = detail.steps.filter(isInstantStep).length;
  // Only worth offering when it leaves something to look at.
  const canHideInstantSteps =
    instantStepCount > 0 && instantStepCount < detail.steps.length;
  const hiddenStepIds = useMemo<ReadonlySet<string>>(
    () =>
      canHideInstantSteps && hideInstantSteps
        ? new Set(detail.steps.filter(isInstantStep).map((step) => step.id))
        : new Set(),
    [canHideInstantSteps, hideInstantSteps, detail.steps],
  );
  const lastStepEndMs = Math.max(
    0,
    ...detail.steps.map(
      (step) => (step.offsetMs ?? 0) + (step.durationMs ?? 0),
    ),
  );
  // Never zero, so a 0ms run still draws its slivers.
  const totalMs = Math.max(1, detail.durationMs ?? lastStepEndMs);

  return (
    <div className="space-y-4 px-6 py-4">
      <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-3">
        <div className="min-w-0 space-y-2">
          <div className="flex min-w-0 items-center gap-2">
            <code className="rounded border bg-background px-1.5 py-0.5 font-mono text-xs text-foreground">
              {detail.id}
            </code>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => void copy(detail.id)}
                  aria-label={isCopied ? 'Run ID copied' : 'Copy run ID'}
                  className="size-6 text-muted-foreground"
                >
                  {isCopied ? (
                    <Check aria-hidden className="size-3.5" />
                  ) : (
                    <Copy aria-hidden className="size-3.5" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {isCopied ? 'Copied' : 'Copy run ID'}
              </TooltipContent>
            </Tooltip>
            <span className="truncate text-sm text-muted-foreground">
              {detail.workflowName}
            </span>
          </div>

          <dl className="flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-muted-foreground">
            <div className="flex min-w-0 items-center gap-1.5">
              <dt>Trigger</dt>
              <dd className="truncate font-mono text-foreground">
                {detail.trigger}
              </dd>
            </div>
            <div className="flex items-center gap-1.5">
              <dt>Started</dt>
              <dd className="text-foreground tabular-nums">
                <time dateTime={detail.startedAt}>
                  {formatRunTimestamp(detail.startedAt)}
                </time>
              </dd>
            </div>
            <div className="flex items-center gap-1.5">
              <dt>Total</dt>
              <dd className="font-medium text-foreground tabular-nums">
                {detail.durationMs === null
                  ? 'Still running'
                  : formatDuration(detail.durationMs)}
              </dd>
            </div>
          </dl>
        </div>

        <div className="flex flex-wrap items-center gap-1">
          {canHideInstantSteps && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setHideInstantSteps((hidden) => !hidden)}
              aria-pressed={hideInstantSteps}
              className="text-muted-foreground"
            >
              {hideInstantSteps ? <Eye aria-hidden /> : <EyeOff aria-hidden />}
              {hideInstantSteps ? 'Show' : 'Hide'} {instantStepCount} instant{' '}
              {instantStepCount === 1 ? 'step' : 'steps'}
            </Button>
          )}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onOpenWorkflow(detail)}
            className="text-primary hover:bg-accent hover:text-primary"
          >
            <Workflow aria-hidden />
            Open workflow
          </Button>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onOpenRawLogs(detail)}
                className="text-primary hover:bg-accent hover:text-primary"
              >
                <ScrollText aria-hidden />
                Raw logs
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              Raw logs from this run’s time window
            </TooltipContent>
          </Tooltip>
        </div>
      </div>

      <RunStepTimeline
        steps={detail.steps}
        hiddenStepIds={hiddenStepIds}
        totalMs={totalMs}
        onOpenRawLogs={() => onOpenRawLogs(detail)}
      />
    </div>
  );
}
