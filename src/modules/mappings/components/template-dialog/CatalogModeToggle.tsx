import type { JSX } from 'react';
import { List, PenLine } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { cn } from '@/lib/utils';
import type { CatalogMode, CatalogModeToggleProps } from '../../@types';
import { CATALOG_MODE } from '../../constants';

const MODES: Array<{ value: CatalogMode; label: string; icon: typeof List }> = [
  { value: CATALOG_MODE.CATALOG, label: 'From catalog', icon: List },
  { value: CATALOG_MODE.CUSTOM, label: 'Custom', icon: PenLine },
];

/** A compact two-way switch: pick from the catalog, or type a value. */
export function CatalogModeToggle({
  value,
  onChange,
  label,
  disabled = false,
}: CatalogModeToggleProps): JSX.Element {
  return (
    <RadioGroup
      value={value}
      onValueChange={(next) => {
        const mode = MODES.find((item) => item.value === next);
        if (mode) onChange(mode.value);
      }}
      aria-label={label}
      disabled={disabled}
      className="inline-flex gap-0 rounded-lg border bg-muted/50 p-0.5"
    >
      {MODES.map(({ value: mode, label: modeLabel, icon: Icon }) => {
        const isActive = value === mode;
        return (
          <label
            key={mode}
            className={cn(
              'flex cursor-pointer items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors duration-150',
              'has-focus-visible:ring-[3px] has-focus-visible:ring-ring/50',
              isActive
                ? 'bg-background text-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground',
              disabled && 'cursor-not-allowed opacity-60',
            )}
          >
            <RadioGroupItem value={mode} className="sr-only" />
            <Icon aria-hidden className="size-3.5" />
            {modeLabel}
          </label>
        );
      })}
    </RadioGroup>
  );
}
