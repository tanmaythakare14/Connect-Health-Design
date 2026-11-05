import {
  Fragment,
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type JSX,
} from 'react';
import { Info, ListFilter, Plus, Save, SlidersHorizontal } from 'lucide-react';
import { FormDialog } from '@/components/common';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { GroupCondition, GroupConditionsDialogProps } from '../../@types';
import { MAX_VISIBLE_CONDITIONS } from '../../constants';
import {
  conditionsPathOf,
  createGroupCondition,
  groupConditionProblem,
} from '../../utils';
import { ConditionCard } from './ConditionCard';

/**
 * The rules a group (and everything inside it) must pass to be written.
 * Conditions are ANDed; with none, the group is always written. Past three,
 * the list scrolls so the buttons stay in view.
 */
export function GroupConditionsDialog({
  open,
  onOpenChange,
  node,
  onSave,
}: GroupConditionsDialogProps): JSX.Element {
  const [conditions, setConditions] = useState<GroupCondition[]>([]);
  // The card just added: it gets the cursor and is scrolled into view.
  const [addedId, setAddedId] = useState<string | null>(null);
  const listRef = useRef<HTMLOListElement>(null);
  const path = node ? conditionsPathOf(node) : '';

  // Each open starts from the group's conditions, or one blank to fill in.
  useEffect(() => {
    if (!open) return;
    setConditions(
      node?.conditions?.length ? node.conditions : [createGroupCondition()],
    );
    setAddedId(null);
  }, [open, node]);

  useEffect(() => {
    if (!addedId) return;
    listRef.current
      ?.querySelector(`[data-condition-id="${addedId}"]`)
      ?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }, [addedId]);

  const isScrolling = conditions.length > MAX_VISIBLE_CONDITIONS;
  const isComplete = conditions.every(
    (condition) => groupConditionProblem(condition) === null,
  );
  const hadConditions = Boolean(node?.conditions?.length);
  // Removing every condition is a real change only if there were some.
  const canSubmit = isComplete && (conditions.length > 0 || hadConditions);

  const updateCondition = (
    id: string,
    patch: Partial<GroupCondition>,
  ): void => {
    setConditions((current) =>
      current.map((condition) =>
        condition.id === id ? { ...condition, ...patch } : condition,
      ),
    );
  };

  const addCondition = (): void => {
    const condition = createGroupCondition();
    setConditions((current) => [...current, condition]);
    setAddedId(condition.id);
  };

  const removeCondition = (id: string): void => {
    setConditions((current) =>
      current.filter((condition) => condition.id !== id),
    );
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    if (!node || !canSubmit) return;
    onSave(
      node.path,
      conditions.map((condition) => ({
        ...condition,
        ref: condition.ref.trim(),
        value: condition.value.trim(),
        liquid: condition.liquid.trim(),
      })),
    );
    onOpenChange(false);
  };

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={
        <span className="flex items-center gap-2">
          <SlidersHorizontal aria-hidden className="size-4.5 text-primary" />
          Conditions for
          <code className="rounded-md bg-accent px-1.5 py-0.5 font-mono text-sm font-medium text-primary">
            {path}
          </code>
        </span>
      }
      onSubmit={handleSubmit}
      submitLabel={
        conditions.length === 0 && hadConditions
          ? 'Remove conditions'
          : 'Save conditions'
      }
      submitIcon={Save}
      isSubmitting={false}
      canSubmit={canSubmit}
      className="sm:max-w-xl"
    >
      <div className="space-y-4">
        <div className="flex gap-2 rounded-lg border border-sky-200 bg-sky-50 px-3 py-2.5 text-xs text-sky-900 dark:border-sky-900/60 dark:bg-sky-950/40 dark:text-sky-200">
          <Info aria-hidden className="mt-px size-3.5 shrink-0" />
          <p>
            This group, and everything inside it, is written only when{' '}
            <span className="font-semibold">all</span> the conditions below
            hold. When they don’t, the whole group is left out of the output.
          </p>
        </div>

        {conditions.length === 0 ? (
          <div className="flex flex-col items-center gap-1.5 rounded-lg border border-dashed px-6 py-8 text-center">
            <ListFilter aria-hidden className="size-5 text-muted-foreground" />
            <p className="text-sm font-medium text-foreground">No conditions</p>
            <p className="text-xs text-muted-foreground">
              {hadConditions
                ? 'Save to remove them — this group will always be written.'
                : 'This group is always written. Add a condition to write it only sometimes.'}
            </p>
          </div>
        ) : (
          <ol
            ref={listRef}
            aria-label="Conditions"
            className={cn(
              // Past three conditions the list scrolls; the buttons stay put.
              isScrolling &&
                '-mr-2 max-h-[min(46vh,25rem)] overflow-y-auto pr-2',
            )}
          >
            {conditions.map((condition, index) => (
              <Fragment key={condition.id}>
                {index > 0 && (
                  <li
                    aria-hidden
                    className="flex items-center gap-2 py-1.5 pl-3"
                  >
                    <span className="h-3 w-px bg-border" />
                    <span className="rounded-full bg-muted px-2 py-px font-mono text-[10px] font-semibold tracking-wider text-muted-foreground">
                      AND
                    </span>
                  </li>
                )}
                <ConditionCard
                  condition={condition}
                  position={index + 1}
                  onChange={(patch) => updateCondition(condition.id, patch)}
                  onRemove={() => removeCondition(condition.id)}
                  autoFocus={condition.id === addedId}
                />
              </Fragment>
            ))}
          </ol>
        )}

        <div className="flex flex-wrap items-center justify-between gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addCondition}
          >
            <Plus aria-hidden />
            Add condition
          </Button>
          {conditions.length > 1 && (
            <p className="text-xs text-muted-foreground">
              {conditions.length} conditions · all must hold
            </p>
          )}
        </div>
      </div>
    </FormDialog>
  );
}
