import { useState, type FormEvent, type JSX, type KeyboardEvent } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import type { TargetAddGroupFormProps } from '../../@types';
import { validateTargetKey } from '../../utils';

/** Inline: name a new group, whether it's a list, and optionally its first field. */
export function TargetAddGroupForm({
  takenNames,
  onSubmit,
  onCancel,
}: TargetAddGroupFormProps): JSX.Element {
  const [name, setName] = useState('');
  const [isList, setIsList] = useState(false);
  const [firstField, setFirstField] = useState('');

  const trimmedName = name.trim();
  const trimmedField = firstField.trim();
  const nameError = trimmedName
    ? validateTargetKey(trimmedName, takenNames)
    : null;
  // The group is new, so nothing inside it is taken yet.
  const fieldError = trimmedField ? validateTargetKey(trimmedField, []) : null;
  const error = nameError ?? fieldError;
  const canSubmit = trimmedName !== '' && !error;

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    if (canSubmit) {
      onSubmit({ name: trimmedName, isList, firstField: trimmedField });
    }
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
      aria-label="Add a group"
      className="space-y-2 rounded-lg border border-primary/30 bg-background p-2.5 shadow-xs animate-in fade-in-0 slide-in-from-top-1 duration-150"
    >
      <Input
        autoFocus
        value={name}
        onChange={(event) => setName(event.target.value)}
        placeholder="New group name, e.g. address"
        aria-label="Group name"
        aria-invalid={nameError ? true : undefined}
        autoComplete="off"
        spellCheck={false}
        className="h-8 font-mono text-xs"
      />

      <label className="flex w-fit cursor-pointer items-center gap-2 text-xs text-muted-foreground">
        <Checkbox
          checked={isList}
          onCheckedChange={(checked) => setIsList(checked === true)}
        />
        Repeats (array)
      </label>

      <div className="flex items-center gap-2">
        <Input
          value={firstField}
          onChange={(event) => setFirstField(event.target.value)}
          placeholder="First field in it (optional — add later)"
          aria-label="First field in the group (optional)"
          aria-invalid={fieldError ? true : undefined}
          autoComplete="off"
          spellCheck={false}
          className="h-8 min-w-0 flex-1 font-mono text-xs"
        />
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

      {error && (
        <p role="alert" className="text-[11px] text-destructive">
          {error}
        </p>
      )}
    </form>
  );
}
