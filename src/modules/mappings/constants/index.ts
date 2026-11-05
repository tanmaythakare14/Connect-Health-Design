import type {
  MappingFormat,
  MappingProjectSort,
  MappingTemplateMessageCatalog,
  MappingTemplateSort,
  MappingTemplateStatus,
  SortOption,
  CompareOperator,
  CustomValueType,
  GroupConditionKind,
  JsonTokenKind,
  SourceValueType,
  TemplateCatalogInputType,
  TemplateInputType,
  TemplateOutputType,
} from '../@types';

export const MAPPING_FORMAT = {
  HL7: 'hl7',
  JSON: 'json',
  X12: 'x12',
  CCDA: 'ccda',
} as const;

export const MAPPING_FORMAT_LABELS: Record<MappingFormat, string> = {
  hl7: 'HL7',
  json: 'JSON',
  x12: 'X12',
  ccda: 'C-CDA',
};

export const MAPPING_PROJECT_SORT = {
  RECENTLY_UPDATED: 'recently-updated',
  NAME: 'name',
  MOST_TEMPLATES: 'most-templates',
} as const;

export const MAPPING_PROJECT_SORT_OPTIONS: Array<
  SortOption<MappingProjectSort>
> = [
  { value: MAPPING_PROJECT_SORT.RECENTLY_UPDATED, label: 'Recently updated' },
  { value: MAPPING_PROJECT_SORT.NAME, label: 'Name (A–Z)' },
  { value: MAPPING_PROJECT_SORT.MOST_TEMPLATES, label: 'Most templates' },
];

export const DEFAULT_MAPPING_PROJECT_SORT =
  MAPPING_PROJECT_SORT.RECENTLY_UPDATED;

/** Multiples of 12 fill complete rows in the 2/3/4-column grid. */
export const PAGE_SIZE_OPTIONS = [12, 24, 48];
export const DEFAULT_PAGE_SIZE = 12;
/** Pagination only shows once there's more than the smallest page holds. */
export const PAGINATION_THRESHOLD = PAGE_SIZE_OPTIONS[0];

export const SKELETON_CARD_COUNT = 6;

export const MAPPING_PROJECT_NAME_MAX_LENGTH = 150;
export const MAPPING_PROJECT_DESCRIPTION_MAX_LENGTH = 150;

export const IMPORT_FILE_ACCEPT = '.json,application/json';
export const IMPORT_FILE_EXTENSIONS = ['.json'];
export const IMPORT_FILE_MAX_BYTES = 5 * 1024 * 1024;
export const IMPORT_FILE_MAX_LABEL = '5 MB';

// ── Project detail → templates ───────────────────────────────────

/** What a template reads. */
export const TEMPLATE_INPUT_TYPE = {
  HL7: 'hl7',
  X12: 'x12',
  CCDA: 'ccda',
  CUSTOM_JSON: 'custom-json',
} as const;

export const TEMPLATE_INPUT_TYPE_OPTIONS: Array<{
  value: TemplateInputType;
  label: string;
  description: string;
}> = [
  {
    value: TEMPLATE_INPUT_TYPE.HL7,
    label: 'HL7',
    description: 'Pipe-delimited HL7 v2 messages',
  },
  {
    value: TEMPLATE_INPUT_TYPE.X12,
    label: 'X12',
    description: 'EDI transactions such as 270 or 837',
  },
  {
    value: TEMPLATE_INPUT_TYPE.CCDA,
    label: 'C-CDA',
    description: 'Clinical documents in XML',
  },
  {
    value: TEMPLATE_INPUT_TYPE.CUSTOM_JSON,
    label: 'Custom JSON',
    description: 'Any JSON shape you describe with a schema',
  },
];

/** What a template produces. */
export const TEMPLATE_OUTPUT_TYPE = {
  FHIR_JSON: 'fhir-json',
  HL7V2: 'hl7v2',
  X12_EDI: 'x12-edi',
  CCDA: 'ccda',
} as const;

export const TEMPLATE_OUTPUT_TYPE_OPTIONS: Array<{
  value: TemplateOutputType;
  label: string;
  description: string;
}> = [
  {
    value: TEMPLATE_OUTPUT_TYPE.FHIR_JSON,
    label: 'FHIR / JSON',
    description: 'Generates a FHIR / JSON object from your mapped fields.',
  },
  {
    value: TEMPLATE_OUTPUT_TYPE.HL7V2,
    label: 'HL7 v2',
    description:
      'Generates a pipe-delimited HL7 v2 message from your mapped fields.',
  },
  {
    value: TEMPLATE_OUTPUT_TYPE.X12_EDI,
    label: 'X12 EDI',
    description: 'Generates an X12 EDI transaction from your mapped fields.',
  },
  {
    value: TEMPLATE_OUTPUT_TYPE.CCDA,
    label: 'C-CDA',
    description: 'Generates a C-CDA XML document from your mapped fields.',
  },
];

