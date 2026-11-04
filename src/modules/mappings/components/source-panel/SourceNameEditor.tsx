import {
  useState,
  type FocusEvent,
  type FormEvent,
  type JSX,
  type KeyboardEvent,
} from 'react';
import { Check, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import type { SourceNameEditorProps } from '../../@types';

const ICON_BUTTON_CLASS_NAME =
  'flex size-6 shrink-0 items-center justify-center rounded-md outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-40';

/** Inline: rename a field. Enter saves, Esc cancels. */
export function SourceNameEditor({
  fieldRef,
  initialName,
  onSave,
  onCancel,
}: SourceNameEditorProps): JSX.Element {
  const [draft, setDraft] = useState(initialName);
  const trimmed = draft.trim();

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    if (!trimmed) return;
    // Nothing changed: just close.
    if (trimmed === initialName) onCancel();
    else onSave(trimmed);
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
      aria-label={`Rename ${fieldRef}`}
      className="flex min-w-0 flex-1 items-center gap-0.5 animate-in fade-in-0 duration-150"
    >
      <Input
        autoFocus
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        // Start with the whole name selected, ready to type over.
        onFocus={(event: FocusEvent<HTMLInputElement>) => event.target.select()}
        placeholder="Field name"
        aria-label={`Name of ${fieldRef}`}
        aria-invalid={trimmed ? undefined : true}
        autoComplete="off"
        className="mr-1 h-6 min-w-0 flex-1 px-2 text-[13px] md:text-[13px]"
      />
      <button
        type="submit"
        disabled={!trimmed}
        aria-label="Save name"
        title="Save (Enter)"
        className={`${ICON_BUTTON_CLASS_NAME} text-emerald-600 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-950/50`}
      >
        <Check aria-hidden className="size-3.5" />
      </button>
      <button
        type="button"
        onClick={onCancel}
        aria-label="Cancel"
        title="Cancel (Esc)"
        className={`${ICON_BUTTON_CLASS_NAME} text-muted-foreground hover:bg-background hover:text-foreground`}
      >
        <X aria-hidden className="size-3.5" />
      </button>
    </form>
  );
}
