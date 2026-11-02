import { useState, type JSX } from 'react';
import { KeyRound, Trash } from 'lucide-react';
import { DataTable, type DataTableColumn } from '@/components/common';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import type { ApiKey, ApiKeyTableProps } from '../../@types';
import { formatCreatedAt } from '../../utils';
import { ApiKeyStatusCell } from './ApiKeyStatusCell';
import { ApiKeyValueCell } from './ApiKeyValueCell';

/** API keys on the shared DataTable: name, masked key, status, created, delete. */
export function ApiKeyTable({
  apiKeys,
  isLoading,
  newKeyIds,
  emptyState,
  onToggleActive,
  onDelete,
}: ApiKeyTableProps): JSX.Element {
  // Which keys are shown in full — view state, so it lives here.
  const [revealedIds, setRevealedIds] = useState<ReadonlySet<string>>(
    new Set(),
  );

  const handleToggleReveal = (apiKey: ApiKey): void => {
    setRevealedIds((current) => {
      const next = new Set(current);
      if (next.has(apiKey.id)) {
        next.delete(apiKey.id);
      } else {
        next.add(apiKey.id);
      }
      return next;
    });
  };

  const columns: Array<DataTableColumn<ApiKey>> = [
    {
      key: 'name',
      header: 'Name',
      headClassName: 'w-1/4',
      skeletonClassName: 'w-40',
      cell: (apiKey) => (
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-accent text-primary">
            <KeyRound aria-hidden className="size-4" />
          </span>
          <span
            title={apiKey.name}
            className="truncate font-medium text-foreground"
          >
            {apiKey.name}
          </span>
        </div>
      ),
    },
    {
      key: 'key',
      header: 'API key',
      headClassName: 'w-1/4',
      skeletonClassName: 'w-36',
      cell: (apiKey) => (
        <ApiKeyValueCell
          apiKey={apiKey}
          isRevealed={revealedIds.has(apiKey.id)}
          onToggleReveal={handleToggleReveal}
        />
      ),
    },
    {
      key: 'status',
      header: 'Status',
      skeletonClassName: 'w-28',
      cell: (apiKey) => (
        <ApiKeyStatusCell apiKey={apiKey} onToggleActive={onToggleActive} />
      ),
    },
    {
      key: 'created',
      header: 'Created',
      skeletonClassName: 'w-32',
      cell: (apiKey) => (
        <time
          dateTime={apiKey.createdAt}
          className="text-muted-foreground tabular-nums"
        >
          {formatCreatedAt(apiKey.createdAt)}
        </time>
      ),
    },
    {
      key: 'actions',
      header: <span className="sr-only">Actions</span>,
      headClassName: 'w-16',
      cellClassName: 'text-right',
      skeletonClassName: 'ml-auto w-7',
      cell: (apiKey) => (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => onDelete(apiKey)}
              aria-label={`Delete ${apiKey.name}`}
              className="size-8 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
            >
              <Trash aria-hidden />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Delete key</TooltipContent>
        </Tooltip>
      ),
    },
  ];

  return (
    <DataTable
      ariaLabel="API keys"
      columns={columns}
      rows={apiKeys}
      getRowKey={(apiKey) => apiKey.id}
      isLoading={isLoading}
      emptyState={emptyState}
      rowClassName={(apiKey) =>
        newKeyIds.has(apiKey.id)
          ? 'bg-accent/50 animate-in fade-in-0 slide-in-from-top-1'
          : undefined
      }
    />
  );
}
