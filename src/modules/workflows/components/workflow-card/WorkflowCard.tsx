import type { JSX } from 'react';
import { Clock, Waypoints } from 'lucide-react';
import type { WorkflowCardProps } from '../../@types';
import { formatUpdatedLabel } from '../../utils';
import { WorkflowCardMenu } from './WorkflowCardMenu';
import { WorkflowConnectionChips } from './WorkflowConnectionChips';
import { WorkflowStatusBadge } from './WorkflowStatusBadge';
import { WorkflowStatusToggleButton } from './WorkflowStatusToggleButton';

export function WorkflowCard({
  workflow,
  onOpen,
  onToggleStatus,
  onExport,
  onSettings,
  onDelete,
}: WorkflowCardProps): JSX.Element {
  const { name, description, connections, nodeCount, updatedAt, status } =
    workflow;

  return (
    <article className="group relative flex h-full flex-col rounded-xl border bg-card p-5 transition-all duration-200 ease-out focus-within:border-primary/60 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <h2 className="min-w-0 text-sm leading-snug font-semibold text-foreground">
          {/* The ::after overlay stretches this button over the whole card,
              so the card opens with one click target and a single tab stop. */}
          <button
            type="button"
            onClick={() => onOpen(workflow)}
            title={name}
            className="line-clamp-2 text-left wrap-anywhere outline-none after:absolute after:inset-0 after:rounded-xl after:content-[''] focus-visible:underline"
          >
            {name}
          </button>
        </h2>
        <WorkflowStatusBadge status={status} />
      </div>

      <p
        title={description ?? undefined}
        className="mt-2 line-clamp-2 text-sm text-muted-foreground"
      >
        {description ?? (
          <span className="italic opacity-70">No description provided.</span>
        )}
      </p>

      <div className="mt-4">
        <WorkflowConnectionChips connections={connections} />
      </div>

      {/* mt-auto pins the footer to the bottom so cards in a row line up */}
      <div className="mt-auto pt-5">
        <div className="flex items-center justify-between border-t pt-3">
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Waypoints className="size-3.5" aria-hidden />
              <span>
                <span className="font-medium text-foreground">{nodeCount}</span>{' '}
                {nodeCount === 1 ? 'node' : 'nodes'}
              </span>
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="size-3.5" aria-hidden />
              <time dateTime={updatedAt}>{formatUpdatedLabel(updatedAt)}</time>
            </span>
          </div>
          <div className="flex items-center gap-0.5">
            <WorkflowStatusToggleButton
              workflowName={name}
              status={status}
              onToggleStatus={() => onToggleStatus(workflow)}
            />
            <WorkflowCardMenu
              workflowName={name}
              onExport={() => onExport(workflow)}
              onSettings={() => onSettings(workflow)}
              onDelete={() => onDelete(workflow)}
            />
          </div>
        </div>
      </div>
    </article>
  );
}
