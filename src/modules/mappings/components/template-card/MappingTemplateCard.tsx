import type { JSX } from 'react';
import { Clock, FileCode, ListTree } from 'lucide-react';
import { formatUpdatedLabel } from '@/utils/date';
import type { MappingTemplateCardProps } from '../../@types';
import { MappingTemplateCardMenu } from './MappingTemplateCardMenu';
import { TemplateFormatFlow } from './TemplateFormatFlow';
import { TemplateStatusIndicator } from './TemplateStatusIndicator';

export function MappingTemplateCard({
  template,
  onOpen,
  onEdit,
  onDelete,
}: MappingTemplateCardProps): JSX.Element {
  const {
    name,
    description,
    inputType,
    outputType,
    messageType,
    messageVersion,
    status,
    fieldCount,
    updatedAt,
  } = template;

  return (
    <article className="group relative flex h-full flex-col rounded-xl border bg-card p-5 transition-all duration-200 ease-out focus-within:border-primary/60 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md">
      <div className="flex items-start gap-3">
        <span
          aria-hidden
          className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-accent text-primary transition-colors duration-200 group-hover:bg-primary group-hover:text-primary-foreground"
        >
          <FileCode className="size-4.5" />
        </span>
        <h3 className="min-w-0 flex-1 self-center text-sm leading-snug font-semibold text-foreground">
          {/* The ::after overlay stretches this button over the whole card,
              so the card opens with one click target and a single tab stop. */}
          <button
            type="button"
            onClick={() => onOpen(template)}
            title={name}
            className="line-clamp-2 text-left wrap-anywhere outline-none after:absolute after:inset-0 after:rounded-xl after:content-[''] focus-visible:underline"
          >
            {name}
          </button>
        </h3>
      </div>

      <p
        title={description ?? undefined}
        className="mt-3 line-clamp-2 text-sm text-muted-foreground"
      >
        {description ?? (
          <span className="italic opacity-70">No description provided.</span>
        )}
      </p>

      <div className="mt-3">
        <TemplateFormatFlow
          inputType={inputType}
          outputType={outputType}
          messageType={messageType}
          messageVersion={messageVersion}
        />
      </div>

      {/* mt-auto pins the footer to the bottom so cards in a row line up */}
      <div className="mt-auto pt-4">
        <div className="flex items-center justify-between border-t pt-3">
          <div className="flex min-w-0 flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <TemplateStatusIndicator status={status} />
            <span className="flex items-center gap-1.5">
              <ListTree className="size-3.5" aria-hidden />
              <span>
                <span className="font-medium text-foreground">
                  {fieldCount}
                </span>{' '}
                {fieldCount === 1 ? 'field' : 'fields'}
              </span>
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="size-3.5" aria-hidden />
              <time dateTime={updatedAt}>{formatUpdatedLabel(updatedAt)}</time>
            </span>
          </div>
          <MappingTemplateCardMenu
            templateName={name}
            onEdit={() => onEdit(template)}
            onDelete={() => onDelete(template)}
          />
        </div>
      </div>
    </article>
  );
}
