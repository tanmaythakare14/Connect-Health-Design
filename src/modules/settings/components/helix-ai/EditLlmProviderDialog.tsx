import { useEffect, useMemo, useState, type JSX } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save } from 'lucide-react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { logger } from '@/utils/logger';
import type {
  EditLlmProviderDialogProps,
  LlmConfig,
  LlmConfigFormValues,
} from '../../@types';
import { LLM_PROVIDER_OPTIONS } from '../../constants';
import {
  getLlmProviderOption,
  getStoredSecretKeys,
  isLlmProvider,
} from '../../utils';
import { ProviderCredentialFields } from './ProviderCredentialFields';
import { buildLlmConfigSchema } from './schema';

/** Saved config → form values; secrets always start blank. */
const toFormValues = (config: LlmConfig): LlmConfigFormValues => ({
  provider: config.provider,
  modelName: config.modelName,
  credentials: {
    region: config.values.region ?? '',
    accessKeyId: '',
    secretAccessKey: '',
    projectId: config.values.projectId ?? '',
    serviceAccountKey: '',
  },
});

/**
 * Edit the whole LLM provider configuration; saves as one unit. Mount it
 * keyed by the config's updatedAt so each saved version gets a fresh form.
 */
export function EditLlmProviderDialog({
  open,
  onOpenChange,
  config,
  onSave,
}: EditLlmProviderDialogProps): JSX.Element {
  const storedSecretKeys = useMemo(() => getStoredSecretKeys(config), [config]);
  const resolver = useMemo(
    () =>
      zodResolver(
        buildLlmConfigSchema({ provider: config.provider, storedSecretKeys }),
      ),
    [config.provider, storedSecretKeys],
  );
  const form = useForm<LlmConfigFormValues>({
    resolver,
    mode: 'onChange',
    defaultValues: toFormValues(config),
  });
  const { isSubmitting, isDirty, isValid } = form.formState;
  const provider = useWatch({ control: form.control, name: 'provider' });
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Each open starts from the saved config.
  useEffect(() => {
    if (open) {
      form.reset(toFormValues(config));
      setSubmitError(null);
    }
  }, [open, config, form]);

  const handleOpenChange = (nextOpen: boolean): void => {
    if (isSubmitting) return; // don't drop an in-flight save
    onOpenChange(nextOpen);
  };

  const handleSubmit = async (values: LlmConfigFormValues): Promise<void> => {
    setSubmitError(null);
    try {
      await onSave(values);
    } catch (error) {
      logger.error('Saving LLM provider failed', { error });
      setSubmitError('We couldn’t save the configuration. Please try again.');
    }
  };

  return (
    <Form {...form}>
      <FormDialog
        open={open}
        onOpenChange={handleOpenChange}
        title="Edit LLM provider"
        description="Changes apply to Helix right after you save."
        onSubmit={(event) => void form.handleSubmit(handleSubmit)(event)}
        submitLabel="Save configuration"
        pendingLabel="Saving…"
        submitIcon={Save}
        isSubmitting={isSubmitting}
        canSubmit={isDirty && isValid}
        error={submitError}
        className="sm:max-w-3xl"
      >
        <div className="grid items-start gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="provider"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Provider
                  <span aria-hidden className="text-destructive">
                    *
                  </span>
                </FormLabel>
                <Select
                  value={field.value}
                  onValueChange={(value) => {
                    if (isLlmProvider(value)) field.onChange(value);
                  }}
                  disabled={isSubmitting}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {LLM_PROVIDER_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="modelName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Model name
                  <span aria-hidden className="text-destructive">
                    *
                  </span>
                </FormLabel>
                <FormControl>
                  <Input
                    autoComplete="off"
                    aria-required
                    placeholder={
                      getLlmProviderOption(provider).modelPlaceholder
                    }
                    {...field}
                    disabled={isSubmitting}
                  />
                </FormControl>
                <FormDescription className="text-xs">
                  Enter the full model identifier for your chosen provider.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <ProviderCredentialFields
          provider={provider}
          storedSecretKeys={
            provider === config.provider ? storedSecretKeys : []
          }
          disabled={isSubmitting}
        />
      </FormDialog>
    </Form>
  );
}
