import type { JSX } from 'react';
import { cn } from '@/lib/utils';
import type { TemplateStatusIndicatorProps } from '../../@types';
import {
  MAPPING_TEMPLATE_STATUS,
  MAPPING_TEMPLATE_STATUS_LABELS,
} from '../../constants';

/** A coloured dot and label: green when ready to run, amber while a draft. */
export function TemplateStatusIndicator({
  status,
}: TemplateStatusIndicatorProps): JSX.Element {
  const isReady = status === MAPPING_TEMPLATE_STATUS.READY;

  return (
    <span className="flex items-center gap-1.5">
      <span
        aria-hidden
        className={cn(
          'size-1.5 rounded-full',
          isReady ? 'bg-emerald-500' : 'bg-amber-500',
        )}
      />
      <span
        className={cn(
          'font-medium',
          isReady
            ? 'text-emerald-700 dark:text-emerald-400'
            : 'text-amber-700 dark:text-amber-400',
        )}
      >
        {MAPPING_TEMPLATE_STATUS_LABELS[status]}
      </span>
    </span>
  );
}
