import type { JSX } from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { RawEventLevelBadgeProps } from '../../@types';
import { RAW_EVENT_LEVEL, RAW_EVENT_LEVEL_LABELS } from '../../constants';

/** Neutral chip; only the dot carries the level's colour. */
export function RawEventLevelBadge({
  level,
}: RawEventLevelBadgeProps): JSX.Element {
  return (
    <Badge
      variant="outline"
      className="gap-1.5 rounded-md border-border bg-muted/60 font-medium text-muted-foreground"
    >
      <span
        aria-hidden
        className={cn(
          'size-1.5 rounded-full',
          level === RAW_EVENT_LEVEL.WARN ? 'bg-amber-500' : 'bg-blue-500',
        )}
      />
      {RAW_EVENT_LEVEL_LABELS[level]}
    </Badge>
  );
}
