import type { JSX } from 'react';
import { Copy, FolderPlus, Hash, Plus, type LucideIcon } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import type { TargetAddKind, TargetAddMenuProps } from '../../@types';
import { TARGET_ADD_KIND } from '../../constants';

const ADD_OPTIONS: Array<{
  kind: TargetAddKind;
  icon: LucideIcon;
  label: string;
  description: string;
}> = [
  {
    kind: TARGET_ADD_KIND.FIELD,
    icon: Hash,
    label: 'Add field',
    description: 'A single value, e.g. middleName',
  },
  {
    kind: TARGET_ADD_KIND.GROUP,
    icon: FolderPlus,
    label: 'Add group',
    description: 'A nested object or array, e.g. address',
  },
  {
    kind: TARGET_ADD_KIND.ITEM,
    icon: Copy,
    label: 'Add another item',
    description: 'A copy of this one, as the next item in the list',
  },
];

/**
 * The + on an object or group row: add a field or a nested group inside it,
 * or — for a list — another item like this one. With no `node`, it adds at
 * the top level (the panel's "Add target field" button).
 */
export function TargetAddMenu({
  node,
  className,
  trigger,
  align = 'end',
  onSelect,
}: TargetAddMenuProps): JSX.Element {
  // Only a list (a repeating group, a group marked as repeating, or one of
  // its items) has items to copy.
  const options = ADD_OPTIONS.filter(
    (option) =>
      option.kind !== TARGET_ADD_KIND.ITEM ||
      (node !== null &&
        (node.repeatSource !== undefined ||
          node.isList === true ||
          node.itemIndex !== undefined)),
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {trigger ?? (
          <button
            type="button"
            aria-label={node ? `Add to ${node.label}` : 'Add to the target'}
            title="Add"
            // Stays shown while its menu is open, even off-hover.
            className={cn(className, 'data-[state=open]:opacity-100')}
          >
            <Plus aria-hidden className="size-3.5" />
          </button>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align} sideOffset={6} className="w-64 p-1.5">
        {options.map(({ kind, icon: Icon, label, description }) => (
          <DropdownMenuItem
            key={kind}
            onSelect={() => onSelect(kind)}
            className="items-start gap-3 rounded-md px-2.5 py-2"
          >
            <Icon aria-hidden className="mt-0.5 size-4 text-primary" />
            <span className="min-w-0 space-y-0.5">
              <span className="block text-sm font-medium text-foreground">
                {label}
              </span>
              <span className="block text-xs text-muted-foreground">
                {description}
              </span>
            </span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
