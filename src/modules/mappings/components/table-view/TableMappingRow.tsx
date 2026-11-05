import type { JSX } from 'react';
import { ArrowRight, Layers, Split, Trash2, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import type { TableMappingRowProps } from '../../@types';
import { OccurrencePicker } from './OccurrencePicker';
import { SourceModeToggle } from './SourceModeToggle';
import { TableFieldBox } from './TableFieldBox';

const ICON_BUTTON_CLASS_NAME =
  'flex size-7 shrink-0 items-center justify-center rounded-md outline-none transition-colors focus-visible:ring-[3px] focus-visible:ring-ring/50';

/**
 * One mapping in the Table view: where the value comes from (a ref or an
 * expression), where it goes, and the rules on the way.
 */
export function TableMappingRow({
  row,
  onChange,
  onRemove,
  onEditRules,
}: TableMappingRowProps): JSX.Element {
  const rowLabel = row.targetLabel || row.targetPath || 'New mapping';
  const isExpression = row.mode === 'expression';
  // Liquid strings inside the compiled JSON must use single quotes.
  const expressionError =
    isExpression && row.expression.includes('"')
      ? 'Double quotes break the compiled JSON — use single quotes in Liquid strings.'
      : null;
  const hasRules = row.rules.length > 0;

  return (
    <li className="space-y-2.5 border-b px-3 py-3 last:border-b-0">
      {(row.multiSource || row.occurrence) && (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
          {row.multiSource && (
            <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
              <Layers aria-hidden className="size-3.5" />
              Source {row.multiSource.position} of {row.multiSource.total} for{' '}
              <span className="font-medium text-foreground">
                “{row.targetLabel}”
              </span>
            </span>
          )}
          {row.occurrence && (
            <OccurrencePicker
              mode={row.occurrence}
              index={row.occurrenceIndex}
              onChange={({ mode, index }) =>
                onChange({
                  ...(mode && { occurrence: mode }),
                  ...(index !== undefined && { occurrenceIndex: index }),
                })
              }
              rowLabel={rowLabel}
            />
          )}
        </div>
      )}

      <div className="flex items-start gap-2">
        <SourceModeToggle
          value={row.mode}
          onChange={(mode) => onChange({ mode })}
          rowLabel={rowLabel}
        />

        <div className="grid min-w-0 flex-1 grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-start gap-2">
          <div className="min-w-0">
            {isExpression ? (
              <Input
                value={row.expression}
                onChange={(event) =>
                  onChange({ expression: event.target.value })
                }
                placeholder="e.g. {{ PID.5.2 | upcase }}"
                aria-label={`${rowLabel}: expression`}
                aria-invalid={expressionError ? true : undefined}
                autoComplete="off"
                spellCheck={false}
                className="h-12 min-w-0 font-mono text-xs"
              />
            ) : (
              <TableFieldBox
                label={row.sourceLabel}
                code={row.sourceRef}
                placeholder="e.g. PID.5.1"
                ariaLabel={`${rowLabel}: source ref`}
                onType={(value) => onChange({ sourceRef: value.toUpperCase() })}
              />
            )}
            {expressionError && (
              <p role="alert" className="mt-1.5 text-xs text-destructive">
                {expressionError}
              </p>
            )}
          </div>

          <ArrowRight
            aria-hidden
            className="mt-4 size-4 shrink-0 text-muted-foreground/60"
          />

          <TableFieldBox
            label={row.targetLabel}
            code={row.targetPath}
            placeholder="e.g. name[0].family"
            ariaLabel={`${rowLabel}: target path`}
            onType={(value) => onChange({ targetPath: value })}
          />
        </div>

        <div className="mt-2.5 flex shrink-0 items-center gap-0.5">
          <button
            type="button"
            onClick={onEditRules}
            aria-label={`Rules for ${rowLabel}`}
            title={hasRules ? `${row.rules.length} rules` : 'Rules'}
            className={cn(
              ICON_BUTTON_CLASS_NAME,
              hasRules
                ? 'bg-primary/10 text-primary hover:bg-primary/15'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground',
            )}
          >
            <Split aria-hidden className="size-3.5" />
          </button>
          <button
            type="button"
            onClick={onRemove}
            aria-label={`Delete ${rowLabel}`}
            title="Delete mapping"
            className={cn(
              ICON_BUTTON_CLASS_NAME,
              'text-muted-foreground hover:bg-destructive/10 hover:text-destructive',
            )}
          >
            <Trash2 aria-hidden className="size-3.5" />
          </button>
        </div>
      </div>

      {hasRules && (
        <ul
          aria-label={`Rules for ${rowLabel}`}
          className="flex flex-wrap gap-1.5 pl-18"
        >
          {row.rules.map((rule) => (
            <li
              key={rule}
              className="inline-flex h-6 items-center gap-1 rounded-full border border-primary/30 bg-accent pr-1 pl-2.5 text-[11px] font-medium text-primary"
            >
              {rule}
              <button
                type="button"
                onClick={() =>
                  onChange({ rules: row.rules.filter((item) => item !== rule) })
                }
                aria-label={`Remove rule “${rule}” from ${rowLabel}`}
                className="flex size-4 items-center justify-center rounded-full outline-none transition-colors hover:bg-primary/15 focus-visible:ring-2 focus-visible:ring-ring/50"
              >
                <X aria-hidden className="size-3" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </li>
  );
}
