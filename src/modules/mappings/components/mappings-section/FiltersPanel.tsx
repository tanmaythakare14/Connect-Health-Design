import type { JSX } from 'react';
import { Filter } from 'lucide-react';
import { EmptyState } from '@/components/common';

/** MOCK: the Filters screen is still to be designed. */
export function FiltersPanel(): JSX.Element {
  return (
    <div className="rounded-xl border bg-card">
      <EmptyState
        icon={Filter}
        title="No filters yet"
        description="Filters will let you decide which messages reach a mapping."
      />
    </div>
  );
}
