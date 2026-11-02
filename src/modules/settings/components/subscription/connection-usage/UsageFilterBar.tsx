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
import type { UsageFilterBarProps } from '../../../@types';
import { USAGE_FILTER_OPTIONS } from '../../../constants';
import { isUsageFilter } from '../../../utils';

/** Search by connection or EHR, and narrow by how connections count. */
export function UsageFilterBar({
  search,
  onSearchChange,
  filter,
  onFilterChange,
}: UsageFilterBarProps): JSX.Element {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative w-full max-w-sm">
        <Search
          aria-hidden
          className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          type="search"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Filter connections…"
          aria-label="Filter connections by name, EHR or organization"
          className="bg-background pl-9"
        />
      </div>
      <Select
        value={filter}
        onValueChange={(value) => {
          if (isUsageFilter(value)) onFilterChange(value);
        }}
      >
        <SelectTrigger
          className="w-48 bg-background"
          aria-label="Show connections"
        >
          <ListFilter aria-hidden />
          <SelectValue />
        </SelectTrigger>
        <SelectContent align="start">
          {USAGE_FILTER_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
