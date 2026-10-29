import type { JSX } from 'react';
import { TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import type { LineTabsTriggerProps } from './types';

/** shadcn TabsTrigger restyled as a line tab with a sliding underline. */
export function LineTabsTrigger({
  className,
  ...props
}: LineTabsTriggerProps): JSX.Element {
  return (
    <TabsTrigger
      className={cn(
        'relative h-10 flex-none rounded-none border-0 bg-transparent px-0.5 text-muted-foreground shadow-none transition-colors hover:text-foreground',
        'data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none dark:data-[state=active]:border-transparent dark:data-[state=active]:bg-transparent',
        // Underline grows in from the centre when the tab becomes active
        "after:absolute after:inset-x-0 after:-bottom-px after:h-0.5 after:scale-x-0 after:rounded-full after:bg-primary after:transition-transform after:duration-200 after:content-[''] data-[state=active]:after:scale-x-100",
        className,
      )}
      {...props}
    />
  );
}
