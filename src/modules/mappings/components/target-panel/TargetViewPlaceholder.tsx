import type { JSX } from 'react';
import { Construction } from 'lucide-react';
import type { TargetViewPlaceholderProps } from '../../@types';

/** Stand-in for the Table and Liquid views until they're designed. */
export function TargetViewPlaceholder({
  title,
  description,
}: TargetViewPlaceholderProps): JSX.Element {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-2 px-8 py-12 text-center">
      <Construction aria-hidden className="size-5 text-muted-foreground" />
      <p className="text-sm font-semibold text-foreground">{title}</p>
      <p className="max-w-xs text-xs text-muted-foreground">{description}</p>
    </div>
  );
}
