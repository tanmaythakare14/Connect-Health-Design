import type { JSX } from 'react';
import { useFormContext } from 'react-hook-form';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import type {
  LlmConfigFormValues,
  ProviderCredentialFieldsProps,
} from '../../@types';
import { getLlmProviderOption } from '../../utils';

/** The chosen provider's credential inputs; stored secrets may stay blank. */
export function ProviderCredentialFields({
  provider,
  storedSecretKeys,
  disabled,
}: ProviderCredentialFieldsProps): JSX.Element {
  const { control } = useFormContext<LlmConfigFormValues>();
  const option = getLlmProviderOption(provider);

  return (
    <fieldset className="space-y-4 border-t pt-5">
      <legend className="float-left mb-4 text-sm font-semibold text-foreground">
        {option.label} credentials
      </legend>
      <div className="clear-left grid gap-4 sm:grid-cols-2">
        {option.fields.map((credentialField) => {
          const isStoredSecret =
            credentialField.kind === 'secret' &&
            storedSecretKeys.includes(credentialField.key);

          return (
            <FormField
              key={`${provider}-${credentialField.key}`}
              control={control}
              name={`credentials.${credentialField.key}`}
              render={({ field }) => (
                <FormItem
                  className={
                    option.fields.length % 2 === 1 &&
                    credentialField === option.fields[0]
                      ? 'sm:col-span-2'
                      : undefined
                  }
                >
                  <FormLabel>
                    {credentialField.label}
                    {!isStoredSecret && (
                      <span aria-hidden className="text-destructive">
                        *
                      </span>
                    )}
                  </FormLabel>
                  <FormControl>
                    <Input
                      type={
                        credentialField.kind === 'secret' ? 'password' : 'text'
                      }
                      autoComplete={
                        credentialField.kind === 'secret'
                          ? 'new-password'
                          : 'off'
                      }
                      placeholder={
                        isStoredSecret
                          ? 'Stored — type to replace, or leave blank to keep'
                          : credentialField.placeholder
                      }
                      aria-required={!isStoredSecret}
                      {...field}
                      disabled={disabled}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          );
        })}
      </div>
    </fieldset>
  );
}
