import type { JSX } from 'react';
import { Input } from '@/components/ui/input';
import type { TableFieldBoxProps } from '../../@types';

/**
 * A field's name with its ref / path under it — or, while the row is still
 * being filled in (no name yet), an input to type the ref / path into.
 */
export function TableFieldBox({
  label,
  code,
  placeholder,
  ariaLabel,
  onType,
}: TableFieldBoxProps): JSX.Element {
  // Keyed on the name, not the code: typing fills the code, and the box
  // mustn't swap out from under the cursor mid-word.
  if (!label) {
    return (
      <Input
        value={code}
        onChange={(event) => onType(event.target.value)}
        placeholder={placeholder}
        aria-label={ariaLabel}
        autoComplete="off"
        spellCheck={false}
        className="h-12 min-w-0 font-mono text-xs placeholder:italic"
      />
    );
  }
  return (
    <div className="flex min-h-12 min-w-0 flex-col justify-center rounded-md border bg-background px-3 py-1.5">
      <span
        title={label}
        className="truncate text-sm font-medium text-foreground"
      >
        {label}
      </span>
      <span
        title={code}
        className="truncate font-mono text-[11px] text-muted-foreground"
      >
        {code}
      </span>
    </div>
  );
}
