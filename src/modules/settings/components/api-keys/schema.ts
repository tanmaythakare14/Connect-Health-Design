import { z } from 'zod';
import { API_KEY_NAME_MAX_LENGTH } from '../../constants';

export const createApiKeySchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Give the key a name')
    .max(
      API_KEY_NAME_MAX_LENGTH,
      `Keep it under ${API_KEY_NAME_MAX_LENGTH} characters`,
    ),
});

export type CreateApiKeyFormValues = z.infer<typeof createApiKeySchema>;
