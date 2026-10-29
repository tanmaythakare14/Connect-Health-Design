import type { JSX } from 'react';
import { Cable, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { WorkflowToolbarProps } from '../../@types';
import { ALL_CONNECTIONS_FILTER, NO_CONNECTIONS_FILTER } from '../../constants';

export function WorkflowToolbar({
  search,
  onSearchChange,
  connectionFilter,
  onConnectionFilterChange,
  connectionOptions,
  actions,
  disabled = false,
}: WorkflowToolbarProps): JSX.Element {
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
            placeholder="Search workflows..."
            aria-label="Search workflows"
            className="bg-background pl-9"
            disabled={disabled}
          />
        </div>

        <Select
          value={connectionFilter}
          onValueChange={onConnectionFilterChange}
          disabled={disabled}
        >
          <SelectTrigger
            className="w-56 bg-background"
            aria-label="Filter by connection"
          >
            <Cable aria-hidden />
            <SelectValue />
          </SelectTrigger>
          <SelectContent align="start">
            <SelectItem value={ALL_CONNECTIONS_FILTER}>
              All connections
            </SelectItem>
            <SelectItem value={NO_CONNECTIONS_FILTER}>
              No connections
            </SelectItem>
            {connectionOptions.length > 0 && <SelectSeparator />}
            {connectionOptions.map((connection) => (
              <SelectItem key={connection.id} value={connection.id}>
                {connection.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}
