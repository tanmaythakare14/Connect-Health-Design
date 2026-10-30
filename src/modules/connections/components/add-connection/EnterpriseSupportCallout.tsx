import type { JSX } from 'react';
import { Headset } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { EnterpriseSupportCalloutProps } from '../../@types';

export function EnterpriseSupportCallout({
  onContact,
}: EnterpriseSupportCalloutProps): JSX.Element {
  return (
    <aside className="flex flex-wrap items-center gap-4 rounded-xl border border-dashed bg-card px-5 py-4">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-accent text-primary">
        <Headset className="size-5" aria-hidden />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-foreground">
          Enterprise Support
        </p>
        <p className="text-sm text-muted-foreground">
          Missing Health System in the list? Our enterprise team can help you
          build custom integrations.
        </p>
      </div>
      <Button variant="outline" size="sm" onClick={onContact}>
        Contact us
      </Button>
    </aside>
  );
}
