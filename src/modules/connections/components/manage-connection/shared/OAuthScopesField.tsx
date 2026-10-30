import { useState, type JSX } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import type { OAuthScopesFieldProps } from '../../../@types';
import {
  EPIC_AVAILABLE_SCOPE_COUNT,
  EPIC_SCOPE_CATALOG,
} from '../../../constants';
import { parseScopes } from '../../../utils';

const PICKER_ID = 'oauth-scopes-picker';

/**
 * Free-text scope list plus a "View all" picker: clicking a scope adds or
 * removes it from the text, so both stay in sync.
 */
export function OAuthScopesField({
  value,
  onChange,
  ...inputProps
}: OAuthScopesFieldProps): JSX.Element {
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const selected = parseScopes(value);

  const toggleScope = (scope: string): void => {
    const next = selected.includes(scope)
      ? selected.filter((item) => item !== scope)
      : [...selected, scope];
    onChange(next.join(' '));
  };

  return (
    <div className="space-y-2">
      <Input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="openid fhirUser patient/Patient.read"
        className="font-mono text-xs md:text-xs"
        {...inputProps}
      />

      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => setIsPickerOpen((open) => !open)}
        aria-expanded={isPickerOpen}
        aria-controls={PICKER_ID}
        className="-ml-2 text-primary hover:bg-accent hover:text-primary"
      >
        <ChevronDown
          aria-hidden
          className={cn(
            'transition-transform duration-200',
            isPickerOpen && 'rotate-180',
          )}
        />
        {isPickerOpen ? 'Hide' : 'View all'} {EPIC_AVAILABLE_SCOPE_COUNT}{' '}
        available scopes
      </Button>

      {isPickerOpen && (
        <div
          id={PICKER_ID}
          className="space-y-3 rounded-lg border bg-muted/30 p-4 animate-in fade-in-0 slide-in-from-top-1 duration-200"
        >
          <p className="text-xs text-muted-foreground">
            Click a scope to add or remove it. Scopes must match the “Incoming
            APIs” on the Epic app.
          </p>

          <div className="grid gap-3 md:grid-cols-2">
            {EPIC_SCOPE_CATALOG.map((catalog) => (
              <section
                key={catalog.title}
                aria-label={catalog.title}
                className="rounded-lg border bg-card"
              >
                <h4 className="border-b px-4 py-2.5 text-sm font-semibold text-foreground">
                  {catalog.title}
                </h4>
                <div className="space-y-3 p-4">
                  {catalog.groups.map((group) => (
                    <div key={group.label} className="space-y-1.5">
                      <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                        {group.label}
                      </p>
                      <ul className="flex flex-wrap gap-1.5">
                        {group.scopes.map((scope) => {
                          const isSelected = selected.includes(scope);
                          return (
                            <li key={scope}>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => toggleScope(scope)}
                                aria-pressed={isSelected}
                                className={cn(
                                  'h-7 gap-1 rounded-md px-2.5 font-mono text-xs font-normal',
                                  isSelected &&
                                    'border-primary/40 bg-accent text-accent-foreground hover:bg-accent hover:text-accent-foreground',
                                )}
                              >
                                {isSelected && (
                                  <Check className="size-3" aria-hidden />
                                )}
                                {scope}
                              </Button>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
