import type { JSX } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { ConnectionUsageBadgeProps } from '../../@types';

export function ConnectionUsageBadge({
  usage,
  onInfo,
}: ConnectionUsageBadgeProps): JSX.Element {
  return (
    <Badge
      variant="outline"
      className="h-7 gap-1 rounded-full border-border bg-muted/60 px-3 text-xs font-normal text-muted-foreground"
    >
      <span>
        <span className="font-semibold text-foreground">{usage.used}</span> of{' '}
        <span className="font-semibold text-foreground">{usage.limit}</span>{' '}
        connections used
      </span>
      <span aria-hidden>·</span>
      <Button
        variant="link"
        className="h-auto p-0 text-xs font-medium"
        onClick={onInfo}
      >
        How are these counted?
      </Button>
    </Badge>
  );
}