export const TEMPLATE_INPUT_TYPE_LABELS = Object.fromEntries(
  TEMPLATE_INPUT_TYPE_OPTIONS.map(({ value, label }) => [value, label]),
) as Record<TemplateInputType, string>;

export const TEMPLATE_OUTPUT_TYPE_LABELS = Object.fromEntries(
  TEMPLATE_OUTPUT_TYPE_OPTIONS.map(({ value, label }) => [value, label]),
) as Record<TemplateOutputType, string>;

/** "From catalog" picks a known value; "Custom" types one in. */
export const CATALOG_MODE = {
  CATALOG: 'catalog',
  CUSTOM: 'custom',
} as const;

/** Version value meaning "accept every version". */
export const ANY_VERSION = '';

/** Message types and versions per input type; Custom JSON has none. */
export const TEMPLATE_MESSAGE_CATALOGS: Record<
  TemplateCatalogInputType,
  MappingTemplateMessageCatalog
> = {
  hl7: {
    question: 'Which HL7 message type does this handle?',
    selectPlaceholder: 'Select a message type',
    searchPlaceholder: 'Search by name or code, e.g. A08',
    customPlaceholder: 'e.g. ORU_R01',
    customHint: 'The message code and trigger event, joined by _ or ^.',
    versionCustomPlaceholder: 'e.g. 2.5.1',
    types: [
      { value: 'ADT_A01', label: 'Admit/Visit Notification' },
      { value: 'ADT_A02', label: 'Transfer a Patient' },
      { value: 'ADT_A03', label: 'Discharge/End Visit' },
      { value: 'ADT_A04', label: 'Register a Patient' },
      { value: 'ADT_A05', label: 'Pre-admit a Patient' },
      { value: 'ADT_A06', label: 'Change Outpatient to Inpatient' },
      { value: 'ADT_A07', label: 'Change Inpatient to Outpatient' },
      { value: 'ADT_A08', label: 'Update Patient Information' },
      { value: 'ADT_A11', label: 'Cancel Admit/Visit Notification' },
      { value: 'ADT_A12', label: 'Cancel Transfer' },
      { value: 'ADT_A13', label: 'Cancel Discharge/End Visit' },
      { value: 'ADT_A28', label: 'Add Person Information' },
      { value: 'ADT_A31', label: 'Update Person Information' },
      { value: 'ADT_A40', label: 'Merge Patient Identifier List' },
      { value: 'ORM_O01', label: 'General Order' },
      { value: 'OML_O21', label: 'Laboratory Order' },
      { value: 'ORU_R01', label: 'Unsolicited Observation Result' },
      { value: 'MDM_T02', label: 'Original Document Notification' },
      { value: 'SIU_S12', label: 'New Appointment Booking' },
      { value: 'SIU_S14', label: 'Appointment Modification' },
      { value: 'SIU_S15', label: 'Appointment Cancellation' },
      { value: 'VXU_V04', label: 'Unsolicited Vaccination Update' },
      { value: 'DFT_P03', label: 'Post Detail Financial Transaction' },
    ],
    versions: [
      '2.1',
      '2.2',
      '2.3',
      '2.3.1',
      '2.4',
      '2.5',
      '2.5.1',
      '2.6',
      '2.7',
      '2.7.1',
      '2.8',
    ],
  },
  x12: {
    question: 'Which X12 transaction does this handle?',
    selectPlaceholder: 'Select a transaction',
    searchPlaceholder: 'Search by name or number, e.g. 837',
    customPlaceholder: 'e.g. 837P',
    customHint: 'The transaction set number, e.g. 270 or 837I.',
    versionCustomPlaceholder: 'e.g. 005010X279A1',
    types: [
      { value: '270', label: 'Eligibility Inquiry' },
      { value: '271', label: 'Eligibility Response' },
      { value: '276', label: 'Claim Status Request' },
      { value: '277', label: 'Claim Status Response' },
      { value: '278', label: 'Prior Authorization' },
      { value: '834', label: 'Benefit Enrollment' },
      { value: '835', label: 'Claim Payment / Remittance' },
      { value: '837P', label: 'Professional Claim' },
      { value: '837I', label: 'Institutional Claim' },
      { value: '837D', label: 'Dental Claim' },
    ],
    versions: ['004010', '005010', '006020'],
  },
  ccda: {
    question: 'Which C-CDA document type does this handle?',
    selectPlaceholder: 'Select a document type',
    searchPlaceholder: 'Search document types',
    customPlaceholder: 'e.g. UnstructuredDocument',
    customHint: 'The document type as it appears in the template ID.',
    versionCustomPlaceholder: 'e.g. R2.1',
    types: [
      { value: 'CCD', label: 'Continuity of Care Document' },
      { value: 'DischargeSummary', label: 'Discharge Summary' },
      { value: 'ReferralNote', label: 'Referral Note' },
      { value: 'ProgressNote', label: 'Progress Note' },
      { value: 'ConsultationNote', label: 'Consultation Note' },
      { value: 'HistoryAndPhysical', label: 'History and Physical' },
      { value: 'OperativeNote', label: 'Operative Note' },
      { value: 'CarePlan', label: 'Care Plan' },
      { value: 'TransferSummary', label: 'Transfer Summary' },
    ],
    versions: ['R1.1', 'R2.1', 'R3.0'],
  },
};

