import type { JSX } from 'react';
import { Code2, Hash, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { SourceModeToggleProps, TableSourceMode } from '../../@types';

const MODES: Array<{
  value: TableSourceMode;
  label: string;
  icon: LucideIcon;
}> = [
  { value: 'ref', label: 'Ref', icon: Hash },
  { value: 'expression', label: 'Expr', icon: Code2 },
];

/** A small stacked switch: read a source field, or write an expression. */
export function SourceModeToggle({
  value,
  onChange,
  rowLabel,
}: SourceModeToggleProps): JSX.Element {
  return (
    <div
      role="radiogroup"
      aria-label={`${rowLabel}: source type`}
      className="flex w-16 shrink-0 flex-col gap-0.5 rounded-md border bg-muted/50 p-0.5"
    >
      {MODES.map(({ value: mode, label, icon: Icon }) => {
        const isActive = value === mode;
        return (
          <button
            key={mode}
            type="button"
            role="radio"
            aria-checked={isActive}
            onClick={() => onChange(mode)}
            className={cn(
              'flex h-6 items-center justify-center gap-1 rounded text-[11px] font-semibold outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring/50',
              isActive
                ? 'bg-primary text-primary-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            <Icon aria-hidden className="size-3" />
            {label}
          </button>
        );
      })}
    </div>
  );
}
