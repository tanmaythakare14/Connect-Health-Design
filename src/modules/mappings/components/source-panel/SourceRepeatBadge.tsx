import type { JSX } from 'react';
import { Repeat } from 'lucide-react';
import type { SourceRepeatBadgeProps } from '../../@types';

/** "May repeat" for a repeatable segment, "×18" when the sample has several. */
export function SourceRepeatBadge({
  repeat,
}: SourceRepeatBadgeProps): JSX.Element {
  const isCount = repeat.kind === 'count';

  return (
    <span
      title={
        isCount
          ? `Appears ${repeat.count} times in the sample`
          : 'This segment can appear more than once'
      }
      className="inline-flex shrink-0 items-center gap-1 rounded-full bg-amber-50 px-1.5 py-px text-[10px] font-semibold text-amber-700 dark:bg-amber-950/60 dark:text-amber-300"
    >
      <Repeat aria-hidden className="size-2.5" />
      {isCount ? `×${repeat.count}` : 'May repeat'}
    </span>
  );
}