export const MAPPING_TEMPLATE_STATUS = {
  READY: 'ready',
  DRAFT: 'draft',
} as const;

export const MAPPING_TEMPLATE_STATUS_LABELS: Record<
  MappingTemplateStatus,
  string
> = {
  ready: 'Ready',
  draft: 'Draft',
};

export const MAPPING_TEMPLATE_SORT = {
  RECENTLY_UPDATED: 'recently-updated',
  NAME: 'name',
  MOST_FIELDS: 'most-fields',
} as const;

export const MAPPING_TEMPLATE_SORT_OPTIONS: Array<
  SortOption<MappingTemplateSort>
> = [
  { value: MAPPING_TEMPLATE_SORT.RECENTLY_UPDATED, label: 'Recently updated' },
  { value: MAPPING_TEMPLATE_SORT.NAME, label: 'Name (A–Z)' },
  { value: MAPPING_TEMPLATE_SORT.MOST_FIELDS, label: 'Most fields' },
];

export const DEFAULT_MAPPING_TEMPLATE_SORT =
  MAPPING_TEMPLATE_SORT.RECENTLY_UPDATED;

export const MAPPING_TEMPLATE_NAME_MAX_LENGTH = 150;
export const MAPPING_TEMPLATE_DESCRIPTION_MAX_LENGTH = 150;
export const MAPPING_TEMPLATE_MESSAGE_TYPE_MAX_LENGTH = 40;
export const MAPPING_TEMPLATE_VERSION_MAX_LENGTH = 20;

// ── Template editor ─────────────────────────────────────────────────────

/** "PID.5.1", "ORC.7.4", "ZPD.1" — segment id, then field/component numbers. */
export const HL7_REF_PATTERN = /^[A-Z][A-Z0-9]{2}(\.\d+){1,3}$/;

/** Ref of the group that collects fields added by hand. */
export const MANUAL_SOURCE_GROUP_REF = '__manual__';

/** The Mappings screen's line tabs. */
export const MAPPINGS_TAB = {
  MAPPINGS: 'mappings',
  FILTERS: 'filters',
} as const;

export const TARGET_VIEW = {
  FIELDS: 'fields',
  TABLE: 'table',
  LIQUID: 'liquid',
} as const;

export const TARGET_FILTER = {
  ALL: 'all',
  NEEDED: 'needed',
} as const;

/** A target key: a JSON-friendly name like middleName or address_2. */
export const TARGET_KEY_PATTERN = /^[A-Za-z_][A-Za-z0-9_]*$/;

/** What the + on an object or group adds. */
export const TARGET_ADD_KIND = {
  FIELD: 'field',
  GROUP: 'group',
  ITEM: 'item',
} as const;

/** The value types a new target field can have: string or number. */
export const TARGET_VALUE_TYPE_OPTIONS: Array<{
  value: SourceValueType;
  label: string;
}> = [
  { value: 'text', label: 'string' },
  { value: 'number', label: 'number' },
];

/** How an unmapped target field gets its value. */
export const TARGET_VALUE_MODE = {
  CONSTANT: 'constant',
  EXPRESSION: 'expression',
} as const;

export const CUSTOM_VALUE_TYPE_OPTIONS: Array<{
  value: CustomValueType;
  label: string;
}> = [
  { value: 'text', label: 'Text' },
  { value: 'number', label: 'Number' },
  { value: 'boolean', label: 'True / false' },
];

/**
 * A short, synthetic starter message per input type for "Load example" in the
 * Replace sample dialog. String.raw keeps HL7's encoding characters (^~\&).
 */
export const SAMPLE_PAYLOAD_EXAMPLES: Partial<
  Record<TemplateInputType, string>
> = {
  hl7: String.raw`MSH|^~\&|CPOE|HOSP|LAB|LABFAC|20240115120000||ORM^O01|MSG00009|P|2.5
PID|1||SYN12345^^^HOSP^MR||Doe^John^A||19800101|M
ORC|NW|ORD789|||||||20240115120000|||DR001^Smith^Jane
OBR|1|ORD789||CBC^Complete Blood Count^L|||20240115120000`,
};

