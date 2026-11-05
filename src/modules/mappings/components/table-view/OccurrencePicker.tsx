import type { JSX } from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import type { OccurrenceMode, OccurrencePickerProps } from '../../@types';

const MODES: Array<{ value: OccurrenceMode; label: string; hint: string }> = [
  {
    value: 'all',
    label: 'All (loop)',
    hint: 'Read every occurrence of the segment',
  },
  {
    value: 'specific',
    label: 'Specific',
    hint: 'Read one occurrence, by its number',
  },
];

/** For a segment that can repeat: read all of them, or one by number. */
export function OccurrencePicker({
  mode,
  index,
  onChange,
  rowLabel,
}: OccurrencePickerProps): JSX.Element {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-muted-foreground">Occurrence</span>
      <div
        role="radiogroup"
        aria-label={`${rowLabel}: occurrence`}
        className="inline-flex gap-0.5 rounded-md border bg-muted/50 p-0.5"
      >
        {MODES.map((option) => {
          const isActive = mode === option.value;
          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={isActive}
              title={option.hint}
              onClick={() => onChange({ mode: option.value })}
              className={cn(
                'h-6 rounded px-2 text-[11px] font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring/50',
                isActive
                  ? 'bg-background text-primary shadow-xs'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {option.label}
            </button>
          );
        })}
      </div>
      {mode === 'specific' && (
        <Input
          type="number"
          min={1}
          value={index}
          onChange={(event) =>
            onChange({ index: Math.max(1, Number(event.target.value) || 1) })
          }
          aria-label={`${rowLabel}: occurrence number`}
          className="h-7 w-16 px-2 font-mono text-xs"
        />
      )}
    </div>
  );
}
