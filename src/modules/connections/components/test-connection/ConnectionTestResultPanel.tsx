import type { JSX } from 'react';
import {
  CircleAlert,
  CircleCheck,
  FlaskConical,
  KeyRound,
  RotateCcw,
  Timer,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { ConnectionTestResultPanelProps } from '../../@types';
import { CONNECTION_TEST_STEPS } from '../../constants';
import { ConnectionTestStepItem } from './ConnectionTestStepItem';

const OUTCOME_BADGES = {
  running: {
    label: 'Running',
    className: 'border-primary/25 bg-accent text-accent-foreground',
    dot: 'animate-pulse bg-primary',
  },
  passed: {
    label: 'Passed',
    className:
      'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300',
    dot: 'bg-emerald-500',
  },
  failed: {
    label: 'Failed',
    className: 'border-destructive/25 bg-destructive/10 text-destructive',
    dot: 'bg-destructive',
  },
} as const;

export function ConnectionTestResultPanel({
  runState,
  onRetry,
}: ConnectionTestResultPanelProps): JSX.Element {
  const badge =
    runState.status === 'running'
      ? OUTCOME_BADGES.running
      : runState.status === 'done'
        ? OUTCOME_BADGES[runState.result.outcome]
        : null;

  const renderBody = (): JSX.Element => {
    if (runState.status === 'idle') {
      return (
        <div className="flex flex-col items-center gap-3 px-6 py-10 text-center">
          <span className="flex size-10 items-center justify-center rounded-full bg-accent text-primary">
            <FlaskConical className="size-5" aria-hidden />
          </span>
          <div className="space-y-1">
            <p className="text-sm font-semibold text-foreground">
              No test run yet
            </p>
            <p className="text-sm text-muted-foreground">
              Choose an API key and run the test to see each check here.
            </p>
          </div>
        </div>
      );
    }

    if (runState.status === 'error') {
      return (
        <div
          role="alert"
          className="flex flex-wrap items-center justify-between gap-3 p-5"
        >
          <p className="flex items-center gap-2 text-sm text-destructive">
            <CircleAlert className="size-4" aria-hidden />
            {runState.error}
          </p>
          <Button variant="outline" size="sm" onClick={onRetry}>
            <RotateCcw aria-hidden />
            Try again
          </Button>
        </div>
      );
    }

    // While running, show the known steps: the first spins, the rest wait.
    if (runState.status === 'running') {
      return (
        <ol className="p-5" aria-busy>
          {CONNECTION_TEST_STEPS.map((step, index) => (
            <ConnectionTestStepItem
              key={step.id}
              title={step.title}
              description={step.description}
              status={index === 0 ? 'running' : 'pending'}
              isLast={index === CONNECTION_TEST_STEPS.length - 1}
            />
          ))}
        </ol>
      );
    }

    const { result } = runState;
    const passed = result.outcome === 'passed';

    return (
      <div className="animate-in fade-in-0 duration-300">
        <ol className="p-5">
          {result.steps.map((step, index) => (
            <ConnectionTestStepItem
              key={step.id}
              title={step.title}
              description={step.description}
              status={step.status}
              details={step.details}
              error={step.error}
              isLast={index === result.steps.length - 1}
            />
          ))}
        </ol>

        {/* Outcome summary */}
        <div className="border-t p-5">
          <div
            role="status"
            className={cn(
              'flex flex-wrap items-center justify-between gap-3 rounded-lg border px-4 py-3',
              passed
                ? 'border-emerald-200 bg-emerald-50 dark:border-emerald-900/60 dark:bg-emerald-950/40'
                : 'border-destructive/25 bg-destructive/10',
            )}
          >
            <div className="flex items-start gap-3">
              {passed ? (
                <CircleCheck
                  className="mt-0.5 size-5 text-emerald-600 dark:text-emerald-400"
                  aria-hidden
                />
              ) : (
                <CircleAlert
                  className="mt-0.5 size-5 text-destructive"
                  aria-hidden
                />
              )}
              <div className="space-y-0.5">
                <p
                  className={cn(
                    'text-sm font-semibold',
                    passed
                      ? 'text-emerald-700 dark:text-emerald-300'
                      : 'text-destructive',
                  )}
                >
                  {passed ? 'Connection verified' : 'Connection test failed'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {passed
                    ? 'Every check passed — this integration is ready for production use.'
                    : 'Check your configuration settings and try again. See the error details above.'}
                </p>
              </div>
            </div>
            {!passed && (
              <Button variant="outline" size="sm" onClick={onRetry}>
                <RotateCcw aria-hidden />
                Run again
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <section
      aria-labelledby="connection-test-results-heading"
      className="rounded-xl border bg-card"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b px-5 py-4">
        <div className="flex items-center gap-2">
          <h2
            id="connection-test-results-heading"
            className="text-sm font-semibold text-foreground"
          >
            Test results
          </h2>
          {badge && (
            <Badge
              variant="outline"
              className={cn(
                'gap-1.5 rounded-full font-medium',
                badge.className,
              )}
            >
              <span
                aria-hidden
                className={cn('size-1.5 rounded-full', badge.dot)}
              />
              {badge.label}
            </Badge>
          )}
        </div>

        {runState.status === 'done' && (
          <dl className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <KeyRound className="size-3.5" aria-hidden />
              <dt className="sr-only">API key</dt>
              <dd className="font-medium text-foreground">
                {runState.result.apiKeyName}
              </dd>
            </div>
            <div className="flex items-center gap-1.5">
              <Timer className="size-3.5" aria-hidden />
              <dt className="sr-only">Duration</dt>
              <dd>{runState.result.durationMs} ms</dd>
            </div>
            <div className="flex items-center gap-1.5">
              <dt className="sr-only">Tested at</dt>
              <dd>
                <time dateTime={runState.result.testedAt}>
                  {new Date(runState.result.testedAt).toLocaleTimeString()}
                </time>
              </dd>
            </div>
          </dl>
        )}
      </div>

      <div aria-live="polite">{renderBody()}</div>
    </section>
  );
}
