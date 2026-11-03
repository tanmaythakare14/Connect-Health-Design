import type { JSX } from 'react';
import { cn } from '@/lib/utils';
import type { CharacterCountProps } from '../../@types';

/** "12/150" under a field; turns red at the limit. */
export function CharacterCount({
  length,
  max,
}: CharacterCountProps): JSX.Element {
  return (
    <span
      aria-hidden
      className={cn(
        'ml-auto shrink-0 text-xs tabular-nums',
        length >= max ? 'text-destructive' : 'text-muted-foreground',
      )}
    >
      {length}/{max}
    </span>
  );
}
