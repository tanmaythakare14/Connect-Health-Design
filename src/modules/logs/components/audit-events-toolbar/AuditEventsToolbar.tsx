import type { JSX } from 'react';
import { CircleDot, RefreshCw, Search } from 'lucide-react';
import { DateRangeFilter } from '@/components/common';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import type { AuditEventsToolbarProps } from '../../@types';
import { AUDIT_STATUS_FILTER_OPTIONS } from '../../constants';
import { isAuditStatusFilter } from '../../utils';
import { AuditUserFilter } from './AuditUserFilter';

export function AuditEventsToolbar({
  search,
  onSearchChange,
  dateRange,
  onDateRangeChange,
  status,
  onStatusChange,
  user,
  onUserChange,
  isRefreshing,
  onRefresh,
  disabled = false,
}: AuditEventsToolbarProps): JSX.Element {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex min-w-0 flex-1 flex-wrap items-center gap-3">
        <div className="relative w-full max-w-md">
          <Search
            aria-hidden
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            type="search"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search audit events, correlation ID and more…"
            aria-label="Search audit events, correlation ID and more"
            className="bg-background pl-9"
          />
        </div>

        <DateRangeFilter
          value={dateRange}
          onChange={onDateRangeChange}
          placeholder="All time"
          disabled={disabled}
        />

        <Select
          value={status}
          onValueChange={(value) => {
            if (isAuditStatusFilter(value)) onStatusChange(value);
          }}
          disabled={disabled}
        >
          <SelectTrigger
            className="w-44 bg-background"
            aria-label="Filter by status"
          >
            <CircleDot aria-hidden />
            <SelectValue />
          </SelectTrigger>
          <SelectContent align="start">
            {AUDIT_STATUS_FILTER_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <AuditUserFilter
          value={user}
          onChange={onUserChange}
          disabled={disabled}
        />
      </div>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            onClick={onRefresh}
            disabled={disabled || isRefreshing}
            aria-label={isRefreshing ? 'Refreshing events' : 'Refresh events'}
          >
            <RefreshCw
              aria-hidden
              className={cn(isRefreshing && 'animate-spin')}
            />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          {isRefreshing ? 'Refreshing…' : 'Refresh'}
        </TooltipContent>
      </Tooltip>
    </div>
  );
}
