import type { JSX } from 'react';
import { ShieldCheck } from 'lucide-react';

/** "HIPAA Ready" and "SMART on FHIR": what every connection here offers. */
export function ComplianceBadges(): JSX.Element {
  return (
    <ul aria-label="Compliance" className="flex shrink-0 items-center gap-2">
      <li
        title="Connections handle patient data under HIPAA safeguards"
        className="inline-flex h-7 items-center gap-1.5 rounded-md border border-emerald-200 bg-emerald-50 px-2.5 text-xs font-medium text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-400"
      >
        <ShieldCheck aria-hidden className="size-3.5" />
        HIPAA Ready
      </li>
      <li
        title="Connections launch and authorize with SMART on FHIR"
        className="inline-flex h-7 items-center rounded-md border border-blue-300 bg-blue-50 px-2.5 text-xs font-medium text-blue-700 dark:border-blue-800/70 dark:bg-blue-950/40 dark:text-blue-300"
      >
        SMART on FHIR
      </li>
    </ul>
  );
}
