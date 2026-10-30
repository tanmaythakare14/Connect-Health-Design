import type { JSX } from 'react';
import { KeyRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { ApiKeySelectProps } from '../../@types';

export function ApiKeySelect({
  id,
  listState,
  value,
  onValueChange,
  onRetry,
  disabled = false,
}: ApiKeySelectProps): JSX.Element {
  if (listState.status === 'error') {
    return (
      <p
        role="alert"
        className="flex h-9 items-center gap-1 text-sm text-destructive"
      >
        API keys didn’t load.
        <Button variant="link" className="h-auto p-0 text-sm" onClick={onRetry}>
          Try again
        </Button>
      </p>
    );
  }

  const isLoading = listState.status === 'loading';

  return (
    <Select
      value={value}
      onValueChange={onValueChange}
      disabled={disabled || isLoading}
    >
      <SelectTrigger id={id} className="w-full bg-background">
        <KeyRound aria-hidden />
        <SelectValue
          placeholder={isLoading ? 'Loading API keys…' : 'Select an API key'}
        />
      </SelectTrigger>
      <SelectContent>
        {listState.status === 'success' &&
          listState.data.map((apiKey) => (
            <SelectItem key={apiKey.id} value={apiKey.id}>
              {apiKey.name}
            </SelectItem>
          ))}
      </SelectContent>
    </Select>
  );
}
