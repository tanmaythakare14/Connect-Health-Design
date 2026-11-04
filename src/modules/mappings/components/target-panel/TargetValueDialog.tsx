import { useEffect, useState, type FormEvent, type JSX } from 'react';
import { Check } from 'lucide-react';
import { FormDialog } from '@/components/common';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type {
  CustomValueType,
  TargetTreeNode,
  TargetValueDialogProps,
  TargetValueMode,
} from '../../@types';
import { CUSTOM_VALUE_TYPE_OPTIONS, TARGET_VALUE_MODE } from '../../constants';
import { parseCustomValue, valueTypeOf } from '../../utils';
import { ValueModeToggle } from './ValueModeToggle';

const VALUE_PLACEHOLDERS: Record<CustomValueType, string> = {
  text: 'Constant text value',
  number: 'Constant number, e.g. 148',
  boolean: '',
};

const EXPRESSION_PLACEHOLDER =
  "e.g. {{ source | upcase }} or PID.5.2 + ' ' + PID.5.1";

const isCustomValueType = (value: string): value is CustomValueType =>
  CUSTOM_VALUE_TYPE_OPTIONS.some((option) => option.value === value);

interface DraftState {
  mode: TargetValueMode;
  valueType: CustomValueType;
  raw: string;
  expression: string;
}

/** The dialog starts from whatever the field already has. */
function draftFrom(node: TargetTreeNode | null): DraftState {
  if (node?.expression) {
    return {
      mode: TARGET_VALUE_MODE.EXPRESSION,
      valueType: 'text',
      raw: '',
      expression: node.expression,
    };
  }
  const value = node?.customValue;
  return {
    mode: TARGET_VALUE_MODE.CONSTANT,
    valueType: value === undefined ? 'text' : valueTypeOf(value),
    raw: value === undefined ? '' : String(value),
    expression: '',
  };
}

/**
 * Gives an unmapped target field its value: a constant (text, number or
 * true / false), or a Liquid expression worked out for each message.
 */
export function TargetValueDialog({
  open,
  onOpenChange,
  node,
  onApply,
}: TargetValueDialogProps): JSX.Element {
  const [draft, setDraft] = useState<DraftState>(() => draftFrom(node));
  const update = (patch: Partial<DraftState>): void =>
    setDraft((current) => ({ ...current, ...patch }));

  // Each open starts from the field's current value.
  useEffect(() => {
    if (open) setDraft(draftFrom(node));
  }, [open, node]);

  const isConstant = draft.mode === TARGET_VALUE_MODE.CONSTANT;
  const parsed = parseCustomValue(draft.valueType, draft.raw);
  // Only complain once something is typed (true / false always has a pick).
  const constantError =
    !parsed.ok && (draft.raw !== '' || draft.valueType === 'boolean')
      ? parsed.error
      : null;
  const canSubmit = isConstant
    ? parsed.ok && draft.raw !== ''
    : draft.expression.trim() !== '';

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    if (!node || !canSubmit) return;
    if (isConstant && parsed.ok) {
      onApply(node.path, { kind: 'constant', value: parsed.value });
    } else {
      onApply(node.path, {
        kind: 'expression',
        expression: draft.expression.trim(),
      });
    }
    onOpenChange(false);
  };

  const handleTypeChange = (next: string): void => {
    if (!isCustomValueType(next)) return;
    // A true / false pick starts on "true"; other types keep what was typed.
    update({
      valueType: next,
      raw:
        next === 'boolean'
          ? 'true'
          : draft.valueType === 'boolean'
            ? ''
            : draft.raw,
    });
  };

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={`Output value — ${node?.label ?? ''}`}
      description="Give this field a fixed value, or work it out from each incoming message."
      onSubmit={handleSubmit}
      submitLabel="Apply"
      submitIcon={Check}
      isSubmitting={false}
      canSubmit={canSubmit}
      className="sm:max-w-lg"
    >
      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label
            htmlFor="target-value-path"
            className="text-xs text-muted-foreground"
          >
            Output field
          </Label>
          <Input
            id="target-value-path"
            value={node?.path ?? ''}
            readOnly
            tabIndex={-1}
            className="bg-muted/40 font-mono text-xs text-muted-foreground"
          />
        </div>

        <ValueModeToggle
          value={draft.mode}
          onChange={(mode) => update({ mode })}
        />

        {/* key replays the entrance when the mode changes */}
        <div
          key={draft.mode}
          className="animate-in fade-in-0 slide-in-from-top-1 duration-150"
        >
          {isConstant ? (
            <div className="space-y-1.5">
              <div className="flex gap-2">
                <Select
                  value={draft.valueType}
                  onValueChange={handleTypeChange}
                >
                  <SelectTrigger
                    aria-label="Value type"
                    className="w-36 shrink-0"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CUSTOM_VALUE_TYPE_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {draft.valueType === 'boolean' ? (
                  <Select
                    value={draft.raw}
                    onValueChange={(raw) => update({ raw })}
                  >
                    <SelectTrigger
                      aria-label="Value"
                      className="min-w-0 flex-1 font-mono"
                    >
                      <SelectValue placeholder="Choose true or false" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true" className="font-mono">
                        true
                      </SelectItem>
                      <SelectItem value="false" className="font-mono">
                        false
                      </SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    autoFocus
                    value={draft.raw}
                    onChange={(event) => update({ raw: event.target.value })}
                    placeholder={VALUE_PLACEHOLDERS[draft.valueType]}
                    aria-label="Value"
                    aria-invalid={constantError ? true : undefined}
                    inputMode={
                      draft.valueType === 'number' ? 'decimal' : undefined
                    }
                    autoComplete="off"
                    className="min-w-0 flex-1"
                  />
                )}
              </div>
              {constantError ? (
                <p role="alert" className="text-xs text-destructive">
                  {constantError}
                </p>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Written to the output as-is, for every message.
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-1.5">
              <Input
                autoFocus
                value={draft.expression}
                onChange={(event) => update({ expression: event.target.value })}
                placeholder={EXPRESSION_PLACEHOLDER}
                aria-label="Expression"
                autoComplete="off"
                spellCheck={false}
                className="font-mono text-xs"
              />
              <p className="text-xs text-muted-foreground">
                Evaluated as Liquid against the incoming message payload.
              </p>
            </div>
          )}
        </div>
      </div>
    </FormDialog>
  );
}
