import type { JSX } from 'react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { cn } from '@/lib/utils';
import type { OutputTypePickerProps } from '../../@types';
import { TEMPLATE_OUTPUT_TYPE_OPTIONS } from '../../constants';

/** Output formats as pills; the chosen one's description sits underneath. */
export function OutputTypePicker({
  value,
  onChange,
  disabled = false,
}: OutputTypePickerProps): JSX.Element {
  const selected = TEMPLATE_OUTPUT_TYPE_OPTIONS.find(
    (option) => option.value === value,
  );

  return (
    <div className="space-y-2">
      <RadioGroup
        value={value}
        onValueChange={(next) => {
          const option = TEMPLATE_OUTPUT_TYPE_OPTIONS.find(
            (item) => item.value === next,
          );
          if (option) onChange(option.value);
        }}
        disabled={disabled}
        aria-label="Output type"
        className="flex flex-wrap gap-2"
      >
        {TEMPLATE_OUTPUT_TYPE_OPTIONS.map((option) => {
          const isActive = option.value === value;
          return (
            <label
              key={option.value}
              className={cn(
                'flex h-8 cursor-pointer items-center rounded-full border px-3.5 text-sm font-medium transition-colors duration-150',
                'has-focus-visible:ring-[3px] has-focus-visible:ring-ring/50',
                isActive
                  ? 'border-primary/50 bg-accent text-primary'
                  : 'bg-background text-muted-foreground hover:border-primary/30 hover:text-foreground',
                disabled && 'cursor-not-allowed opacity-60',
              )}
            >
              <RadioGroupItem value={option.value} className="sr-only" />
              {option.label}
            </label>
          );
        })}
      </RadioGroup>
      {selected && (
        <p aria-live="polite" className="text-xs text-muted-foreground">
          {selected.description}
        </p>
      )}
    </div>
  );
}
