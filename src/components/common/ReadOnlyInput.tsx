import type { JSX } from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import type { ReadOnlyInputProps } from './types';

/**
 * A value the user can see but not change. It stays focusable and readable
 * by screen readers (unlike `disabled`), but looks clearly locked: grey
 * surface, muted text, not-allowed cursor, and no primary-coloured focus
 * border or text-selection highlight.
 */
export function ReadOnlyInput({
  className,
  ...props
}: ReadOnlyInputProps): JSX.Element {
  return (
    <Input
      readOnly
      aria-readonly
      className={cn(
        'cursor-not-allowed border-input bg-muted text-muted-foreground shadow-none',
        'focus-visible:border-input focus-visible:ring-0',
        'selection:bg-muted-foreground/20 selection:text-foreground',
        className,
      )}
      {...props}
    />
  );
}
