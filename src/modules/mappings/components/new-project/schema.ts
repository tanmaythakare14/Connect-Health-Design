import { z } from 'zod';
import {
  MAPPING_PROJECT_DESCRIPTION_MAX_LENGTH,
  MAPPING_PROJECT_NAME_MAX_LENGTH,
} from '../../constants';

export const newMappingProjectSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Project name is required')
    .max(
      MAPPING_PROJECT_NAME_MAX_LENGTH,
      `Keep the name under ${MAPPING_PROJECT_NAME_MAX_LENGTH} characters`,
    ),
  description: z
    .string()
    .trim()
    .max(
      MAPPING_PROJECT_DESCRIPTION_MAX_LENGTH,
      `Keep the description under ${MAPPING_PROJECT_DESCRIPTION_MAX_LENGTH} characters`,
    ),
});

export type NewMappingProjectFormValues = z.infer<
  typeof newMappingProjectSchema
>;
