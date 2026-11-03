import { useMemo, useState, type JSX } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { LoaderCircle, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
  LlmConfig,
  LlmConfigFormValues,
  LlmProviderFormProps,
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

const RequiredMark = (): JSX.Element => (
  <span aria-hidden className="text-destructive">
    *
  </span>
);

/**
 * The LLM provider card's edit mode; saves the whole configuration as one
 * unit. Mounted only while editing, so each edit starts from the saved config.
 */
export function LlmProviderForm({
  config,
  onCancel,
  onSave,
}: LlmProviderFormProps): JSX.Element {
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
  const { isSubmitting, isDirty } = form.formState;
  const provider = useWatch({ control: form.control, name: 'provider' });
  const [submitError, setSubmitError] = useState<string | null>(null);

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
      <form
        noValidate
        aria-label="Edit LLM provider configuration"
        onSubmit={(event) => void form.handleSubmit(handleSubmit)(event)}
        className="space-y-5 animate-in fade-in-0 duration-200"
      >
        <div className="grid items-start gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="provider"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Provider
                  <RequiredMark />
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
                  <RequiredMark />
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

        {submitError && (
          <p role="alert" className="text-sm text-destructive">
            {submitError}
          </p>
        )}

        <div className="flex flex-wrap items-center justify-end gap-2 border-t pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          {/* Any change enables Save; missing fields are flagged on submit. */}
          <Button type="submit" disabled={!isDirty || isSubmitting}>
            {isSubmitting ? (
              <LoaderCircle aria-hidden className="animate-spin" />
            ) : (
              <Save aria-hidden />
            )}
            {isSubmitting ? 'Saving…' : 'Save changes'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
