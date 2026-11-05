import { z } from 'zod';
import {
  CATALOG_MODE,
  MAPPING_TEMPLATE_DESCRIPTION_MAX_LENGTH,
  MAPPING_TEMPLATE_MESSAGE_TYPE_MAX_LENGTH,
  MAPPING_TEMPLATE_NAME_MAX_LENGTH,
  MAPPING_TEMPLATE_VERSION_MAX_LENGTH,
  TEMPLATE_INPUT_TYPE,
  TEMPLATE_OUTPUT_TYPE,
} from '../../constants';

const catalogMode = z.enum([CATALOG_MODE.CATALOG, CATALOG_MODE.CUSTOM]);

export const mappingTemplateSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, 'Template name is required')
      .max(
        MAPPING_TEMPLATE_NAME_MAX_LENGTH,
        `Keep the name under ${MAPPING_TEMPLATE_NAME_MAX_LENGTH} characters`,
      ),
    description: z
      .string()
      .trim()
      .max(
        MAPPING_TEMPLATE_DESCRIPTION_MAX_LENGTH,
        `Keep the description under ${MAPPING_TEMPLATE_DESCRIPTION_MAX_LENGTH} characters`,
      ),
    inputType: z.enum([
      TEMPLATE_INPUT_TYPE.HL7,
      TEMPLATE_INPUT_TYPE.X12,
      TEMPLATE_INPUT_TYPE.CCDA,
      TEMPLATE_INPUT_TYPE.CUSTOM_JSON,
    ]),
    outputType: z.enum([
      TEMPLATE_OUTPUT_TYPE.FHIR_JSON,
      TEMPLATE_OUTPUT_TYPE.HL7V2,
      TEMPLATE_OUTPUT_TYPE.X12_EDI,
      TEMPLATE_OUTPUT_TYPE.CCDA,
    ]),
    messageTypeMode: catalogMode,
    messageType: z
      .string()
      .trim()
      .max(
        MAPPING_TEMPLATE_MESSAGE_TYPE_MAX_LENGTH,
        `Keep it under ${MAPPING_TEMPLATE_MESSAGE_TYPE_MAX_LENGTH} characters`,
      )
      .regex(/^[\w^.-]*$/, 'Use letters, numbers, _ ^ . or -'),
    versionMode: catalogMode,
    /** '' means any version */
    messageVersion: z
      .string()
      .trim()
      .max(
        MAPPING_TEMPLATE_VERSION_MAX_LENGTH,
        `Keep it under ${MAPPING_TEMPLATE_VERSION_MAX_LENGTH} characters`,
      )
      .regex(/^[\w.]*$/, 'Use letters, numbers and dots, e.g. 2.5.1'),
    /** Custom JSON only; '' keeps it unset */
    inputSchema: z.string(),
  })
  .superRefine((values, context) => {
    if (values.inputType === TEMPLATE_INPUT_TYPE.CUSTOM_JSON) {
      if (values.inputSchema.trim() === '') return;
      try {
        const parsed: unknown = JSON.parse(values.inputSchema);
        if (typeof parsed !== 'object' || parsed === null) throw new Error();
      } catch {
        context.addIssue({
          code: 'custom',
          path: ['inputSchema'],
          message: 'This isn’t valid JSON. Paste an object or array.',
        });
      }
      return;
    }

    // Every other input type routes on its message type.
    if (values.messageType.trim() === '') {
      context.addIssue({
        code: 'custom',
        path: ['messageType'],
        message:
          values.messageTypeMode === CATALOG_MODE.CATALOG
            ? 'Choose a message type'
            : 'Enter a message type',
      });
    }
  });

export type MappingTemplateFormValues = z.infer<typeof mappingTemplateSchema>;

/** Editing an existing template from its card: only its name and description. */
export const templateDetailsSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Template name is required')
    .max(
      MAPPING_TEMPLATE_NAME_MAX_LENGTH,
      `Keep the name under ${MAPPING_TEMPLATE_NAME_MAX_LENGTH} characters`,
    ),
  description: z
    .string()
    .trim()
    .max(
      MAPPING_TEMPLATE_DESCRIPTION_MAX_LENGTH,
      `Keep the description under ${MAPPING_TEMPLATE_DESCRIPTION_MAX_LENGTH} characters`,
    ),
});

export type TemplateDetailsFormValues = z.infer<typeof templateDetailsSchema>;
