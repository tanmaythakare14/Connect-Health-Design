import type { JSX } from 'react';
import { Clock, FileCode, FileText, CircleCheck } from 'lucide-react';
import { formatUpdatedLabel } from '@/utils/date';
import type { MappingProjectHeaderProps } from '../../@types';
import { MAPPING_TEMPLATE_STATUS } from '../../constants';
import { MappingFormatBadge } from '../mapping-project-card';

/**
 * The project's name, description and a stats line. Stats come from the
 * loaded templates so they stay right after adds and deletes.
 */
export function MappingProjectHeader({
  project,
  templates,
}: MappingProjectHeaderProps): JSX.Element {
  const templateCount = templates?.length ?? project.templateCount;
  const readyCount = templates?.filter(
    (template) => template.status === MAPPING_TEMPLATE_STATUS.READY,
  ).length;

  return (
    <div className="flex min-w-0 items-start gap-4">
      <span
        aria-hidden
        className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-accent text-primary"
      >
        <FileCode className="size-6" />
      </span>

      <div className="min-w-0 flex-1 space-y-1.5">
        <div className="flex flex-wrap items-center gap-2">
          <h1
            title={project.name}
            className="min-w-0 truncate text-2xl font-semibold tracking-tight text-foreground"
          >
            {project.name}
          </h1>
          {project.format && <MappingFormatBadge format={project.format} />}
        </div>

        {project.description && (
          <p
            title={project.description}
            className="truncate text-sm text-muted-foreground"
          >
            {project.description}
          </p>
        )}

        <dl className="flex flex-wrap items-center gap-x-5 gap-y-1 pt-0.5 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <FileText aria-hidden className="size-3.5" />
            <dt className="sr-only">Templates</dt>
            <dd>
              <span className="font-medium text-foreground tabular-nums">
                {templateCount}
              </span>{' '}
              {templateCount === 1 ? 'template' : 'templates'}
            </dd>
          </div>
          {readyCount !== undefined && templateCount > 0 && (
            <div className="flex items-center gap-1.5">
              <CircleCheck
                aria-hidden
                className="size-3.5 text-emerald-600 dark:text-emerald-400"
              />
              <dt className="sr-only">Ready</dt>
              <dd>
                <span className="font-medium text-foreground tabular-nums">
                  {readyCount}
                </span>{' '}
                ready
              </dd>
            </div>
          )}
          <div className="flex items-center gap-1.5">
            <Clock aria-hidden className="size-3.5" />
            <dt className="sr-only">Last updated</dt>
            <dd>
              Updated{' '}
              <time dateTime={project.updatedAt}>
                {/* "today" / "4d ago" read as a sentence; dates keep their case */}
                {formatUpdatedLabel(project.updatedAt).replace(
                  /^(Today|Yesterday)$/,
                  (word) => word.toLowerCase(),
                )}
              </time>
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
