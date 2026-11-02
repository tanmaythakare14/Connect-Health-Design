import { z } from 'zod';
import type { LlmCredentialKey, LlmProvider } from '../../@types';
import { LLM_PROVIDER } from '../../constants';
import { getLlmProviderOption } from '../../utils';

/** Every credential input across providers; only the chosen provider's are used. */
const credentialsSchema = z.object({
  region: z.string(),
  accessKeyId: z.string(),
  secretAccessKey: z.string(),
  projectId: z.string(),
  serviceAccountKey: z.string(),
});

export const llmConfigBaseSchema = z.object({
  provider: z.enum([LLM_PROVIDER.BEDROCK, LLM_PROVIDER.VERTEX_AI]),
  modelName: z.string().trim().min(1, 'Enter the model name'),
  credentials: credentialsSchema,
});

export type LlmConfigFormValues = z.infer<typeof llmConfigBaseSchema>;

/**
 * Adds the provider-specific rules: every field of the chosen provider is
 * required, except a secret that's already stored for that same provider
 * (leaving it blank keeps it).
 */
export function buildLlmConfigSchema(saved: {
  provider: LlmProvider;
  storedSecretKeys: LlmCredentialKey[];
}): typeof llmConfigBaseSchema {
  return llmConfigBaseSchema.superRefine((values, ctx) => {
    const option = getLlmProviderOption(values.provider);
    for (const field of option.fields) {
      const value = values.credentials[field.key].trim();
      const isStoredSecret =
        field.kind === 'secret' &&
        values.provider === saved.provider &&
        saved.storedSecretKeys.includes(field.key);

      if (!value && !isStoredSecret) {
        ctx.addIssue({
          code: 'custom',
          path: ['credentials', field.key],
          message: `Enter the ${field.label.toLowerCase()}`,
        });
      }
    }
  });
}
