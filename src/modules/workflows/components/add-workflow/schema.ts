import { z } from 'zod';
import {
  WORKFLOW_DESCRIPTION_MAX_LENGTH,
  WORKFLOW_NAME_MAX_LENGTH,
} from '../../constants';

export const addWorkflowSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Workflow name is required')
    .max(
      WORKFLOW_NAME_MAX_LENGTH,
      `Keep the name under ${WORKFLOW_NAME_MAX_LENGTH} characters`,
    ),
  description: z
    .string()
    .trim()
    .max(
      WORKFLOW_DESCRIPTION_MAX_LENGTH,
      `Keep the description under ${WORKFLOW_DESCRIPTION_MAX_LENGTH} characters`,
    ),
  connectionIds: z.array(z.string()),
});

export type AddWorkflowFormValues = z.infer<typeof addWorkflowSchema>;
