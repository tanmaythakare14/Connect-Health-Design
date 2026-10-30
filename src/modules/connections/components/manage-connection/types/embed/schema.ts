import { z } from 'zod';
import { isHttpsUrl } from '../../../../utils';

/**
 * The Client ID and embedded app URL are only required once the user says
 * they have an Epic app — "Not yet" and drafts can be saved without them.
 * Scopes and workflow are always optional.
 */
export const embedSetupSchema = z
  .object({
    name: z.string().trim().min(1, 'Connection name is required'),
    appStatus: z.enum(['yes', 'not_yet']).nullable(),
    clientId: z.string().trim(),
    clientSecret: z.string(),
    scopes: z.string().trim(),
    workflowId: z.string(),
    embeddedAppUrl: z.string().trim(),
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
    if (!isHttpsUrl(values.embeddedAppUrl)) {
      ctx.addIssue({
        code: 'custom',
        path: ['embeddedAppUrl'],
        message: 'Enter a valid URL starting with https://',
      });
    }
  });

export type EmbedSetupFormValues = z.infer<typeof embedSetupSchema>;
