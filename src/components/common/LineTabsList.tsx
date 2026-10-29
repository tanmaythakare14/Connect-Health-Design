import type { JSX } from 'react';
import { TabsList } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import type { LineTabsListProps } from './types';

/** shadcn TabsList restyled as an underline ("line") tab bar. */
export function LineTabsList({
  className,
  ...props
}: LineTabsListProps): JSX.Element {
  return (
    <TabsList
      className={cn(
        'h-auto w-full justify-start gap-6 rounded-none border-b bg-transparent p-0',
        className,
      )}
      {...props}
    />
  );
}
