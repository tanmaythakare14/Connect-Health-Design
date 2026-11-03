import type { JSX } from 'react';
import { ListFilter, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { UsageFilterBarProps } from '../../../@types';
import {
  USAGE_ALL_FILTER_OPTION,
  USAGE_SLOT_FILTER_OPTIONS,
  USAGE_SOURCE_FILTER_OPTIONS,
} from '../../../constants';
import { isUsageFilter } from '../../../utils';

const FILTER_GROUPS = [
  { label: 'Connection source', options: USAGE_SOURCE_FILTER_OPTIONS },
  { label: 'Slot usage', options: USAGE_SLOT_FILTER_OPTIONS },
];

/** Search by connection name; narrow by source or by how connections count. */
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
          placeholder="Search by connection name"
          aria-label="Search by connection name"
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
          <SelectItem value={USAGE_ALL_FILTER_OPTION.value}>
            {USAGE_ALL_FILTER_OPTION.label}
          </SelectItem>
          {FILTER_GROUPS.map((group) => (
            <SelectGroup key={group.label}>
              <SelectSeparator />
              <SelectLabel>{group.label}</SelectLabel>
              {group.options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectGroup>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