/** FHIR resources a target sample can start from, most used first. */
export const FHIR_RESOURCE_TYPES: string[] = [
  'ServiceRequest',
  'Patient',
  'Encounter',
  'Observation',
  'Appointment',
  'DiagnosticReport',
  'MedicationRequest',
  'Immunization',
  'DocumentReference',
  'Coverage',
  'Claim',
  'ClaimResponse',
  'Task',
  'PaymentReconciliation',
  'Condition',
  'AllergyIntolerance',
  'MedicationStatement',
  'Procedure',
  'Account',
  'OperationOutcome',
];

/** JSON colouring, shared by the live output and the sample editor. */
export const JSON_TOKEN_CLASS_NAMES: Record<JsonTokenKind, string> = {
  key: 'text-primary',
  string: 'text-emerald-700 dark:text-emerald-400',
  number: 'text-amber-700 dark:text-amber-400',
  literal: 'text-sky-700 dark:text-sky-400',
  punctuation: 'text-muted-foreground',
  plain: '',
};

/** The resource "Start a FHIR Bundle" builds around (and picks). */
export const FHIR_BUNDLE_STARTER_RESOURCE = 'Patient';

/**
 * What "Start a FHIR Bundle" puts in the target sample: a collection Bundle
 * with a synthetic Patient entry, plus a ServiceRequest under the
 * `entry[@ServiceRequest]` key the mapper uses for a typed entry list.
 */
export const FHIR_BUNDLE_STARTER = JSON.stringify(
  {
    resourceType: 'Bundle',
    type: 'collection',
    entry: [
      {
        resource: {
          resourceType: 'Patient',
          identifier: [{ system: 'urn:mrn', value: 'SYNTH001' }],
          name: [{ family: 'TestFamily', given: ['TestGiven'] }],
          gender: 'male',
          birthDate: '1980-01-01',
          address: [
            {
              line: ['1 Synthetic St'],
              city: 'Testville',
              state: 'CA',
              postalCode: '00000',
            },
          ],
          telecom: [{ system: 'phone', value: '555-0100' }],
        },
      },
    ],
    'entry[@ServiceRequest]': [
      {
        resource: {
          resourceType: 'ServiceRequest',
          status: 'active',
          intent: 'order',
          code: {
            coding: [
              {
                system: 'http://loinc.org',
                code: '58410-2',
                display: 'CBC panel',
              },
            ],
          },
          subject: { reference: 'Patient/example' },
          authoredOn: '2026-01-01T09:00:00Z',
        },
      },
    ],
  },
  null,
  2,
);

// ── Group conditions ────────────────────────────────────────────────────

export const GROUP_CONDITION_KIND = {
  PRESENT: 'present',
  COMPARE: 'compare',
  LIQUID: 'liquid',
} as const;

export const GROUP_CONDITION_KIND_OPTIONS: Array<{
  value: GroupConditionKind;
  label: string;
  /** One line under the picker saying what the condition does */
  hint: string;
}> = [
  {
    value: GROUP_CONDITION_KIND.PRESENT,
    label: 'Skip if empty (is present)',
    hint: 'Written only when this source field has a value.',
  },
  {
    value: GROUP_CONDITION_KIND.COMPARE,
    label: 'Compare value',
    hint: 'Written only when the source field compares as set.',
  },
  {
    value: GROUP_CONDITION_KIND.LIQUID,
    label: 'Raw Liquid condition',
    hint: 'Written only when this Liquid condition is true.',
  },
];

export const COMPARE_OPERATOR = {
  EQUALS: 'equals',
  NOT_EQUALS: 'not-equals',
  CONTAINS: 'contains',
  STARTS_WITH: 'starts-with',
  GREATER_THAN: 'greater-than',
  LESS_THAN: 'less-than',
} as const;

export const COMPARE_OPERATOR_OPTIONS: Array<{
  value: CompareOperator;
  label: string;
}> = [
  { value: COMPARE_OPERATOR.EQUALS, label: 'equals' },
  { value: COMPARE_OPERATOR.NOT_EQUALS, label: 'does not equal' },
  { value: COMPARE_OPERATOR.CONTAINS, label: 'contains' },
  { value: COMPARE_OPERATOR.STARTS_WITH, label: 'starts with' },
  { value: COMPARE_OPERATOR.GREATER_THAN, label: 'is greater than' },
  { value: COMPARE_OPERATOR.LESS_THAN, label: 'is less than' },
];

/** Above this many conditions the list scrolls instead of growing. */
export const MAX_VISIBLE_CONDITIONS = 3;
