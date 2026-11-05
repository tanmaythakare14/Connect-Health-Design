import type { JSX } from 'react';
import { TabsContent } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import type { MappingsSectionContentProps } from '../../@types';
import { MAPPINGS_TAB } from '../../constants';
import { FiltersPanel } from './FiltersPanel';

/**
 * What sits under the Mappings | Filters strip: the view's own body, or the
 * Filters panel. The body stays mounted while Filters is open, so coming back
 * finds the template just as it was, unsaved edits included.
 */
export function MappingsSectionContent({
  children,
  className,
  filtersClassName,
}: MappingsSectionContentProps): JSX.Element {
  return (
    <>
      <TabsContent
        value={MAPPINGS_TAB.MAPPINGS}
        forceMount
        className={cn('mt-0 data-[state=inactive]:hidden', className)}
      >
        {children}
      </TabsContent>
      <TabsContent
        value={MAPPINGS_TAB.FILTERS}
        className={cn('mt-0', filtersClassName)}
      >
        <FiltersPanel />
      </TabsContent>
    </>
  );
}
