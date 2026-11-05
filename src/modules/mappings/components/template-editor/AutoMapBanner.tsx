import type { JSX } from 'react';
import { Check, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { AutoMapBannerProps } from '../../@types';

/**
 * One slim line under the tabs while auto-map guesses wait for review: how
 * many, how to review them, and the two ways to settle them all.
 */
export function AutoMapBanner({
  count,
  onAcceptAll,
  onDiscard,
}: AutoMapBannerProps): JSX.Element {
  return (
    <div
      role="status"
      className="flex shrink-0 items-center gap-3 border-b border-amber-500/25 bg-amber-50 px-4 py-1.5 text-xs animate-in fade-in-0 slide-in-from-top-1 duration-200 dark:bg-amber-500/10"
    >
      <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-amber-500/15">
        <Sparkles
          aria-hidden
          className="size-3.5 text-amber-600 dark:text-amber-400"
        />
      </span>
      <p className="min-w-0 flex-1 truncate text-muted-foreground">
        <span className="font-semibold text-amber-700 dark:text-amber-400">
          {count} suggested {count === 1 ? 'mapping' : 'mappings'}.
        </span>{' '}
        Dashed amber lines are guesses — click one to accept or reject it, or
        settle them all here.
      </p>
      <div className="flex shrink-0 items-center gap-1.5">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onDiscard}
          className="h-7 px-2.5 text-xs text-muted-foreground"
        >
          Discard
        </Button>
        <Button
          type="button"
          size="sm"
          onClick={onAcceptAll}
          className="h-7 px-2.5 text-xs"
        >
          <Check aria-hidden className="size-3.5" />
          Accept all
        </Button>
      </div>
    </div>
  );
}
