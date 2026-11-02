import { useState, type JSX } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { KeyRound } from 'lucide-react';
import { FormDialog } from '@/components/common';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { logger } from '@/utils/logger';
import type { CreateApiKeyDialogProps } from '../../@types';
import { API_KEY_NAME_MAX_LENGTH } from '../../constants';
import { createApiKeySchema, type CreateApiKeyFormValues } from './schema';

const DEFAULT_VALUES: CreateApiKeyFormValues = { name: '' };

/** Name a new key; Generate Key stays disabled until the name is filled in. */
export function CreateApiKeyDialog({
  open,
  onOpenChange,
  onCreate,
}: CreateApiKeyDialogProps): JSX.Element {
  const form = useForm<CreateApiKeyFormValues>({
    resolver: zodResolver(createApiKeySchema),
    defaultValues: DEFAULT_VALUES,
  });
  const { isSubmitting } = form.formState;
  const name = useWatch({ control: form.control, name: 'name' });
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleOpenChange = (nextOpen: boolean): void => {
    if (isSubmitting) return; // don't drop an in-flight create
    if (!nextOpen) {
      form.reset(DEFAULT_VALUES);
      setSubmitError(null);
    }
    onOpenChange(nextOpen);
  };

  const handleSubmit = async (
    values: CreateApiKeyFormValues,
  ): Promise<void> => {
    setSubmitError(null);
    try {
      await onCreate(values);
      form.reset(DEFAULT_VALUES);
    } catch (error) {
      logger.error('Creating API key failed', { error });
      setSubmitError('We couldn’t generate the key. Please try again.');
    }
  };

  return (
    <Form {...form}>
      <FormDialog
        open={open}
        onOpenChange={handleOpenChange}
        title="Create new API key"
        description="Generate a new API key for your ConnectHealth integration. Choose a descriptive name to identify this key."
        onSubmit={(event) => void form.handleSubmit(handleSubmit)(event)}
        submitLabel="Generate Key"
        pendingLabel="Generating…"
        submitIcon={KeyRound}
        isSubmitting={isSubmitting}
        canSubmit={name.trim().length > 0}
        error={submitError}
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Key name
                <span aria-hidden className="text-destructive">
                  *
                </span>
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g., Production API Key"
                  autoComplete="off"
                  autoFocus
                  aria-required
                  maxLength={API_KEY_NAME_MAX_LENGTH}
                  {...field}
                  disabled={isSubmitting}
                />
              </FormControl>
              <FormDescription className="text-xs">
                Use a descriptive name to identify this key’s purpose
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </FormDialog>
    </Form>
  );
}
