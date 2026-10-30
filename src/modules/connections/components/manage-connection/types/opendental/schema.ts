import { z } from 'zod';

/**
 * Both keys are only required once the user says they have them — "Not yet"
 * and drafts can be saved without them.
 */
export const opendentalSetupSchema = z
  .object({
    name: z.string().trim().min(1, 'Connection name is required'),
    keysStatus: z.enum(['yes', 'not_yet']).nullable(),
    developerKey: z.string().trim(),
    customerKey: z.string().trim(),
  })
  .superRefine((values, ctx) => {
    if (values.keysStatus !== 'yes') {
      return;
    }
    if (!values.developerKey) {
      ctx.addIssue({
        code: 'custom',
        path: ['developerKey'],
        message: 'Developer Key is required',
      });
    }
    if (!values.customerKey) {
      ctx.addIssue({
        code: 'custom',
        path: ['customerKey'],
        message: 'Customer Key is required',
      });
    }
  });

export type OpendentalSetupFormValues = z.infer<typeof opendentalSetupSchema>;
