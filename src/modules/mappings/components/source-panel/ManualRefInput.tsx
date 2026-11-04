import { useState, type JSX, type KeyboardEvent } from 'react';
import { CornerDownLeft, Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import type { ManualRefInputProps } from '../../@types';

/** Adds a field the sample doesn't contain, by typing its ref. */
export function ManualRefInput({ onAdd }: ManualRefInputProps): JSX.Element {
  const [value, setValue] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>): void => {
    if (event.key !== 'Enter' || value.trim() === '') return;
    event.preventDefault();
    const nextError = onAdd(value.trim());
    setError(nextError);
    if (!nextError) setValue('');
  };

  return (
    <div className="space-y-1.5">
      <div className="relative">
        <Plus
          aria-hidden
          className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          value={value}
          onChange={(event) => {
            setValue(event.target.value.toUpperCase());
            setError(null);
          }}
          onKeyDown={handleKeyDown}
          placeholder="Add a field by ref, e.g. PID.5.1"
          aria-label="Add a field by its ref"
          aria-invalid={error ? true : undefined}
          aria-describedby="manual-ref-hint"
          autoComplete="off"
          spellCheck={false}
          className="h-8 pr-9 pl-8 font-mono text-xs"
        />
        <kbd
          aria-hidden
          className="pointer-events-none absolute top-1/2 right-2 flex -translate-y-1/2 items-center rounded border bg-muted px-1 py-0.5 text-muted-foreground"
        >
          <CornerDownLeft className="size-3" />
        </kbd>
      </div>
      <p
        id="manual-ref-hint"
        role={error ? 'alert' : undefined}
        className={
          error
            ? 'text-[11px] text-destructive'
            : 'text-[11px] text-muted-foreground'
        }
      >
        {error ?? 'Press Enter to add a field that isn’t in the sample.'}
      </p>
    </div>
  );
}
