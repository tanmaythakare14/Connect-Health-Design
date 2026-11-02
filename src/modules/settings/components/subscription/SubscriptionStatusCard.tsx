import type { JSX } from 'react';
import { CalendarClock, Package, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { SubscriptionStatusCardProps } from '../../@types';
import { daysUntil, formatExpiryDate } from '../../utils';
import { UsageRing } from './UsageRing';

/** Renewal reminders turn amber inside this many days */
const EXPIRY_WARNING_DAYS = 30;

/** Hero card: integrations used vs. the plan, plan name and expiry. */
export function SubscriptionStatusCard({
  planName,
  used,
  limit,
  remaining,
  expiresAt,
}: SubscriptionStatusCardProps): JSX.Element {
  const daysLeft = daysUntil(expiresAt);
  const isExpiringSoon = daysLeft <= EXPIRY_WARNING_DAYS;

  return (
    <article
      aria-labelledby="subscription-status-heading"
      className="relative flex flex-col gap-6 overflow-hidden rounded-2xl border bg-linear-to-br from-accent via-card to-card p-6 shadow-xs"
    >
      {/* Soft brand glow in the corner */}
      <span
        aria-hidden
        className="pointer-events-none absolute -top-20 -right-20 size-56 rounded-full bg-primary/15 blur-3xl"
      />

      <div className="relative flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-xs">
            <Package aria-hidden className="size-5" />
          </span>
          <h3
            id="subscription-status-heading"
            className="text-sm font-semibold text-foreground"
          >
            Subscription status
          </h3>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-card/80 px-3 py-1 text-xs font-medium text-primary backdrop-blur">
          <Sparkles aria-hidden className="size-3.5" />
          {planName}
        </span>
      </div>

      <div className="relative flex flex-wrap items-center justify-between gap-6">
        <div className="space-y-1">
          <p className="flex items-baseline gap-1.5 text-foreground">
            <span className="text-5xl font-semibold tracking-tight tabular-nums">
              {used}
            </span>
            <span className="text-xl text-muted-foreground tabular-nums">
              / {limit}
            </span>
          </p>
          <p className="text-sm text-muted-foreground">
            Integrations used ·{' '}
            <span className="font-medium text-foreground">
              {remaining} remaining
            </span>
          </p>
        </div>
        <UsageRing used={used} limit={limit} />
      </div>

      <div className="relative mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-primary/10 pt-4 text-sm">
        <span className="flex items-center gap-2 text-muted-foreground">
          <CalendarClock aria-hidden className="size-4" />
          Expires on
          <time dateTime={expiresAt} className="font-medium text-foreground">
            {formatExpiryDate(expiresAt)}
          </time>
        </span>
        <span
          className={cn(
            'rounded-full px-2.5 py-0.5 text-xs font-medium tabular-nums',
            isExpiringSoon
              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300'
              : 'bg-primary/10 text-primary',
          )}
        >
          {daysLeft} {daysLeft === 1 ? 'day' : 'days'} left
        </span>
      </div>
    </article>
  );
}
