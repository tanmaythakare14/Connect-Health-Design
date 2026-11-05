import type { JSX } from 'react';
import {
  ArrowLeft,
  Brackets,
  Braces,
  ChevronRight,
  CircleCheck,
  Code2,
  Hash,
  Pencil,
  Split,
  Trash2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { TargetTreeRowProps } from '../../@types';
import { describeValue, hasTargetValue } from '../../utils';
import { SourceTypeIcon } from '../source-panel';
import { TargetAddMenu } from './TargetAddMenu';

const INDENT_PX = 16;

const ICON_BUTTON_CLASS_NAME =
  'flex size-6 shrink-0 items-center justify-center rounded-md outline-none transition-[color,background-color,opacity] focus-visible:ring-2 focus-visible:ring-ring/50';

/** Hidden until the row is hovered (or the button is reached by keyboard). */
const HOVER_REVEAL_CLASS_NAME =
  'opacity-0 group-hover/row:opacity-100 focus-visible:opacity-100';

/**
 * One target field. The port on the left is where a mapping thread lands;
 * mapped fields show the source they come from, unmapped ones offer a value.
 */
export function TargetTreeRow({
  node,
  depth,
  isExpanded,
  isSelected,
  onToggle,
  onSelect,
  onEditValue,
  onEditRules,
  onDeleteField,
  onAddField,
}: TargetTreeRowProps): JSX.Element {
  const isBranch = node.children !== undefined;
  const isGroup = node.repeatSource !== undefined;
  // A list split into numbered items ("Item 1", "Item 2"…)
  const itemCount =
    node.children?.filter((child) => child.itemIndex !== undefined).length ?? 0;
  const isMapped = isBranch ? isGroup : node.source !== undefined;
  const conditionCount = node.conditions?.length ?? 0;

  const handleClick = (): void => {
    if (isBranch) onToggle(node.path);
    else onSelect(node.path);
  };

  return (
    <div
      id={`target-row-${node.path}`}
      className={cn(
        'group/row flex h-8 items-center gap-1 rounded-md pr-1.5 pl-1.5 transition-colors',
        isSelected
          ? 'bg-accent ring-1 ring-primary/30 ring-inset'
          : isMapped && !isBranch
            ? 'bg-accent/50 hover:bg-accent/80'
            : 'hover:bg-muted/70',
      )}
    >
      {/* Where a mapping thread lands; filled once mapped. */}
      <span
        id={`target-port-${node.path}`}
        aria-hidden
        className={cn(
          'size-2.5 shrink-0 rounded-full border-[1.5px]',
          isMapped
            ? 'border-primary bg-primary'
            : 'border-muted-foreground/50 bg-background',
        )}
      />

      <button
        type="button"
        onClick={handleClick}
        aria-expanded={isBranch ? isExpanded : undefined}
        aria-pressed={isBranch ? undefined : isSelected}
        style={{ paddingLeft: depth * INDENT_PX }}
        className="ml-1 flex h-full min-w-0 flex-1 items-center gap-1.5 rounded-md text-left outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
      >
        {isBranch && (
          <ChevronRight
            aria-hidden
            className={cn(
              'size-3.5 shrink-0 text-muted-foreground transition-transform duration-150',
              isExpanded && 'rotate-90',
            )}
          />
        )}

        {node.valueType ? (
          <SourceTypeIcon valueType={node.valueType} />
        ) : (
          <span
            aria-hidden
            className="flex size-4.5 shrink-0 items-center justify-center rounded bg-muted text-muted-foreground"
          >
            {isGroup || node.isList ? (
              <Brackets className="size-3" />
            ) : (
              <Braces className="size-3" />
            )}
          </span>
        )}

        <span
          className={cn(
            'truncate text-[13px]',
            isBranch ? 'font-semibold text-foreground' : 'text-foreground/90',
          )}
        >
          {node.label}
        </span>
        {!isBranch && (
          <span className="shrink truncate font-mono text-[10.5px] text-muted-foreground">
            {node.path}
            {node.isList && '[]'}
          </span>
        )}
        {itemCount > 0 && (
          <span className="inline-flex shrink-0 items-center rounded-full bg-amber-50 px-1.5 py-px text-[10px] font-semibold text-amber-700 dark:bg-amber-950/60 dark:text-amber-300">
            list of {itemCount} items
          </span>
        )}
        {isGroup && (
          <span
            title={`One item per ${node.repeatSource} segment`}
            className="inline-flex shrink-0 items-center gap-1 rounded-full bg-amber-50 px-1.5 py-px font-mono text-[10px] font-semibold text-amber-700 dark:bg-amber-950/60 dark:text-amber-300"
          >
            per {node.repeatSource}
          </span>
        )}
      </button>

      {!isBranch && (
        <>
          {node.source ? (
            <>
              <span
                title={`From ${node.source.ref} · ${node.source.label}`}
                className="ml-2 inline-flex h-5 max-w-[45%] min-w-0 items-center gap-1 rounded-md border border-primary/20 bg-background/80 px-1.5 text-[11px] text-primary"
              >
                <ArrowLeft aria-hidden className="size-3 shrink-0" />
                <span className="truncate">{node.source.label}</span>
              </span>
              <CircleCheck
                aria-label="Mapped"
                className="size-3.5 shrink-0 text-emerald-600 dark:text-emerald-400"
              />
            </>
          ) : (
            <>
              {node.customValue !== undefined && (
                <span
                  title={`Constant value: ${describeValue(node.customValue)}`}
                  className="ml-2 inline-flex h-5 max-w-[45%] min-w-0 items-center gap-1 rounded-md border border-amber-300/60 bg-amber-50 px-1.5 font-mono text-[11px] text-amber-800 dark:border-amber-800/60 dark:bg-amber-950/50 dark:text-amber-300"
                >
                  <Hash aria-hidden className="size-3 shrink-0" />
                  <span className="truncate">
                    {describeValue(node.customValue)}
                  </span>
                </span>
              )}
              {node.expression && (
                <span
                  title={`Expression: ${node.expression}`}
                  className="ml-2 inline-flex h-5 max-w-[45%] min-w-0 items-center gap-1 rounded-md border border-sky-300/60 bg-sky-50 px-1.5 font-mono text-[11px] text-sky-800 dark:border-sky-800/60 dark:bg-sky-950/50 dark:text-sky-300"
                >
                  <Code2 aria-hidden className="size-3 shrink-0" />
                  <span className="truncate">{node.expression}</span>
                </span>
              )}
              {hasTargetValue(node) && (
                <CircleCheck
                  aria-label="Has a value"
                  className="size-3.5 shrink-0 text-emerald-600 dark:text-emerald-400"
                />
              )}
              <button
                type="button"
                onClick={() => onEditValue(node)}
                aria-label={
                  hasTargetValue(node)
                    ? `Change the value of ${node.label}`
                    : `Set a value for ${node.label}`
                }
                title={hasTargetValue(node) ? 'Change value' : 'Set a value'}
                className={cn(
                  ICON_BUTTON_CLASS_NAME,
                  'text-muted-foreground hover:bg-background hover:text-foreground',
                )}
              >
                <Pencil aria-hidden className="size-3.5" />
              </button>
            </>
          )}

          <button
            type="button"
            onClick={() => onEditRules(node)}
            aria-label={`Field rules for ${node.label}`}
            title={node.hasRules ? 'Field rules (in use)' : 'Field rules'}
            className={cn(
              ICON_BUTTON_CLASS_NAME,
              node.hasRules
                ? 'bg-primary/10 text-primary hover:bg-primary/15'
                : 'text-muted-foreground hover:bg-background hover:text-foreground',
            )}
          >
            <Split aria-hidden className="size-3.5" />
          </button>
        </>
      )}

      {/* Objects and groups: their own rules, and adding a field inside. */}
      {isBranch && (
        <>
          <button
            type="button"
            onClick={() => onEditRules(node)}
            aria-label={
              conditionCount > 0
                ? `Conditions for ${node.label} (${conditionCount})`
                : `Conditions for ${node.label}`
            }
            title={
              conditionCount > 0
                ? `${conditionCount} ${conditionCount === 1 ? 'condition' : 'conditions'}`
                : 'Conditions'
            }
            className={cn(
              ICON_BUTTON_CLASS_NAME,
              'ml-auto',
              // Groups with conditions keep the button on show, tinted.
              conditionCount > 0
                ? 'bg-primary/10 text-primary hover:bg-primary/15'
                : cn(
                    HOVER_REVEAL_CLASS_NAME,
                    'text-muted-foreground hover:bg-background hover:text-foreground',
                  ),
            )}
          >
            <Split aria-hidden className="size-3.5" />
          </button>
          <TargetAddMenu
            node={node}
            onSelect={(kind) => onAddField(node, kind)}
            className={cn(
              ICON_BUTTON_CLASS_NAME,
              HOVER_REVEAL_CLASS_NAME,
              'bg-primary text-primary-foreground shadow-xs hover:bg-primary/90',
            )}
          />
        </>
      )}

      <button
        type="button"
        onClick={() => onDeleteField(node)}
        aria-label={`Delete ${node.label}`}
        title={isBranch ? 'Delete group' : 'Delete field'}
        className={cn(
          ICON_BUTTON_CLASS_NAME,
          HOVER_REVEAL_CLASS_NAME,
          !isBranch && 'ml-auto',
          'text-muted-foreground hover:bg-destructive/10 hover:text-destructive',
        )}
      >
        <Trash2 aria-hidden className="size-3.5" />
      </button>
    </div>
  );
}
