import type { WorkflowStatus, WorkflowTemplateCategory } from '../@types';

export const WORKFLOW_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
} as const;

export const WORKFLOW_STATUS_LABELS: Record<WorkflowStatus, string> = {
  active: 'Active',
  inactive: 'Inactive',
};

export const ALL_CONNECTIONS_FILTER = 'all';
export const NO_CONNECTIONS_FILTER = 'none';

/** Multiples of 12 fill complete rows in the 2/3/4-column grid. */
export const PAGE_SIZE_OPTIONS = [12, 24, 48];
export const DEFAULT_PAGE_SIZE = 12;

/** Connection chips shown on a card before collapsing the rest into "+N". */
export const CONNECTION_PREVIEW_COUNT = 2;
export const SKELETON_CARD_COUNT = 8;

export const WORKFLOW_NAME_MAX_LENGTH = 100;
export const WORKFLOW_DESCRIPTION_MAX_LENGTH = 500;

export const IMPORT_SOURCE = {
  FILE: 'file',
  LIBRARY: 'library',
} as const;

export const WORKFLOW_TEMPLATE_CATEGORY = {
  HL7: 'hl7',
  FHIR: 'fhir',
  INSURANCE: 'insurance',
  AGENTIC: 'agentic',
} as const;

export const WORKFLOW_TEMPLATE_CATEGORY_LABELS: Record<
  WorkflowTemplateCategory,
  string
> = {
  hl7: 'HL7',
  fhir: 'FHIR',
  insurance: 'Insurance',
  agentic: 'Agentic',
};

export const IMPORT_FILE_ACCEPT = '.json,application/json';
export const IMPORT_FILE_EXTENSIONS = ['.json'];
export const IMPORT_FILE_MAX_BYTES = 5 * 1024 * 1024;
export const IMPORT_FILE_MAX_LABEL = '5 MB';
