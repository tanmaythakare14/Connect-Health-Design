import type { JSX } from 'react';
import { ArrowUpDown, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { ListToolbarProps } from '../../@types';

/**
 * Search, sort and the result count on the left; page actions on the right.
 * Shared by the projects grid and a project's templates grid.
 */
export function ListToolbar<TSort extends string>({
  search,
  onSearchChange,
  searchPlaceholder,
  sort,
  sortOptions,
  onSortChange,
  count,
  countNoun,
  actions,
  disabled = false,
}: ListToolbarProps<TSort>): JSX.Element {
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
            placeholder={`${searchPlaceholder}...`}
            aria-label={searchPlaceholder}
            className="bg-background pl-9"
            disabled={disabled}
          />
        </div>

        <Select
          value={sort}
          onValueChange={(value) => {
            const option = sortOptions.find((item) => item.value === value);
            if (option) onSortChange(option.value);
          }}
          disabled={disabled}
        >
          <SelectTrigger className="w-48 bg-background" aria-label="Sort by">
            <ArrowUpDown aria-hidden />
            <SelectValue />
          </SelectTrigger>
          <SelectContent align="start">
            {sortOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {count !== null && (
          <span
            aria-live="polite"
            className="text-sm text-muted-foreground tabular-nums"
          >
            {count} {count === 1 ? countNoun.one : countNoun.other}
          </span>
        )}
      </div>

      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}
