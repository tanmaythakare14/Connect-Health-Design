import type { JSX } from 'react';
import {
  Circle,
  CircleAlert,
  CircleCheck,
  LoaderCircle,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type {
  ConnectionTestStepDisplayStatus,
  ConnectionTestStepItemProps,
} from '../../@types';

const STATUS_ICONS: Record<ConnectionTestStepDisplayStatus, LucideIcon> = {
  passed: CircleCheck,
  failed: CircleAlert,
  pending: Circle,
  running: LoaderCircle,
};

const STATUS_ICON_CLASS_NAMES: Record<ConnectionTestStepDisplayStatus, string> =
  {
    passed: 'text-emerald-600 dark:text-emerald-400',
    failed: 'text-destructive',
    pending: 'text-muted-foreground/50',
    running: 'animate-spin text-primary',
  };

const STATUS_SR_LABELS: Record<ConnectionTestStepDisplayStatus, string> = {
  passed: 'Passed',
  failed: 'Failed',
  pending: 'Not run',
  running: 'Running',
};

/** One step in the results timeline: icon + connector, title, then details or error. */
export function ConnectionTestStepItem({
  title,
  description,
  status,
  details,
  error,
  isLast,
}: ConnectionTestStepItemProps): JSX.Element {
  const Icon = STATUS_ICONS[status];
  const isMuted = status === 'pending';

  return (
    <li className="relative flex gap-4 pb-6 last:pb-0">
      {/* Connector line to the next step */}
      {!isLast && (
        <span
          aria-hidden
          className="absolute top-7 bottom-1 left-2.5 w-px -translate-x-1/2 bg-border"
        />
      )}

      <span className="relative flex size-5 shrink-0 items-center justify-center bg-card">
        <Icon
          className={cn('size-5', STATUS_ICON_CLASS_NAMES[status])}
          aria-hidden
        />
      </span>

      <div className="min-w-0 flex-1 space-y-3">
        <div className="space-y-0.5">
          <p
            className={cn(
              'text-sm font-semibold',
              isMuted ? 'text-muted-foreground' : 'text-foreground',
            )}
          >
            {title}
            <span className="sr-only"> — {STATUS_SR_LABELS[status]}</span>
          </p>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>

        {details && details.length > 0 && (
          <dl className="space-y-1.5 rounded-lg border bg-muted/40 px-4 py-3 text-sm">
            {details.map((detail) => (
              <div key={detail.label} className="flex gap-4">
                <dt className="w-36 shrink-0 text-muted-foreground">
                  {detail.label}
                </dt>
                <dd className="min-w-0 font-medium wrap-anywhere text-foreground">
                  {detail.value}
                </dd>
              </div>
            ))}
          </dl>
        )}

        {error && (
          <div className="overflow-hidden rounded-lg border border-destructive/25 bg-destructive/5">
            <p className="px-4 py-2.5 text-sm font-medium text-destructive">
              {error.message}
            </p>
            {error.response && (
              <pre className="overflow-x-auto border-t border-destructive/15 bg-background/60 px-4 py-3 font-mono text-xs leading-relaxed text-foreground">
                <code>{error.response}</code>
              </pre>
            )}
          </div>
        )}
      </div>
    </li>
  );
}
