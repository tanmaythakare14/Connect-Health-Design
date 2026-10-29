import type { JSX } from 'react';
import { cn } from '@/lib/utils';
import type { EmptyStateProps } from './types';

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  tone = 'default',
}: EmptyStateProps): JSX.Element {
  return (
    <div
      role={tone === 'destructive' ? 'alert' : undefined}
      className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center"
    >
      <span
        className={cn(
          'flex size-11 items-center justify-center rounded-full',
          tone === 'destructive'
            ? 'bg-destructive/10 text-destructive'
            : 'bg-accent text-primary',
        )}
      >
        <Icon className="size-5" aria-hidden />
      </span>
      <div className="space-y-1">
        <p className="text-sm font-semibold text-foreground">{title}</p>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}
