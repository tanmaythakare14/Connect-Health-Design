import type { JSX } from 'react';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import type { ApiKeyStatusCellProps } from '../../@types';

/** On/off switch with an Active / Inactive badge. */
export function ApiKeyStatusCell({
  apiKey,
  onToggleActive,
}: ApiKeyStatusCellProps): JSX.Element {
  const { isActive, name } = apiKey;

  return (
    <div className="flex items-center gap-3">
      <Switch
        checked={isActive}
        onCheckedChange={() => onToggleActive(apiKey)}
        aria-label={isActive ? `Deactivate ${name}` : `Activate ${name}`}
      />
      <Badge
        variant="outline"
        className={cn(
          'gap-1.5 rounded-full font-medium',
          isActive
            ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300'
            : 'border-destructive/25 bg-destructive/10 text-destructive',
        )}
      >
        <span
          aria-hidden
          className={cn(
            'size-1.5 rounded-full',
            isActive ? 'bg-emerald-500' : 'bg-destructive',
          )}
        />
        {isActive ? 'Active' : 'Inactive'}
      </Badge>
    </div>
  );
}
