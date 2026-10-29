import type { JSX } from 'react';
import { ListFilter, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { ConnectionToolbarProps } from '../../@types';
import { ALL_TYPES_FILTER, CONNECTION_TYPE_OPTIONS } from '../../constants';
import { isConnectionTypeFilter } from '../../utils';
import { ConnectionUsageBadge } from './ConnectionUsageBadge';

export function ConnectionToolbar({
  search,
  onSearchChange,
  typeFilter,
  onTypeFilterChange,
  usage,
  onUsageInfo,
  actions,
  disabled = false,
}: ConnectionToolbarProps): JSX.Element {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex min-w-0 flex-1 flex-wrap items-center gap-3">
        <div className="relative w-full max-w-sm">
          <Search
            aria-hidden
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            type="search"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search connections..."
            aria-label="Search connections"
            className="bg-background pl-9"
            disabled={disabled}
          />
        </div>

        {usage && <ConnectionUsageBadge usage={usage} onInfo={onUsageInfo} />}
      </div>

      <div className="flex items-center gap-2">
        <Select
          value={typeFilter}
          onValueChange={(value) => {
            if (isConnectionTypeFilter(value)) {
              onTypeFilterChange(value);
            }
          }}
          disabled={disabled}
        >
          <SelectTrigger
            className="w-44 bg-background"
            aria-label="Filter by type"
          >
            <ListFilter aria-hidden />
            <SelectValue />
          </SelectTrigger>
          <SelectContent align="end">
            <SelectItem value={ALL_TYPES_FILTER}>All types</SelectItem>
            {CONNECTION_TYPE_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {actions}
      </div>
    </div>
  );
}
