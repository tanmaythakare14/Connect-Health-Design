import { useEffect, useRef, useState, type JSX } from 'react';
import { Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { FhirResourcePickerProps } from '../../@types';

/** How far one arrow click scrolls the chip row. */
const SCROLL_STEP_PX = 240;

const ARROW_CLASS_NAME =
  'flex size-7 shrink-0 items-center justify-center rounded-full border bg-background text-muted-foreground shadow-xs outline-none transition-[color,opacity] hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-30';

/**
 * A row of FHIR resource chips that scrolls sideways, with arrows at either
 * end. Several can be picked; picking more than one builds a Bundle.
 */
export function FhirResourcePicker({
  options,
  selected,
  onToggle,
}: FhirResourcePickerProps): JSX.Element {
  const rowRef = useRef<HTMLDivElement>(null);
  const [canScrollBack, setCanScrollBack] = useState(false);
  const [canScrollForward, setCanScrollForward] = useState(false);

  /** Arrows only work when there's more row in that direction. */
  const updateArrows = (): void => {
    const row = rowRef.current;
    if (!row) return;
    setCanScrollBack(row.scrollLeft > 1);
    setCanScrollForward(row.scrollLeft + row.clientWidth < row.scrollWidth - 1);
  };

  useEffect(() => {
    updateArrows();
    const row = rowRef.current;
    if (!row) return;
    const resizes = new ResizeObserver(updateArrows);
    resizes.observe(row);
    return () => resizes.disconnect();
  }, []);

  const scrollBy = (direction: 1 | -1): void => {
    rowRef.current?.scrollBy({
      left: direction * SCROLL_STEP_PX,
      behavior: 'smooth',
    });
  };

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => scrollBy(-1)}
        disabled={!canScrollBack}
        aria-label="Show earlier resources"
        className={ARROW_CLASS_NAME}
      >
        <ChevronLeft aria-hidden className="size-4" />
      </button>

      <div
        ref={rowRef}
        onScroll={updateArrows}
        role="group"
        aria-label="FHIR resources"
        className={cn(
          'flex min-w-0 flex-1 gap-2 overflow-x-auto scroll-smooth py-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
          // Soft fade where chips run off either edge
          canScrollBack &&
            canScrollForward &&
            '[mask-image:linear-gradient(to_right,transparent,black_24px,black_calc(100%-24px),transparent)]',
          canScrollBack &&
            !canScrollForward &&
            '[mask-image:linear-gradient(to_right,transparent,black_24px)]',
          !canScrollBack &&
            canScrollForward &&
            '[mask-image:linear-gradient(to_right,black_calc(100%-24px),transparent)]',
        )}
      >
        {options.map((resource) => {
          const isSelected = selected.includes(resource);
          return (
            <button
              key={resource}
              type="button"
              aria-pressed={isSelected}
              onClick={() => onToggle(resource)}
              className={cn(
                'inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full border px-3.5 text-xs font-medium whitespace-nowrap outline-none transition-colors focus-visible:ring-[3px] focus-visible:ring-ring/50',
                isSelected
                  ? 'border-primary bg-primary text-primary-foreground shadow-xs'
                  : 'bg-background text-foreground hover:border-primary/50 hover:bg-accent',
              )}
            >
              {isSelected && <Check aria-hidden className="size-3.5" />}
              {resource}
            </button>
          );
        })}
      </div>

      <button
        type="button"
        onClick={() => scrollBy(1)}
        disabled={!canScrollForward}
        aria-label="Show more resources"
        className={ARROW_CLASS_NAME}
      >
        <ChevronRight aria-hidden className="size-4" />
      </button>
    </div>
  );
}
