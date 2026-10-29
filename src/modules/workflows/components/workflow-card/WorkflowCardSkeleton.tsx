import type { JSX } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export function WorkflowCardSkeleton(): JSX.Element {
  return (
    <div className="rounded-xl border bg-card p-5">
      <div className="flex items-start justify-between gap-3">
        <Skeleton className="h-5 w-40 bg-muted" />
        <Skeleton className="h-5 w-16 rounded-full bg-muted" />
      </div>
      <Skeleton className="mt-3 h-4 w-full bg-muted" />
      <Skeleton className="mt-1.5 h-4 w-2/3 bg-muted" />
      <Skeleton className="mt-4 h-5 w-28 bg-muted" />
      <div className="mt-5 flex items-center gap-4 border-t pt-3">
        <Skeleton className="h-4 w-16 bg-muted" />
        <Skeleton className="h-4 w-14 bg-muted" />
      </div>
    </div>
  );
}
