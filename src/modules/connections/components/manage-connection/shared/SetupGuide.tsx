import type { JSX } from 'react';
import { ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { SetupGuideProps } from '../../../@types';

/** "Not yet" walkthrough shown under the Yes / Not yet choice. */
export function SetupGuide({
  title,
  steps,
  primaryLink,
  docsHref,
  note,
}: SetupGuideProps): JSX.Element {
  return (
    <div className="space-y-5 rounded-xl border bg-muted/30 p-5 animate-in fade-in-0 slide-in-from-top-1 duration-300">
      <div className="space-y-1">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        <p className="text-sm text-muted-foreground">
          Keep this page open while you follow these steps — the details they
          ask for are in the sections below.
        </p>
      </div>

      <ol className="space-y-3">
        {steps.map((step, index) => (
          <li key={step} className="flex gap-3">
            <span
              aria-hidden
              className="flex size-6 shrink-0 items-center justify-center rounded-full bg-background text-xs font-semibold text-accent-foreground ring-1 ring-border"
            >
              {index + 1}
            </span>
            <p className="pt-0.5 text-sm text-foreground">{step}</p>
          </li>
        ))}
      </ol>

      {note && <p className="text-xs text-muted-foreground">{note}</p>}

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t pt-4">
        <Button asChild>
          <a href={primaryLink.href} target="_blank" rel="noopener noreferrer">
            <ExternalLink aria-hidden />
            {primaryLink.label}
            <span className="sr-only">(opens in a new tab)</span>
          </a>
        </Button>
        <a
          href={docsHref}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-medium text-primary underline-offset-4 hover:underline"
        >
          Vendor documentation
          <span className="sr-only"> (opens in a new tab)</span>
        </a>
        <p className="w-full text-sm text-muted-foreground">
          Done? Choose{' '}
          <span className="font-medium text-foreground">“Yes, I have it”</span>{' '}
          above and finish the steps below — or save a draft and come back
          later.
        </p>
      </div>
    </div>
  );
}
