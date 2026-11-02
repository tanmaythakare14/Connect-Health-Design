import type { JSX } from 'react';
import { Circle, CircleCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { PasswordRequirementsProps } from '../../@types';
import { USER_PASSWORD_RULES } from '../../constants';

/** Live checklist of the password rules; each turns green once met. */
export function PasswordRequirements({
  id,
  password,
}: PasswordRequirementsProps): JSX.Element {
  return (
    <ul
      id={id}
      aria-label="Password requirements"
      className="grid gap-x-6 gap-y-2 rounded-lg border bg-muted/30 px-4 py-3 sm:grid-cols-2"
    >
      {USER_PASSWORD_RULES.map((rule) => {
        const isMet = rule.test(password);
        const Icon = isMet ? CircleCheck : Circle;
        return (
          <li
            key={rule.id}
            className={cn(
              'flex items-center gap-2 text-xs transition-colors',
              isMet
                ? 'text-emerald-700 dark:text-emerald-400'
                : 'text-muted-foreground',
            )}
          >
            <Icon aria-hidden className="size-3.5 shrink-0" />
            {rule.label}
            <span className="sr-only">{isMet ? '(met)' : '(not met)'}</span>
          </li>
        );
      })}
    </ul>
  );
}
