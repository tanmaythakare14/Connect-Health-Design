import { useState, type FormEvent, type JSX } from 'react';
import { ChevronDown, Search, User, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import type { AuditUserFilterProps } from '../../@types';

const INPUT_ID = 'audit-user-filter';

/**
 * Filter by who did it: a search box in a popover. The typed name is a
 * draft until Search, so closing the popover changes nothing.
 */
export function AuditUserFilter({
  value,
  onChange,
  disabled = false,
}: AuditUserFilterProps): JSX.Element {
  const [isOpen, setIsOpen] = useState(false);
  const [draft, setDraft] = useState(value);
  const appliedUser = value.trim();

  // Every open starts from what's applied.
  const handleOpenChange = (open: boolean): void => {
    if (open) setDraft(value);
    setIsOpen(open);
  };

  const handleSearch = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    onChange(draft.trim());
    setIsOpen(false);
  };

  const handleClear = (): void => {
    setDraft('');
    onChange('');
    setIsOpen(false);
  };

  return (
    <Popover open={isOpen} onOpenChange={handleOpenChange}>
      <div className="relative">
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            disabled={disabled}
            aria-label={appliedUser ? `User: ${appliedUser}` : 'Filter by user'}
            className={cn(
              'max-w-56 justify-start bg-background font-normal',
              // has-[>svg]: matches Button's icon padding rule, which would
              // otherwise override pr-9 and run the text under the clear button.
              appliedUser &&
                'border-primary/40 pr-9 text-foreground has-[>svg]:pr-9',
            )}
          >
            <User aria-hidden className="text-muted-foreground" />
            <span className="truncate">
              {appliedUser ? `User: ${appliedUser}` : 'All users'}
            </span>
            {!appliedUser && (
              <ChevronDown aria-hidden className="ml-1 opacity-50" />
            )}
          </Button>
        </PopoverTrigger>
        {appliedUser && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleClear}
            disabled={disabled}
            aria-label="Clear user filter"
            className="absolute top-1/2 right-1 size-7 -translate-y-1/2 text-muted-foreground"
          >
            <X aria-hidden />
          </Button>
        )}
      </div>

      <PopoverContent align="start" className="w-72 p-0">
        <form onSubmit={handleSearch}>
          <div className="space-y-2 p-3">
            <label
              htmlFor={INPUT_ID}
              className="text-xs font-medium text-muted-foreground"
            >
              Filter by user
            </label>
            <div className="relative">
              <Search
                aria-hidden
                className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                id={INPUT_ID}
                type="search"
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                placeholder="Search by name or user ID"
                autoComplete="off"
                autoFocus
                className="pl-9"
              />
            </div>
          </div>
          <div className="flex items-center justify-end gap-2 border-t px-3 py-2.5">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClear}
              disabled={!draft && !appliedUser}
            >
              Clear
            </Button>
            <Button type="submit" size="sm" disabled={!draft.trim()}>
              Search
            </Button>
          </div>
        </form>
      </PopoverContent>
    </Popover>
  );
}
