import type { JSX } from 'react';
import { cn } from '@/lib/utils';
import type { SourceTypeIconProps, SourceValueType } from '../../@types';

const TYPE_STYLES: Record<
  SourceValueType,
  { glyph: string; label: string; className: string }
> = {
  text: {
    glyph: 'T',
    label: 'Text',
    className: 'bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300',
  },
  datetime: {
    glyph: 'DT',
    label: 'Date / time',
    className:
      'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300',
  },
  number: {
    glyph: '#',
    label: 'Number',
    className:
      'bg-violet-50 text-violet-700 dark:bg-violet-950/60 dark:text-violet-300',
  },
  boolean: {
    glyph: 'Y/N',
    label: 'Yes / no',
    className:
      'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300',
  },
};

/** A small coloured tile naming the kind of value a field holds. */
export function SourceTypeIcon({
  valueType,
}: SourceTypeIconProps): JSX.Element {
  const { glyph, label, className } = TYPE_STYLES[valueType];

  return (
    <span
      title={label}
      aria-label={label}
      className={cn(
        'inline-flex h-4.5 min-w-4.5 shrink-0 items-center justify-center rounded px-0.5 font-mono text-[9px] leading-none font-bold',
        className,
      )}
    >
      {glyph}
    </span>
  );
}
