import type { JSX } from 'react';
import { CircleDot, Layers, RefreshCw, Search, Workflow } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import type { RunsToolbarProps } from '../../@types';
import {
  ALL_RUN_STATUSES_FILTER,
  ALL_WORKFLOWS_FILTER,
  RUN_STATUS,
  RUN_STATUS_FILTER_OPTIONS,
} from '../../constants';
import { isRunStatusFilter } from '../../utils';
import { RunStatsBadges } from './RunStatsBadges';

export function RunsToolbar({
  search,
  onSearchChange,
  workflowFilter,
  onWorkflowFilterChange,
  workflowOptions,
  statusFilter,
  onStatusFilterChange,
  isGrouped,
  onGroupedChange,
  isRefreshing,
  onRefresh,
  stats,
  disabled = false,
}: RunsToolbarProps): JSX.Element {
  const isShowingNeedAttention = statusFilter === RUN_STATUS.FAILED;

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
            placeholder="Search by run ID, correlation ID or workflow"
            aria-label="Search runs by run ID, correlation ID or workflow"
            className="bg-background pl-9"
          />
        </div>

        <Select
          value={workflowFilter}
          onValueChange={onWorkflowFilterChange}
          disabled={disabled}
        >
          <SelectTrigger
            className="w-56 bg-background"
            aria-label="Filter by workflow"
          >
            <Workflow aria-hidden />
            <SelectValue />
          </SelectTrigger>
          <SelectContent align="start">
            <SelectItem value={ALL_WORKFLOWS_FILTER}>All workflows</SelectItem>
            {workflowOptions.length > 0 && <SelectSeparator />}
            {workflowOptions.map((workflow) => (
              <SelectItem key={workflow.id} value={workflow.id}>
                {workflow.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={statusFilter}
          onValueChange={(value) => {
            if (isRunStatusFilter(value)) onStatusFilterChange(value);
          }}
          disabled={disabled}
        >
          <SelectTrigger
            className="w-48 bg-background"
            aria-label="Filter by status"
          >
            <CircleDot aria-hidden />
            <SelectValue />
          </SelectTrigger>
          <SelectContent align="start">
            {RUN_STATUS_FILTER_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {stats && (
          <RunStatsBadges
            stats={stats}
            isShowingNeedAttention={isShowingNeedAttention}
            // Toggles: a second click goes back to every status.
            onShowNeedAttention={() =>
              onStatusFilterChange(
                isShowingNeedAttention
                  ? ALL_RUN_STATUSES_FILTER
                  : RUN_STATUS.FAILED,
              )
            }
          />
        )}
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          onClick={() => onGroupedChange(!isGrouped)}
          aria-pressed={isGrouped}
          disabled={disabled}
          className={cn(
            isGrouped &&
              'border-primary/40 bg-accent text-accent-foreground hover:bg-accent hover:text-accent-foreground',
          )}
        >
          <Layers aria-hidden />
          Group by workflow
        </Button>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              onClick={onRefresh}
              disabled={disabled || isRefreshing}
              aria-label={isRefreshing ? 'Refreshing runs' : 'Refresh runs'}
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
    </div>
  );
}
