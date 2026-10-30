import { z } from 'zod';
import { isHttpsUrl } from '../../../../utils';

const URL_FIELDS = [
  ['fhirBaseUrl', 'FHIR base URL'],
  ['authorizationUrl', 'authorization URL'],
  ['tokenUrl', 'token URL'],
] as const;

/**
 * Credentials and endpoints are only required once the user says they have
 * an Epic app — "Not yet" and drafts can be saved without them.
 */
export const standaloneSetupSchema = z
  .object({
    name: z.string().trim().min(1, 'Connection name is required'),
    appStatus: z.enum(['yes', 'not_yet']).nullable(),
    clientId: z.string().trim(),
    clientSecret: z.string(),
    fhirBaseUrl: z.string().trim(),
    authorizationUrl: z.string().trim(),
    tokenUrl: z.string().trim(),
    scopes: z.string().trim(),
  })
  .superRefine((values, ctx) => {
    if (values.appStatus !== 'yes') {
      return;
    }
    if (!values.clientId) {
      ctx.addIssue({
        code: 'custom',
        path: ['clientId'],
        message: 'Client ID is required',
      });
    }
    URL_FIELDS.forEach(([field, label]) => {
      if (!isHttpsUrl(values[field])) {
        ctx.addIssue({
          code: 'custom',
          path: [field],
          message: `Enter a valid ${label} starting with https://`,
        });
      }
    });
    if (!values.scopes) {
      ctx.addIssue({
        code: 'custom',
        path: ['scopes'],
        message: 'Add at least one scope',
      });
    }
  });

export type StandaloneSetupFormValues = z.infer<typeof standaloneSetupSchema>;
