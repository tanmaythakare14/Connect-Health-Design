import type { JSX } from 'react';
import { ShieldAlert } from 'lucide-react';
import { API_KEY_SECURITY_TIPS } from '../../constants';
import { SettingsCallout } from '../shared';

/** Amber callout with key-handling best practices. */
export function ApiKeySecurityTips(): JSX.Element {
  return (
    <SettingsCallout title="Security best practices" icon={ShieldAlert}>
      <ul className="grid gap-x-8 gap-y-1.5 sm:grid-cols-2">
        {API_KEY_SECURITY_TIPS.map((tip) => (
          <li key={tip} className="flex gap-2">
            <span
              aria-hidden
              className="mt-2 size-1 shrink-0 rounded-full bg-amber-500"
            />
            {tip}
          </li>
        ))}
      </ul>
    </SettingsCallout>
  );
}
