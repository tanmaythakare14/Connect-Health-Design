import { z } from 'zod';
import { USER_PASSWORD_RULES } from '../../constants';

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Enter your current password'),
    // Details live in the checklist under the field, so one short message.
    newPassword: z
      .string()
      .min(1, 'Enter a new password')
      .refine(
        (value) => USER_PASSWORD_RULES.every((rule) => rule.test(value)),
        'Meet every requirement below',
      ),
    confirmPassword: z.string().min(1, 'Confirm your new password'),
  })
  .superRefine((values, context) => {
    if (
      values.currentPassword !== '' &&
      values.newPassword === values.currentPassword
    ) {
      context.addIssue({
        code: 'custom',
        path: ['newPassword'],
        message: 'Choose a password different from your current one',
      });
    }
    if (
      values.confirmPassword !== '' &&
      values.confirmPassword !== values.newPassword
    ) {
      context.addIssue({
        code: 'custom',
        path: ['confirmPassword'],
        message: 'Passwords don’t match',
      });
    }
  });

export type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;
