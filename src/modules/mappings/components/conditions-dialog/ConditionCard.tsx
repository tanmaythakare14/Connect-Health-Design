import { useId, useState, type JSX } from 'react';
import { Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import type {
  CompareOperator,
  ConditionCardProps,
  GroupConditionKind,
} from '../../@types';
import {
  COMPARE_OPERATOR_OPTIONS,
  GROUP_CONDITION_KIND,
  GROUP_CONDITION_KIND_OPTIONS,
} from '../../constants';
import { groupConditionProblem } from '../../utils';

const isConditionKind = (value: string): value is GroupConditionKind =>
  GROUP_CONDITION_KIND_OPTIONS.some((option) => option.value === value);

const isCompareOperator = (value: string): value is CompareOperator =>
  COMPARE_OPERATOR_OPTIONS.some((option) => option.value === value);

/**
 * One condition: what kind it is, then the inputs that kind needs. A
 * badly formatted ref is flagged once its box is left; a missing input just
 * keeps Save disabled.
 */
export function ConditionCard({
  condition,
  position,
  onChange,
  onRemove,
  autoFocus,
}: ConditionCardProps): JSX.Element {
  const ids = useId();
  const [hasLeftRef, setHasLeftRef] = useState(false);
  const kindOption = GROUP_CONDITION_KIND_OPTIONS.find(
    (option) => option.value === condition.kind,
  );
  const problem = groupConditionProblem(condition);
  // Only a real mistake is red, and only after the ref box has been left.
  const visibleError =
    problem && !problem.isMissing && hasLeftRef ? problem.message : null;

  const refInput = (
    <Input
      id={`${ids}-ref`}
      autoFocus={autoFocus}
      value={condition.ref}
      onChange={(event) => onChange({ ref: event.target.value.toUpperCase() })}
      onBlur={() => setHasLeftRef(true)}
      placeholder="Field ref, e.g. PID.8"
      aria-label={`Condition ${position}: field ref`}
      aria-invalid={visibleError ? true : undefined}
      aria-describedby={visibleError ? `${ids}-error` : undefined}
      autoComplete="off"
      spellCheck={false}
      className="min-w-0 font-mono text-xs"
    />
  );

  return (
    <li
      data-condition-id={condition.id}
      className="rounded-lg border bg-muted/20 p-3 animate-in fade-in-0 slide-in-from-top-1 duration-200"
    >
      <div className="flex items-center gap-2">
        <span
          aria-hidden
          className="flex size-6 shrink-0 items-center justify-center rounded-md bg-accent font-mono text-[11px] font-semibold text-primary"
        >
          {position}
        </span>
        <Select
          value={condition.kind}
          onValueChange={(value) => {
            if (isConditionKind(value)) onChange({ kind: value });
          }}
        >
          <SelectTrigger
            size="sm"
            aria-label={`Condition ${position}: type`}
            className="w-56 bg-background"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {GROUP_CONDITION_KIND_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remove condition ${position}`}
          title="Remove condition"
          className="ml-auto flex size-7 items-center justify-center rounded-md text-muted-foreground outline-none transition-colors hover:bg-destructive/10 hover:text-destructive focus-visible:ring-[3px] focus-visible:ring-ring/50"
        >
          <Trash2 aria-hidden className="size-4" />
        </button>
      </div>

      <p className="mt-2 mb-2.5 pl-8 text-xs text-muted-foreground">
        {kindOption?.hint}
      </p>

      {/* key replays the entrance when the kind changes */}
      <div
        key={condition.kind}
        className="pl-8 animate-in fade-in-0 duration-150"
      >
        {condition.kind === GROUP_CONDITION_KIND.PRESENT && refInput}

        {condition.kind === GROUP_CONDITION_KIND.COMPARE && (
          <div className="grid grid-cols-[minmax(0,1fr)_9.5rem_minmax(0,1fr)] gap-2">
            {refInput}
            <Select
              value={condition.operator}
              onValueChange={(value) => {
                if (isCompareOperator(value)) onChange({ operator: value });
              }}
            >
              <SelectTrigger
                aria-label={`Condition ${position}: comparison`}
                className="w-full bg-background text-xs"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {COMPARE_OPERATOR_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              value={condition.value}
              onChange={(event) => onChange({ value: event.target.value })}
              placeholder="Value, e.g. F"
              aria-label={`Condition ${position}: value`}
              autoComplete="off"
              className="min-w-0 text-xs"
            />
          </div>
        )}

        {condition.kind === GROUP_CONDITION_KIND.LIQUID && (
          <Textarea
            autoFocus={autoFocus}
            value={condition.liquid}
            onChange={(event) => onChange({ liquid: event.target.value })}
            placeholder="e.g. PID.8 == 'F' and PV1.2 != 'O'"
            aria-label={`Condition ${position}: Liquid condition`}
            spellCheck={false}
            rows={2}
            className="min-h-16 resize-y font-mono text-xs"
          />
        )}

        {visibleError && (
          <p
            id={`${ids}-error`}
            role="alert"
            className="mt-1.5 text-xs text-destructive"
          >
            {visibleError}
          </p>
        )}
      </div>
    </li>
  );
}
