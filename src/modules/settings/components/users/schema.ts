import { z } from 'zod';
import {
  USER_NAME_MAX_LENGTH,
  USER_PASSWORD_RULES,
  USERNAME_MAX_LENGTH,
} from '../../constants';

/** Details live in the checklist under the field, so one short message. */
const temporaryPasswordSchema = z
  .string()
  .min(1, 'Enter a password')
  .refine(
    (value) => USER_PASSWORD_RULES.every((rule) => rule.test(value)),
    'Meet every requirement below',
  );

export const addUserSchema = z.object({
  name: z
    .string()
    .trim()
    .max(
      USER_NAME_MAX_LENGTH,
      `Keep it under ${USER_NAME_MAX_LENGTH} characters`,
    ),
  username: z
    .string()
    .trim()
    .min(1, 'Enter a username')
    .max(USERNAME_MAX_LENGTH, `Keep it under ${USERNAME_MAX_LENGTH} characters`)
    .regex(
      /^[a-z0-9._-]+$/,
      'Use lowercase letters, numbers, dots, dashes or underscores',
    ),
  email: z
    .string()
    .trim()
    .refine(
      (value) => value === '' || z.email().safeParse(value).success,
      'Enter a valid email address',
    ),
  password: temporaryPasswordSchema,
  mustResetPassword: z.boolean(),
});

export type AddUserFormValues = z.infer<typeof addUserSchema>;

export const resetUserPasswordSchema = z.object({
  userId: z.string().min(1, 'Choose a user'),
  password: temporaryPasswordSchema,
  mustResetPassword: z.boolean(),
});

export type ResetUserPasswordFormValues = z.infer<
  typeof resetUserPasswordSchema
>;
