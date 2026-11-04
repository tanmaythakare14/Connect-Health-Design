import type { JSX } from 'react';
import { Code2, Hash, type LucideIcon } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { cn } from '@/lib/utils';
import type { TargetValueMode, ValueModeToggleProps } from '../../@types';
import { TARGET_VALUE_MODE } from '../../constants';

const MODES: Array<{
  value: TargetValueMode;
  label: string;
  icon: LucideIcon;
}> = [
  { value: TARGET_VALUE_MODE.CONSTANT, label: 'Constant value', icon: Hash },
  {
    value: TARGET_VALUE_MODE.EXPRESSION,
    label: 'Expression (ƒx)',
    icon: Code2,
  },
];

/** Full-width two-way switch: a fixed value, or one worked out per message. */
export function ValueModeToggle({
  value,
  onChange,
}: ValueModeToggleProps): JSX.Element {
  return (
    <RadioGroup
      value={value}
      onValueChange={(next) => {
        const mode = MODES.find((item) => item.value === next);
        if (mode) onChange(mode.value);
      }}
      aria-label="How this field gets its value"
      className="grid grid-cols-2 gap-0 rounded-lg border bg-muted/50 p-0.5"
    >
      {MODES.map(({ value: mode, label, icon: Icon }) => {
        const isActive = value === mode;
        return (
          <label
            key={mode}
            className={cn(
              'flex cursor-pointer items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors duration-150',
              'has-focus-visible:ring-[3px] has-focus-visible:ring-ring/50',
              isActive
                ? 'bg-background text-primary shadow-xs'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            <RadioGroupItem value={mode} className="sr-only" />
            <Icon aria-hidden className="size-3.5" />
            {label}
          </label>
        );
      })}
    </RadioGroup>
  );
}
