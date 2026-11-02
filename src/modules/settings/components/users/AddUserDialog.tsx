import { useId, useState, type JSX } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { UserPlus } from 'lucide-react';
import { FormDialog, PasswordInput } from '@/components/common';
import { Checkbox } from '@/components/ui/checkbox';
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
import type { AddUserDialogProps } from '../../@types';
import { USER_NAME_MAX_LENGTH, USERNAME_MAX_LENGTH } from '../../constants';
import { PasswordRequirements } from './PasswordRequirements';
import { addUserSchema, type AddUserFormValues } from './schema';

const DEFAULT_VALUES: AddUserFormValues = {
  name: '',
  username: '',
  email: '',
  password: '',
  mustResetPassword: true,
};

/** Add a console admin with a temporary password. */
export function AddUserDialog({
  open,
  onOpenChange,
  onAdd,
}: AddUserDialogProps): JSX.Element {
  const form = useForm<AddUserFormValues>({
    resolver: zodResolver(addUserSchema),
    mode: 'onChange',
    defaultValues: DEFAULT_VALUES,
  });
  const { isSubmitting, isValid } = form.formState;
  const password = useWatch({ control: form.control, name: 'password' });
  const requirementsId = useId();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleOpenChange = (nextOpen: boolean): void => {
    if (isSubmitting) return; // don't drop an in-flight add
    if (!nextOpen) {
      form.reset(DEFAULT_VALUES);
      setSubmitError(null);
    }
    onOpenChange(nextOpen);
  };

  const handleSubmit = async (values: AddUserFormValues): Promise<void> => {
    setSubmitError(null);
    try {
      await onAdd(values);
      form.reset(DEFAULT_VALUES);
    } catch (error) {
      logger.error('Adding user failed', { error });
      setSubmitError(
        'We couldn’t add the user. The username may already be taken — please try again.',
      );
    }
  };

  return (
    <Form {...form}>
      <FormDialog
        open={open}
        onOpenChange={handleOpenChange}
        title="Add new user"
        description="Create an admin user for the ConnectHealth management console."
        onSubmit={(event) => void form.handleSubmit(handleSubmit)(event)}
        submitLabel="Add user"
        pendingLabel="Adding…"
        submitIcon={UserPlus}
        isSubmitting={isSubmitting}
        canSubmit={isValid}
        error={submitError}
        className="sm:max-w-[680px]"
      >
        <div className="grid items-start gap-x-5 gap-y-6 pt-1 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g., Jane Smith"
                    autoComplete="off"
                    autoFocus
                    maxLength={USER_NAME_MAX_LENGTH}
                    {...field}
                    disabled={isSubmitting}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Username
                  <span aria-hidden className="text-destructive">
                    *
                  </span>
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g., jsmith"
                    autoComplete="off"
                    autoCapitalize="none"
                    spellCheck={false}
                    aria-required
                    maxLength={USERNAME_MAX_LENGTH}
                    {...field}
                    disabled={isSubmitting}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem className="sm:col-span-2">
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    data-pii
                    type="email"
                    placeholder="e.g., jane@example.com"
                    autoComplete="off"
                    {...field}
                    disabled={isSubmitting}
                  />
                </FormControl>
                <FormDescription className="text-xs">
                  Optional — used for password and security notices.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem className="sm:col-span-2">
                <FormLabel>
                  Temporary password
                  <span aria-hidden className="text-destructive">
                    *
                  </span>
                </FormLabel>
                <FormControl>
                  <PasswordInput
                    placeholder="Min 8 chars, upper, lower, number, symbol"
                    autoComplete="new-password"
                    aria-required
                    aria-describedby={requirementsId}
                    {...field}
                    disabled={isSubmitting}
                  />
                </FormControl>
                <PasswordRequirements id={requirementsId} password={password} />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="mustResetPassword"
            render={({ field }) => (
              <FormItem className="flex items-start gap-3 rounded-lg border px-4 py-3 sm:col-span-2">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={(checked) =>
                      field.onChange(checked === true)
                    }
                    disabled={isSubmitting}
                    className="mt-0.5"
                  />
                </FormControl>
                <div className="space-y-1">
                  <FormLabel className="font-medium">
                    Require password reset on first login
                  </FormLabel>
                  <FormDescription className="text-xs">
                    Recommended — the temporary password stops working once they
                    choose their own.
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />
        </div>
      </FormDialog>
    </Form>
  );
}
