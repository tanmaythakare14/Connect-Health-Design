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
import type { WorkflowComboboxProps } from '../../../../@types';

const NO_WORKFLOW_LABEL = 'No workflow';

/** Searchable single-select of workflows; '' means "No workflow". */
export function WorkflowCombobox({
  optionsState,
  value,
  onChange,
  onRetry,
  disabled = false,
  ...triggerProps
}: WorkflowComboboxProps): JSX.Element {
  const [isOpen, setIsOpen] = useState(false);

  if (optionsState.status === 'error') {
    return (
      <p
        role="alert"
        className="flex h-9 items-center gap-1 text-sm text-destructive"
      >
        Workflows didn’t load.
        <Button
          type="button"
          variant="link"
          className="h-auto p-0 text-sm"
          onClick={onRetry}
        >
          Try again
        </Button>
      </p>
    );
  }

  const isLoading = optionsState.status === 'loading';
  const options = optionsState.status === 'success' ? optionsState.data : [];
  const selected = options.find((option) => option.id === value);

  const select = (workflowId: string): void => {
    onChange(workflowId);
    setIsOpen(false);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={isOpen}
          disabled={disabled || isLoading}
          className="w-full justify-between px-3 font-normal"
          {...triggerProps}
        >
          <span
            className={cn('truncate', !selected && 'text-muted-foreground')}
          >
            {isLoading
              ? 'Loading workflows…'
              : (selected?.name ?? NO_WORKFLOW_LABEL)}
          </span>
          <ChevronsUpDown className="opacity-50" aria-hidden />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-(--radix-popover-trigger-width) p-0"
      >
        <Command>
          <CommandInput placeholder="Search workflows..." />
          <CommandList className="max-h-64">
            <CommandEmpty>No workflows found.</CommandEmpty>
            <CommandGroup>
              <CommandItem
                value={NO_WORKFLOW_LABEL}
                onSelect={() => select('')}
              >
                <span className="flex-1 text-muted-foreground">
                  {NO_WORKFLOW_LABEL}
                </span>
                <Check
                  aria-hidden
                  className={cn(
                    'text-primary',
                    value === '' ? 'opacity-100' : 'opacity-0',
                  )}
                />
              </CommandItem>
              {options.map((option) => (
                <CommandItem
                  key={option.id}
                  // name + id keeps cmdk values unique when names repeat
                  value={`${option.name} ${option.id}`}
                  onSelect={() => select(option.id)}
                >
                  <span className="flex-1 truncate">{option.name}</span>
                  <Check
                    aria-hidden
                    className={cn(
                      'text-primary',
                      value === option.id ? 'opacity-100' : 'opacity-0',
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
