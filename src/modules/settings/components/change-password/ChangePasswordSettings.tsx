import { useEffect, useId, useState, type JSX } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CircleCheck, LoaderCircle, LockKeyhole } from 'lucide-react';
import { toast } from 'sonner';
import { PasswordInput } from '@/components/common';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { logger } from '@/utils/logger';
import type { ChangePasswordFormValues } from '../../@types';
import { SETTINGS_SECTION } from '../../constants';
import {
  changePassword,
  formValuesToChangePasswordPayload,
  IncorrectCurrentPasswordError,
} from '../../service';
import { getSettingsSection } from '../../utils';
import {
  PasswordRequirements,
  SettingsCard,
  SettingsPageHeader,
} from '../shared';
import { changePasswordSchema } from './schema';

const DEFAULT_VALUES: ChangePasswordFormValues = {
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
};

const RequiredMark = (): JSX.Element => (
  <span aria-hidden className="text-destructive">
    *
  </span>
);

/** Settings → Change password: the signed-in user sets a new password. */
export function ChangePasswordSettings(): JSX.Element {
  const form = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    mode: 'onChange',
    defaultValues: DEFAULT_VALUES,
  });
  const { isSubmitting, isValid, isDirty } = form.formState;
  const newPassword = useWatch({ control: form.control, name: 'newPassword' });
  const confirmPassword = useWatch({
    control: form.control,
    name: 'confirmPassword',
  });
  const requirementsId = useId();
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Re-check the confirmation when the new password changes under it.
  useEffect(() => {
    if (form.getFieldState('confirmPassword').isDirty) {
      void form.trigger('confirmPassword');
    }
  }, [form, newPassword]);

  const passwordsMatch =
    confirmPassword !== '' && confirmPassword === newPassword;

  const handleSubmit = async (
    values: ChangePasswordFormValues,
  ): Promise<void> => {
    setSubmitError(null);
    try {
      await changePassword(formValuesToChangePasswordPayload(values));
      form.reset(DEFAULT_VALUES);
      toast.success('Password changed', {
        description: 'Use your new password the next time you sign in.',
      });
    } catch (error) {
      if (error instanceof IncorrectCurrentPasswordError) {
        form.setError(
          'currentPassword',
          { message: 'That’s not your current password' },
          { shouldFocus: true },
        );
        return;
      }
      logger.error('Changing password failed', { error });
      setSubmitError('We couldn’t change your password. Please try again.');
    }
  };

  const handleCancel = (): void => {
    form.reset(DEFAULT_VALUES);
    setSubmitError(null);
  };

  return (
    <div className="space-y-6">
      <SettingsPageHeader
        section={getSettingsSection(SETTINGS_SECTION.CHANGE_PASSWORD)}
      />

      <SettingsCard
        id="settings-change-password"
        title="Your password"
        description="Enter your current password, then choose a new one."
        icon={LockKeyhole}
      >
        <Form {...form}>
          <form
            noValidate
            onSubmit={(event) => void form.handleSubmit(handleSubmit)(event)}
            className="max-w-xl space-y-6 py-1"
          >
            <FormField
              control={form.control}
              name="currentPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Current password
                    <RequiredMark />
                  </FormLabel>
                  <FormControl>
                    <PasswordInput
                      placeholder="Enter your current password"
                      autoComplete="new-password"
                      data-1p-ignore
                      data-lpignore="true"
                      aria-required
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
              name="newPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    New password
                    <RequiredMark />
                  </FormLabel>
                  <FormControl>
                    <PasswordInput
                      placeholder="Min 8 chars, upper, lower, number, symbol"
                      autoComplete="new-password"
                      data-1p-ignore
                      data-lpignore="true"
                      aria-required
                      aria-describedby={requirementsId}
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                  <PasswordRequirements
                    id={requirementsId}
                    password={newPassword}
                  />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>
                    Confirm new password
                    <RequiredMark />
                  </FormLabel>
                  <FormControl>
                    <PasswordInput
                      placeholder="Re-enter your new password"
                      autoComplete="new-password"
                      data-1p-ignore
                      data-lpignore="true"
                      aria-required
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                  {passwordsMatch && !fieldState.error && (
                    <p className="flex items-center gap-1.5 text-xs text-emerald-700 dark:text-emerald-400">
                      <CircleCheck aria-hidden className="size-3.5" />
                      Passwords match
                    </p>
                  )}
                </FormItem>
              )}
            />

            {submitError && (
              <p role="alert" className="text-sm text-destructive">
                {submitError}
              </p>
            )}

            <div className="flex flex-wrap items-center justify-end gap-2 border-t pt-5">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={!isDirty || isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={!isValid || isSubmitting}>
                {isSubmitting ? (
                  <LoaderCircle aria-hidden className="animate-spin" />
                ) : (
                  <LockKeyhole aria-hidden />
                )}
                {isSubmitting ? 'Updating…' : 'Update password'}
              </Button>
            </div>
          </form>
        </Form>
      </SettingsCard>
    </div>
  );
}
