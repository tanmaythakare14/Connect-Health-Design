import type { JSX } from 'react';
import { LoaderCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { RunListFooterProps } from '../../@types';

/** "Load more" while runs remain, then a quiet end-of-list note. */
export function RunListFooter({
  loadedCount,
  total,
  isLoadingMore,
  onLoadMore,
}: RunListFooterProps): JSX.Element {
  const hasMore = loadedCount < total;

  return (
    <div className="flex flex-col items-center gap-1.5 px-4 py-3">
      {hasMore ? (
        <Button
          variant="outline"
          size="sm"
          onClick={onLoadMore}
          disabled={isLoadingMore}
          className="rounded-full px-4"
        >
          {isLoadingMore && (
            <LoaderCircle aria-hidden className="animate-spin" />
          )}
          {isLoadingMore ? 'Loading…' : 'Load more'}
        </Button>
      ) : null}
      <p className="text-xs text-muted-foreground" aria-live="polite">
        {hasMore
          ? `Showing ${loadedCount} of ${total} runs`
          : `All ${total} ${total === 1 ? 'run' : 'runs'} loaded`}
      </p>
    </div>
  );
}
