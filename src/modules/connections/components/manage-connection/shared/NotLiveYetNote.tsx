import type { JSX } from 'react';
import { Info } from 'lucide-react';
import type { NotLiveYetNoteProps } from '../../../@types';

/** Shown on draft connections: progress is saved, but it isn't live yet. */
export function NotLiveYetNote({
  publishLabel,
}: NotLiveYetNoteProps): JSX.Element {
  return (
    <div
      role="note"
      className="flex items-start gap-3 rounded-lg border border-primary/20 bg-accent/60 px-4 py-3"
    >
      <Info className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
      <div className="space-y-0.5">
        <p className="text-sm font-semibold text-foreground">
          This connection isn’t live yet
        </p>
        <p className="text-sm text-muted-foreground">
          Your progress is saved. Review the details above, then click{' '}
          <span className="font-medium text-foreground">{publishLabel}</span> to
          make it live.
        </p>
      </div>
    </div>
  );
}
