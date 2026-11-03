import { useState, type JSX } from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import type { CatalogComboboxProps } from '../../@types';

/** Searchable pick-one list; each row shows the name and its code. */
export function CatalogCombobox({
  id,
  options,
  value,
  onChange,
  placeholder,
  searchPlaceholder,
  invalid = false,
  disabled = false,
}: CatalogComboboxProps): JSX.Element {
  const [isOpen, setIsOpen] = useState(false);
  const selected = options.find((option) => option.value === value);

  return (
    // modal: lets the list scroll with the wheel while inside a dialog
    <Popover modal open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={isOpen}
          aria-invalid={invalid || undefined}
          disabled={disabled}
          className="w-full justify-between px-3 font-normal aria-invalid:border-destructive"
        >
          {selected ? (
            <span className="flex min-w-0 items-center gap-2">
              <span className="truncate">{selected.label}</span>
              <span className="shrink-0 font-mono text-xs text-muted-foreground">
                {selected.value}
              </span>
            </span>
          ) : (
            <span className="truncate text-muted-foreground">
              {placeholder}
            </span>
          )}
          <ChevronsUpDown className="opacity-50" aria-hidden />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-(--radix-popover-trigger-width) p-0"
      >
        <Command>
          <CommandInput placeholder={searchPlaceholder} />
          <CommandList className="max-h-64">
            <CommandEmpty>Nothing matches. Try Custom instead.</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  // Name + code, so either can be searched
                  value={`${option.label} ${option.value}`}
                  onSelect={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                >
                  <span className="flex-1 truncate">{option.label}</span>
                  <span className="font-mono text-xs text-muted-foreground">
                    {option.value}
                  </span>
                  <Check
                    aria-hidden
                    className={cn(
                      'text-primary',
                      value === option.value ? 'opacity-100' : 'opacity-0',
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
