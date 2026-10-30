import { z } from 'zod';
import { isHttpsUrl } from '../../../../utils';

const REQUIRED_FIELDS = [
  ['appName', 'App name'],
  ['serviceUsername', 'Service username'],
  ['servicePassword', 'Service password'],
  ['ehrUsername', 'EHR username'],
  ['ehrPassword', 'EHR password'],
] as const;

/**
 * Credentials are only required once the user says they have them — "Not
 * yet" and drafts can be saved without them. Ubiquity ID is always optional.
 */
export const unitySetupSchema = z
  .object({
    name: z.string().trim().min(1, 'Connection name is required'),
    credentialsStatus: z.enum(['yes', 'not_yet']).nullable(),
    endpointUrl: z.string().trim(),
    appName: z.string().trim(),
    serviceUsername: z.string().trim(),
    servicePassword: z.string(),
    ehrUsername: z.string().trim(),
    ehrPassword: z.string(),
    ubiquityId: z.string().trim(),
  })
  .superRefine((values, ctx) => {
    if (values.credentialsStatus !== 'yes') {
      return;
    }
    if (!isHttpsUrl(values.endpointUrl)) {
      ctx.addIssue({
        code: 'custom',
        path: ['endpointUrl'],
        message: 'Enter a valid Unity endpoint URL starting with https://',
      });
    }
    REQUIRED_FIELDS.forEach(([field, label]) => {
      if (!values[field].trim()) {
        ctx.addIssue({
          code: 'custom',
          path: [field],
          message: `${label} is required`,
        });
      }
    });
  });

export type UnitySetupFormValues = z.infer<typeof unitySetupSchema>;
