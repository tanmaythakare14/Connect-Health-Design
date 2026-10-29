import type { JSX } from 'react';
import { Network, ShieldCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { PRODUCT_NAME, SUPPORTED_STANDARDS } from '../../constants';
import { ConnectionIllustration } from './ConnectionIllustration';

export function OnboardingLeftPanel(): JSX.Element {
  return (
    <aside className="relative hidden overflow-hidden bg-primary text-primary-foreground lg:flex lg:w-2/5 lg:flex-col lg:justify-between lg:p-10 xl:p-12">
      <svg
        className="absolute inset-0 size-full text-primary-foreground/10"
        aria-hidden
      >
        <defs>
          <pattern
            id="onboarding-dot-grid"
            width="24"
            height="24"
            patternUnits="userSpaceOnUse"
          >
            <circle cx="2" cy="2" r="1" fill="currentColor" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#onboarding-dot-grid)" />
      </svg>

      <div className="relative flex items-center gap-2">
        <div className="flex size-9 items-center justify-center rounded-lg bg-primary-foreground text-primary">
          <Network className="size-5" aria-hidden />
        </div>
        <span className="text-lg font-semibold tracking-tight">
          {PRODUCT_NAME}
        </span>
      </div>

      <div className="relative py-10">
        <ConnectionIllustration />
      </div>

      <div className="relative space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight">
          Connect every health system, securely.
        </h2>
        <p className="max-w-md text-sm text-primary-foreground/75">
          Orchestrate EHR integrations, workflows and mappings from a single
          console hosted in your own cloud.
        </p>
        <div className="flex flex-wrap gap-2 pt-2">
          {SUPPORTED_STANDARDS.map((standard) => (
            <Badge
              key={standard.label}
              variant="outline"
              className="rounded-full border-primary-foreground/25 bg-primary-foreground/10 px-3 py-1 text-primary-foreground"
            >
              {standard.isCompliance && <ShieldCheck aria-hidden />}
              {standard.label}
            </Badge>
          ))}
        </div>
      </div>
    </aside>
  );
}
