import type { JSX } from 'react';
import { Clock, FileCode, FileText } from 'lucide-react';
import { formatUpdatedLabel } from '@/utils/date';
import type { MappingProjectCardProps } from '../../@types';
import { MappingFormatBadge } from './MappingFormatBadge';
import { MappingProjectCardMenu } from './MappingProjectCardMenu';

export function MappingProjectCard({
  project,
  onOpen,
  onEditDetails,
  onDuplicate,
  onExport,
  onDelete,
}: MappingProjectCardProps): JSX.Element {
  const { name, description, format, templateCount, updatedAt } = project;

  return (
    <article className="group relative flex h-full flex-col rounded-xl border bg-card p-5 transition-all duration-200 ease-out focus-within:border-primary/60 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md">
      <div className="flex items-start gap-3">
        <span
          aria-hidden
          className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-accent text-primary"
        >
          <FileCode className="size-4.5" />
        </span>
        <h2 className="min-w-0 flex-1 self-center text-sm leading-snug font-semibold text-foreground">
          {/* The ::after overlay stretches this button over the whole card,
              so the card opens with one click target and a single tab stop. */}
          <button
            type="button"
            onClick={() => onOpen(project)}
            title={name}
            className="line-clamp-2 text-left wrap-anywhere outline-none after:absolute after:inset-0 after:rounded-xl after:content-[''] focus-visible:underline"
          >
            {name}
          </button>
        </h2>
      </div>

      <p
        title={description ?? undefined}
        className="mt-3 line-clamp-2 text-sm text-muted-foreground"
      >
        {description ?? (
          <span className="italic opacity-70">No description provided.</span>
        )}
      </p>

      {format && (
        <div className="mt-3">
          <MappingFormatBadge format={format} />
        </div>
      )}

      {/* mt-auto pins the footer to the bottom so cards in a row line up */}
      <div className="mt-auto pt-4">
        <div className="flex items-center justify-between border-t pt-3">
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <FileText className="size-3.5" aria-hidden />
              <span>
                <span className="font-medium text-foreground">
                  {templateCount}
                </span>{' '}
                {templateCount === 1 ? 'template' : 'templates'}
              </span>
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="size-3.5" aria-hidden />
              <time dateTime={updatedAt}>{formatUpdatedLabel(updatedAt)}</time>
            </span>
          </div>
          <MappingProjectCardMenu
            projectName={name}
            onEditDetails={() => onEditDetails(project)}
            onDuplicate={() => onDuplicate(project)}
            onExport={() => onExport(project)}
            onDelete={() => onDelete(project)}
          />
        </div>
      </div>
    </article>
  );
}
