import type { JSX } from 'react';
import { cn } from '@/lib/utils';
import type { RunStatsBadgesProps } from '../../@types';

const countFormatter = new Intl.NumberFormat('en-US');

const CHIP_CLASS_NAME =
  'inline-flex h-7 items-center gap-1 rounded-full border bg-muted/60 px-3 text-xs whitespace-nowrap text-muted-foreground';

/**
 * Last-24h run volume, plus how many runs need attention. The second chip
 * filters the list to runs with errors.
 */
export function RunStatsBadges({
  stats,
  isShowingNeedAttention,
  onShowNeedAttention,
}: RunStatsBadgesProps): JSX.Element {
  const { runsLast24h, needAttentionCount } = stats;
  const hasIssues = needAttentionCount > 0;

  return (
    <div className="flex items-center gap-2">
      <span className={CHIP_CLASS_NAME}>
        <span className="font-semibold text-foreground tabular-nums">
          {countFormatter.format(runsLast24h)}
        </span>
        <span aria-hidden>·</span>
        runs
        <span aria-hidden>·</span>
        24h
      </span>

      <button
        type="button"
        onClick={onShowNeedAttention}
        disabled={!hasIssues}
        aria-pressed={isShowingNeedAttention}
        title={hasIssues ? 'Show runs with errors' : undefined}
        className={cn(
          CHIP_CLASS_NAME,
          'outline-none transition-colors focus-visible:ring-[3px] focus-visible:ring-ring/50',
          hasIssues &&
            'cursor-pointer hover:border-amber-300 hover:bg-amber-50 dark:hover:border-amber-800 dark:hover:bg-amber-950/40',
          isShowingNeedAttention &&
            'border-amber-300 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/40',
        )}
      >
        <span
          className={cn(
            'font-semibold tabular-nums',
            hasIssues
              ? 'text-amber-600 dark:text-amber-400'
              : 'text-foreground',
          )}
        >
          {countFormatter.format(needAttentionCount)}
        </span>
        need attention
      </button>
    </div>
  );
}
