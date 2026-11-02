import { useId, useState, type JSX } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { KeyRound } from 'lucide-react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { logger } from '@/utils/logger';
import type { ResetUserPasswordDialogProps } from '../../@types';
import { PasswordRequirements } from './PasswordRequirements';
import {
  resetUserPasswordSchema,
  type ResetUserPasswordFormValues,
} from './schema';

const DEFAULT_VALUES: ResetUserPasswordFormValues = {
  userId: '',
  password: '',
  mustResetPassword: true,
};

/** Pick a user and give them a new temporary password. */
export function ResetUserPasswordDialog({
  open,
  onOpenChange,
  users,
  onReset,
}: ResetUserPasswordDialogProps): JSX.Element {
  const form = useForm<ResetUserPasswordFormValues>({
    resolver: zodResolver(resetUserPasswordSchema),
    mode: 'onChange',
    defaultValues: DEFAULT_VALUES,
  });
  const { isSubmitting, isValid } = form.formState;
  const password = useWatch({ control: form.control, name: 'password' });
  const requirementsId = useId();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleOpenChange = (nextOpen: boolean): void => {
    if (isSubmitting) return; // don't drop an in-flight reset
    if (!nextOpen) {
      form.reset(DEFAULT_VALUES);
      setSubmitError(null);
    }
    onOpenChange(nextOpen);
  };

  const handleSubmit = async (
    values: ResetUserPasswordFormValues,
  ): Promise<void> => {
    setSubmitError(null);
    try {
      await onReset(values);
      form.reset(DEFAULT_VALUES);
    } catch (error) {
      logger.error('Resetting user password failed', { error });
      setSubmitError('We couldn’t reset the password. Please try again.');
    }
  };

  return (
    <Form {...form}>
      <FormDialog
        open={open}
        onOpenChange={handleOpenChange}
        title="Reset password"
        description="Set a new temporary password for a user. Their current password stops working right away."
        onSubmit={(event) => void form.handleSubmit(handleSubmit)(event)}
        submitLabel="Reset password"
        pendingLabel="Resetting…"
        submitIcon={KeyRound}
        isSubmitting={isSubmitting}
        canSubmit={isValid}
        error={submitError}
        className="sm:max-w-[680px]"
      >
        <div className="space-y-6 pt-1">
          <FormField
            control={form.control}
            name="userId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  User
                  <span aria-hidden className="text-destructive">
                    *
                  </span>
                </FormLabel>
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={isSubmitting}
                >
                  <FormControl>
                    <SelectTrigger className="w-full" aria-required>
                      <SelectValue placeholder="Choose a user" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.name ?? user.username}
                        <span className="font-mono text-xs text-muted-foreground">
                          {user.username}
                        </span>
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
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  New temporary password
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
              <FormItem className="flex items-start gap-3 rounded-lg border px-4 py-3">
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
                    Require password reset on next login
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
