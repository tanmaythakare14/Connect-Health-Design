import { useState, type JSX } from 'react';
import { Check, ChevronsUpDown, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
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
import type { ConnectionMultiSelectProps } from '../../@types';

export function ConnectionMultiSelect({
  options,
  value,
  onChange,
  isLoading,
  hasError,
  onRetry,
  disabled = false,
  ...triggerProps
}: ConnectionMultiSelectProps): JSX.Element {
  const [isOpen, setIsOpen] = useState(false);
  const selected = options.filter((option) => value.includes(option.id));

  const toggle = (connectionId: string): void => {
    onChange(
      value.includes(connectionId)
        ? value.filter((id) => id !== connectionId)
        : [...value, connectionId],
    );
  };

  const triggerLabel = isLoading
    ? 'Loading connections…'
    : selected.length === 0
      ? 'Select connections'
      : `${selected.length} connection${selected.length === 1 ? '' : 's'} selected`;

  return (
    <div className="space-y-2">
      {/* modal keeps wheel-scrolling working inside the parent dialog */}
      <Popover modal open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={isOpen}
            disabled={disabled || isLoading || hasError}
            className="w-full justify-between px-3 font-normal"
            {...triggerProps}
          >
            <span
              className={cn(
                'truncate',
                selected.length === 0 && 'text-muted-foreground',
              )}
            >
              {triggerLabel}
            </span>
            <ChevronsUpDown className="opacity-50" aria-hidden />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          className="w-(--radix-popover-trigger-width) p-0"
        >
          <Command>
            <CommandInput placeholder="Search connections..." />
            <CommandList className="max-h-60">
              <CommandEmpty>No connections found.</CommandEmpty>
              <CommandGroup>
                {options.map((option) => {
                  const isSelected = value.includes(option.id);
                  return (
                    <CommandItem
                      key={option.id}
                      // name + id keeps cmdk values unique when names repeat
                      value={`${option.name} ${option.id}`}
                      onSelect={() => toggle(option.id)}
                    >
                      <span className="flex-1 truncate">{option.name}</span>
                      <Check
                        aria-hidden
                        className={cn(
                          'text-primary transition-opacity',
                          isSelected ? 'opacity-100' : 'opacity-0',
                        )}
                      />
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {hasError && (
        <p role="alert" className="text-sm text-destructive">
          Connections didn’t load.{' '}
          <Button
            type="button"
            variant="link"
            className="h-auto p-0 text-sm"
            onClick={onRetry}
          >
            Try again
          </Button>
        </p>
      )}

      {selected.length > 0 && (
        <ul
          aria-label="Selected connections"
          className="flex flex-wrap gap-1.5"
        >
          {selected.map((connection) => (
            <li key={connection.id}>
              <Badge
                variant="outline"
                className="gap-1 rounded-md border-transparent bg-accent py-0.5 pr-1 font-normal text-accent-foreground"
              >
                {connection.name}
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-4 rounded-sm text-accent-foreground hover:bg-primary/15 hover:text-accent-foreground"
                  onClick={() => toggle(connection.id)}
                  aria-label={`Remove ${connection.name}`}
                  disabled={disabled}
                >
                  <X className="size-3" aria-hidden />
                </Button>
              </Badge>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
