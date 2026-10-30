import { z } from 'zod';

/**
 * ConnectHealth generates the signing keys, so the only inputs on this
 * screen are the name and whether the Oracle Health system app exists.
 */
export const backendSetupSchema = z.object({
  name: z.string().trim().min(1, 'Connection name is required'),
  appStatus: z.enum(['yes', 'not_yet']).nullable(),
});

export type BackendSetupFormValues = z.infer<typeof backendSetupSchema>;
