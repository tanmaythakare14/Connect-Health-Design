import { useState, type FormEvent, type JSX, type KeyboardEvent } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { SourceValueType, TargetAddFieldFormProps } from '../../@types';
import { TARGET_VALUE_TYPE_OPTIONS } from '../../constants';
import { validateTargetKey } from '../../utils';

const isValueType = (value: string): value is SourceValueType =>
  TARGET_VALUE_TYPE_OPTIONS.some((option) => option.value === value);

/** Inline: name a new field, pick its type, and whether it's a list. */
export function TargetAddFieldForm({
  takenNames,
  onSubmit,
  onCancel,
}: TargetAddFieldFormProps): JSX.Element {
  const [name, setName] = useState('');
  const [valueType, setValueType] = useState<SourceValueType>('text');
  const [isList, setIsList] = useState(false);

  const trimmed = name.trim();
  const error = trimmed ? validateTargetKey(trimmed, takenNames) : null;
  const canSubmit = trimmed !== '' && !error;
  const typeLabel =
    TARGET_VALUE_TYPE_OPTIONS.find((option) => option.value === valueType)
      ?.label ?? valueType;

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    if (canSubmit) onSubmit({ name: trimmed, valueType, isList });
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLFormElement>): void => {
    if (event.key === 'Escape') {
      event.stopPropagation();
      onCancel();
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      onKeyDown={handleKeyDown}
      aria-label="Add a field"
      className="space-y-2 rounded-lg border border-primary/30 bg-background p-2.5 shadow-xs animate-in fade-in-0 slide-in-from-top-1 duration-150"
    >
      <div className="flex items-center gap-2">
        <Input
          autoFocus
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Field name, e.g. middleName"
          aria-label="Field name"
          aria-invalid={error ? true : undefined}
          autoComplete="off"
          spellCheck={false}
          className="h-8 min-w-0 flex-1 font-mono text-xs"
        />
        <Select
          value={valueType}
          onValueChange={(value) => {
            if (isValueType(value)) setValueType(value);
          }}
        >
          <SelectTrigger
            size="sm"
            aria-label="Value type"
            className="h-8 w-28 shrink-0 font-mono text-xs"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {TARGET_VALUE_TYPE_OPTIONS.map((option) => (
              <SelectItem
                key={option.value}
                value={option.value}
                className="font-mono text-xs"
              >
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button type="submit" size="sm" disabled={!canSubmit} className="h-8">
          Add
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onCancel}
          aria-label="Cancel"
          className="size-8 text-muted-foreground"
        >
          <X aria-hidden />
        </Button>
      </div>

      <label className="flex w-fit cursor-pointer items-center gap-2 text-xs text-muted-foreground">
        <Checkbox
          checked={isList}
          onCheckedChange={(checked) => setIsList(checked === true)}
        />
        Repeats (array of {typeLabel} values)
      </label>

      {error && (
        <p role="alert" className="text-[11px] text-destructive">
          {error}
        </p>
      )}
    </form>
  );
}
