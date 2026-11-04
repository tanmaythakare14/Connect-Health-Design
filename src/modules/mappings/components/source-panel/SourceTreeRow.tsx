import type { JSX } from 'react';
import { Braces, ChevronRight, CircleCheck, Pencil, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { SourceTreeRowProps } from '../../@types';
import { SourceRepeatBadge } from './SourceRepeatBadge';
import { SourceTypeIcon } from './SourceTypeIcon';
import { SourceNameEditor } from './SourceNameEditor';

const INDENT_PX = 16;
const BASE_INDENT_PX = 4;

const ACTION_BUTTON_CLASS_NAME =
  'flex size-6 shrink-0 items-center justify-center rounded-md text-muted-foreground opacity-0 transition-opacity outline-none group-hover/row:opacity-100 hover:bg-background hover:text-foreground focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-ring/50';

/**
 * One line of the source tree. Segments are plain headings; fields show
 * their ref and sample value, and the port a mapping thread starts from.
 * A field's edit action turns its name into a text box in place.
 */
export function SourceTreeRow({
  node,
  depth,
  isExpanded,
  isMapped,
  isSelected,
  onToggle,
  onSelect,
  isEditing,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onRemoveField,
}: SourceTreeRowProps): JSX.Element {
  const isSegment = depth === 0;
  const isBranch = node.children !== undefined;
  // Fields added by hand use their ref as their name; don't print it twice.
  const showRef = !isSegment && node.label !== node.ref;

  // The chevron slot and type icon, shared by the normal and editing layouts.
  const leading = (
    <>
      <span className="flex size-4 shrink-0 items-center justify-center text-muted-foreground">
        {isBranch && (
          <ChevronRight
            aria-hidden
            className={cn(
              'size-3.5 transition-transform duration-150',
              isExpanded && 'rotate-90',
            )}
          />
        )}
      </span>
      {node.valueType ? (
        <SourceTypeIcon valueType={node.valueType} />
      ) : (
        <span
          aria-hidden
          className="flex size-4.5 shrink-0 items-center justify-center rounded bg-muted text-muted-foreground"
        >
          <Braces className="size-3" />
        </span>
      )}
    </>
  );

  const handleClick = (): void => {
    if (isBranch) onToggle(node.ref);
    else onSelect(node.ref);
  };

  return (
    <div
      id={`source-row-${node.ref}`}
      style={{ paddingLeft: BASE_INDENT_PX + depth * INDENT_PX }}
      className={cn(
        'group/row flex h-8 items-center gap-1 rounded-md pr-1.5 transition-colors',
        isSelected || isEditing
          ? 'bg-accent ring-1 ring-primary/30 ring-inset'
          : isMapped
            ? 'bg-accent/50 hover:bg-accent/80'
            : 'hover:bg-muted/70',
      )}
    >
      {isEditing ? (
        <div className="flex h-full min-w-0 flex-1 items-center gap-1.5">
          {leading}
          <SourceNameEditor
            fieldRef={node.ref}
            initialName={node.label}
            onSave={(name) => onSaveEdit(node.ref, name)}
            onCancel={onCancelEdit}
          />
        </div>
      ) : (
        <button
          type="button"
          onClick={handleClick}
          aria-expanded={isBranch ? isExpanded : undefined}
          aria-pressed={isBranch ? undefined : isSelected}
          className="flex h-full min-w-0 flex-1 items-center gap-1.5 rounded-md text-left outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
        >
          {leading}
          <span
            className={cn(
              'truncate text-[13px]',
              isSegment
                ? 'font-semibold text-foreground'
                : 'text-foreground/90',
            )}
          >
            {node.label}
          </span>
          {showRef && (
            <span className="shrink-0 font-mono text-[10.5px] text-muted-foreground">
              {node.ref}
            </span>
          )}
          {node.repeat && <SourceRepeatBadge repeat={node.repeat} />}
        </button>
      )}

      {!isSegment && !isEditing && (
        <>
          {node.value && (
            <span
              title={node.value}
              className={cn(
                'ml-2 max-w-[42%] truncate text-right font-mono text-[11px]',
                isMapped ? 'text-primary' : 'text-muted-foreground',
              )}
            >
              {node.value}
            </span>
          )}
          {isMapped && (
            <CircleCheck
              aria-label="Mapped"
              className="size-3.5 shrink-0 text-emerald-600 dark:text-emerald-400"
            />
          )}

          <button
            type="button"
            onClick={() => onStartEdit(node.ref)}
            aria-label={`Rename ${node.label}`}
            title="Rename field"
            className={ACTION_BUTTON_CLASS_NAME}
          >
            <Pencil aria-hidden className="size-3.5" />
          </button>
          {onRemoveField && (
            <button
              type="button"
              onClick={() => onRemoveField(node.ref)}
              aria-label={`Remove ${node.ref}`}
              title="Remove"
              className={cn(ACTION_BUTTON_CLASS_NAME, 'hover:text-destructive')}
            >
              <X aria-hidden className="size-3.5" />
            </button>
          )}
        </>
      )}

      {/* Where a mapping thread starts; filled once mapped. Segments only
          get one when a repeating group is built from them. */}
      {(!isSegment || isMapped) && (
        <span
          id={`source-port-${node.ref}`}
          aria-hidden
          className={cn(
            'ml-0.5 size-2.5 shrink-0 rounded-full border-[1.5px] transition-all',
            isMapped
              ? 'border-primary bg-primary'
              : 'border-muted-foreground/50 bg-background',
          )}
        />
      )}
    </div>
  );
}
