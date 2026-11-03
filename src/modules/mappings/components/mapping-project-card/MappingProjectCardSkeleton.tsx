import type { JSX } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export function MappingProjectCardSkeleton(): JSX.Element {
  return (
    <div className="rounded-xl border bg-card p-5">
      <div className="flex items-center gap-3">
        <Skeleton className="size-9 rounded-lg bg-muted" />
        <Skeleton className="h-5 flex-1 bg-muted" />
      </div>
      <Skeleton className="mt-4 h-4 w-full bg-muted" />
      <Skeleton className="mt-1.5 h-4 w-2/3 bg-muted" />
      <Skeleton className="mt-3 h-5 w-12 bg-muted" />
      <div className="mt-4 flex items-center gap-4 border-t pt-3">
        <Skeleton className="h-4 w-20 bg-muted" />
        <Skeleton className="h-4 w-14 bg-muted" />
      </div>
    </div>
  );
}
