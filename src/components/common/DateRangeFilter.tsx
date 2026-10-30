import { useState, type JSX } from 'react';
import { CalendarDays, ChevronDown, X } from 'lucide-react';
import type { DateRange } from 'react-day-picker';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import type { DateRangeFilterProps } from './types';

const dateWithYearFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
});

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
});

/**
 * "Oct 12 – Oct 30, 2026" (year once when both ends share it),
 * "Dec 28, 2025 – Jan 3, 2026", or one date for a single day.
 */
const formatRange = (range: DateRange | undefined): string | null => {
  if (!range?.from) return null;
  const from = range.from;
  const to = range.to ?? range.from;
  if (from.toDateString() === to.toDateString()) {
    return dateWithYearFormatter.format(from);
  }
  const fromLabel =
    from.getFullYear() === to.getFullYear()
      ? dateFormatter.format(from)
      : dateWithYearFormatter.format(from);
  return `${fromLabel} – ${dateWithYearFormatter.format(to)}`;
};

/**
 * Date range filter: a two-month calendar in a popover. Picks are drafted
 * until Apply, so closing the popover without applying changes nothing.
 */
export function DateRangeFilter({
  value,
  onChange,
  placeholder = 'All time',
  disabled = false,
}: DateRangeFilterProps): JSX.Element {
  const [isOpen, setIsOpen] = useState(false);
  const [draft, setDraft] = useState<DateRange | undefined>(value);

  const appliedLabel = formatRange(value);
  const draftLabel = formatRange(draft);

  // Every open starts from what's applied.
  const handleOpenChange = (open: boolean): void => {
    if (open) setDraft(value);
    setIsOpen(open);
  };

  const handleApply = (): void => {
    onChange(
      draft?.from
        ? { from: draft.from, to: draft.to ?? draft.from }
        : undefined,
    );
    setIsOpen(false);
  };

  const handleClear = (): void => {
    setDraft(undefined);
    onChange(undefined);
    setIsOpen(false);
  };

  return (
    <Popover open={isOpen} onOpenChange={handleOpenChange}>
      <div className="relative">
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            disabled={disabled}
            aria-label={
              appliedLabel ? `Date range: ${appliedLabel}` : 'Filter by date'
            }
            className={cn(
              'justify-start bg-background font-normal',
              appliedLabel && 'border-primary/40 pr-9 text-foreground',
            )}
          >
            <CalendarDays aria-hidden className="text-muted-foreground" />
            {appliedLabel ?? placeholder}
            {!appliedLabel && (
              <ChevronDown aria-hidden className="ml-1 opacity-50" />
            )}
          </Button>
        </PopoverTrigger>
        {appliedLabel && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleClear}
            disabled={disabled}
            aria-label="Clear date range"
            className="absolute top-1/2 right-1 size-7 -translate-y-1/2 text-muted-foreground"
          >
            <X aria-hidden />
          </Button>
        )}
      </div>

      <PopoverContent align="start" className="w-auto p-0">
        <Calendar
          mode="range"
          numberOfMonths={2}
          selected={draft}
          onSelect={setDraft}
          defaultMonth={
            draft?.from ??
            new Date(new Date().getFullYear(), new Date().getMonth() - 1)
          }
          disabled={{ after: new Date() }}
        />
        <div className="flex items-center justify-between gap-3 border-t px-3 py-2.5">
          <p className="text-xs text-muted-foreground" aria-live="polite">
            {draftLabel ?? 'Pick a start and end date'}
          </p>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClear}
              disabled={!draft?.from && !value}
            >
              Clear
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleApply}
              disabled={!draft?.from}
            >
              Apply
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
