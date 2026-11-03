import type { JSX } from 'react';
import { Badge } from '@/components/ui/badge';
import type { MappingFormatBadgeProps } from '../../@types';
import { MAPPING_FORMAT_LABELS } from '../../constants';

/** The message format a project reads, e.g. "HL7" or "JSON". */
export function MappingFormatBadge({
  format,
}: MappingFormatBadgeProps): JSX.Element {
  return (
    <Badge
      variant="outline"
      className="rounded-md border-primary/30 bg-accent px-1.5 py-0 text-[11px] font-semibold tracking-wide text-primary"
    >
      {MAPPING_FORMAT_LABELS[format]}
    </Badge>
  );
}
