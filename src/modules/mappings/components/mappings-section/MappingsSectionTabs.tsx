import type { JSX } from 'react';
import { Filter, Table2 } from 'lucide-react';
import { LineTabsList, LineTabsTrigger } from '@/components/common';
import { cn } from '@/lib/utils';
import type { MappingsSectionTabsProps } from '../../@types';
import { MAPPINGS_TAB } from '../../constants';

/** Line tabs with an icon; the active one takes the brand colour. */
const TAB_CLASS_NAME =
  'h-11 gap-1.5 px-3 text-sm data-[state=active]:text-primary dark:data-[state=active]:text-primary';

/**
 * The Mappings | Filters strip. Each view renders it under its breadcrumbs,
 * inside the screen's `Tabs` root, with `MappingsSectionContent` below it.
 */
export function MappingsSectionTabs({
  actions,
  className,
}: MappingsSectionTabsProps): JSX.Element {
  return (
    <div
      className={cn(
        'flex shrink-0 items-center justify-between gap-4 border-b bg-card px-4',
        className,
      )}
    >
      <LineTabsList
        aria-label="Mappings section"
        className="w-auto gap-1 border-b-0"
      >
        <LineTabsTrigger
          value={MAPPINGS_TAB.MAPPINGS}
          className={TAB_CLASS_NAME}
        >
          <Table2 aria-hidden className="size-4" />
          Mappings
        </LineTabsTrigger>
        <LineTabsTrigger
          value={MAPPINGS_TAB.FILTERS}
          className={TAB_CLASS_NAME}
        >
          <Filter aria-hidden className="size-4" />
          Filters
        </LineTabsTrigger>
      </LineTabsList>
      {actions && <div className="shrink-0">{actions}</div>}
    </div>
  );
}
