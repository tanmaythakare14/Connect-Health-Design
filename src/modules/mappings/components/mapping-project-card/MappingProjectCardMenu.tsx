import type { JSX } from 'react';
import { Copy, Download, EllipsisVertical, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { MappingProjectCardMenuProps } from '../../@types';

export function MappingProjectCardMenu({
  projectName,
  onEditDetails,
  onDuplicate,
  onExport,
  onDelete,
}: MappingProjectCardMenuProps): JSX.Element {
  return (
    // Non-modal: Delete opens a dialog straight from this menu, and a modal menu
    // can leave the page's pointer-events locked when the two overlap.
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        {/* z-10 lifts the trigger above the card's stretched click target */}
        <Button
          variant="ghost"
          size="icon"
          aria-label={`Actions for ${projectName}`}
          className="relative z-10 -mr-2 size-8 text-muted-foreground hover:bg-accent hover:text-foreground data-[state=open]:bg-accent data-[state=open]:text-foreground"
        >
          <EllipsisVertical aria-hidden />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuItem onSelect={onEditDetails}>
          <Pencil aria-hidden />
          Edit details
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={onDuplicate}>
          <Copy aria-hidden />
          Duplicate
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={onExport}>
          <Download aria-hidden />
          Export
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onSelect={onDelete}>
          <Trash2 aria-hidden />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
