import type { JSX } from 'react';
import { KeySquare } from 'lucide-react';
import type { LicenseSourcesCardProps } from '../../@types';
import { LicenseSourceItem } from './LicenseSourceItem';

/** Where the plan's connections come from, one row per source. */
export function LicenseSourcesCard({
  sources,
}: LicenseSourcesCardProps): JSX.Element {
  const summary = sources
    .map((source) => `${source.connections} from ${source.name}`)
    .join(' · ');

  return (
    <section
      aria-labelledby="license-sources-heading"
      className="flex flex-col gap-4 rounded-2xl border bg-card p-6 shadow-xs"
    >
      <div className="flex items-start gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-accent text-primary">
          <KeySquare aria-hidden className="size-5" />
        </span>
        <div className="min-w-0 space-y-0.5">
          <h3
            id="license-sources-heading"
            className="text-sm font-semibold text-foreground"
          >
            License sources
          </h3>
          <p className="text-sm text-muted-foreground">{summary}</p>
        </div>
      </div>

      <ul className="flex flex-1 flex-col justify-center gap-3">
        {sources.map((source) => (
          <LicenseSourceItem key={source.id} source={source} />
        ))}
      </ul>
    </section>
  );
}
