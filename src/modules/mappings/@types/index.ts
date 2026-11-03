import type { ReactNode } from 'react';
import type { NewMappingProjectFormValues } from '../components/new-project/schema';
import type { MappingTemplateFormValues } from '../components/template-dialog/schema';
import type {
  MAPPING_FORMAT,
  MAPPING_PROJECT_SORT,
  CATALOG_MODE,
  MAPPING_TEMPLATE_SORT,
  MAPPING_TEMPLATE_STATUS,
  TEMPLATE_INPUT_TYPE,
  TEMPLATE_OUTPUT_TYPE,
} from '../constants';

export type { MappingTemplateFormValues, NewMappingProjectFormValues };

export type MappingFormat =
  (typeof MAPPING_FORMAT)[keyof typeof MAPPING_FORMAT];

export type MappingProjectSort =
  (typeof MAPPING_PROJECT_SORT)[keyof typeof MAPPING_PROJECT_SORT];

// DTO — raw shape from the API (currently served from mocks/mappingProjects.ts)
export interface MappingProjectApiDto {
  id: string;
  name: string;
  description: string | null;
  /** The message format the project reads, e.g. HL7 or JSON; null until it has a template */
  format: MappingFormat | null;
  templateCount: number;
  /** ISO 8601 timestamp */
  updatedAt: string;
}

// Domain shape used through the UI
export interface MappingProject {
  id: string;
  name: string;
  description: string | null;
  format: MappingFormat | null;
  templateCount: number;
  updatedAt: string;
}

export type MappingProjectListState =
  | { status: 'loading' }
  | { status: 'success'; data: MappingProject[] }
  | { status: 'error'; error: string };

// Component props
export interface SortOption<TSort extends string> {
  value: TSort;
  label: string;
}

export interface ListToolbarProps<TSort extends string> {
  search: string;
  onSearchChange: (search: string) => void;
  /** e.g. "Search projects" — also the input's accessible name */
  searchPlaceholder: string;
  sort: TSort;
  sortOptions: Array<SortOption<TSort>>;
  onSortChange: (sort: TSort) => void;
  /** Items matching the search; null while the list is loading */
  count: number | null;
  /** e.g. { one: 'project', other: 'projects' } */
  countNoun: { one: string; other: string };
  /** Page-level buttons pinned to the right end of the toolbar row. */
  actions?: ReactNode;
  disabled?: boolean;
}

export interface MappingProjectCardProps {
  project: MappingProject;
  onOpen: (project: MappingProject) => void;
  onEditDetails: (project: MappingProject) => void;
  onDuplicate: (project: MappingProject) => void;
  onExport: (project: MappingProject) => void;
  onDelete: (project: MappingProject) => void;
}

export interface MappingProjectCardMenuProps {
  projectName: string;
  onEditDetails: () => void;
  onDuplicate: () => void;
  onExport: () => void;
  onDelete: () => void;
}

export interface MappingFormatBadgeProps {
  format: MappingFormat;
}

// ── Import Project dialog ────────────────────────────────────────

/** A JSON project export, after checking it parses to an object */
export type MappingProjectDefinition = Record<string, unknown>;

/** POST body for importing a mapping project */
export interface ImportMappingProjectRequest {
  fileName: string;
  definition: MappingProjectDefinition;
  overwrite: boolean;
}

/** 'conflict' = a project with that name exists and overwrite was off */
export type ImportMappingProjectResult =
  | { status: 'imported' }
  | { status: 'conflict'; name: string };

export interface ImportMappingProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** A rejection is shown inside the dialog as a generic failure. */
  onImport: (
    request: ImportMappingProjectRequest,
  ) => Promise<ImportMappingProjectResult>;
}

// ── New Project dialog ───────────────────────────────────────────

/** POST body for creating a mapping project */
export interface CreateMappingProjectPayload {
  name: string;
  description: string | null;
}

export interface NewMappingProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Resolves once created; a rejection is shown inside the dialog. */
  onCreate: (values: NewMappingProjectFormValues) => Promise<void>;
}

export interface CharacterCountProps {
  length: number;
  max: number;
}

// ── Project detail → templates ───────────────────────────────────

export type TemplateInputType =
  (typeof TEMPLATE_INPUT_TYPE)[keyof typeof TEMPLATE_INPUT_TYPE];

/** Input types that come with a catalog of message types */
export type TemplateCatalogInputType = Exclude<
  TemplateInputType,
  'custom-json'
>;

export type TemplateOutputType =
  (typeof TEMPLATE_OUTPUT_TYPE)[keyof typeof TEMPLATE_OUTPUT_TYPE];

export type CatalogMode = (typeof CATALOG_MODE)[keyof typeof CATALOG_MODE];

export interface CatalogOption {
  /** The code stored on the template, e.g. "ADT_A01" */
  value: string;
  /** Human name, e.g. "Admit/Visit Notification" */
  label: string;
}

/** Known message types and versions for one input type, plus its wording */
export interface MappingTemplateMessageCatalog {
  question: string;
  selectPlaceholder: string;
  searchPlaceholder: string;
  customPlaceholder: string;
  customHint: string;
  versionCustomPlaceholder: string;
  types: CatalogOption[];
  versions: string[];
}

export type MappingTemplateStatus =
  (typeof MAPPING_TEMPLATE_STATUS)[keyof typeof MAPPING_TEMPLATE_STATUS];

export type MappingTemplateSort =
  (typeof MAPPING_TEMPLATE_SORT)[keyof typeof MAPPING_TEMPLATE_SORT];

// DTO — raw shape from the API (currently served from mocks/mappingTemplates.ts)
export interface MappingTemplateApiDto {
  id: string;
  projectId: string;
  name: string;
  description: string | null;
  inputType: TemplateInputType;
  outputType: TemplateOutputType;
  /** The message the template handles, e.g. "ADT_A01"; null for Custom JSON */
  messageType: string | null;
  /** Versions it accepts, e.g. "2.5.1"; null = any version */
  messageVersion: string | null;
  status: MappingTemplateStatus;
  /** Target fields with a mapping */
  fieldCount: number;
  /** ISO 8601 timestamp */
  updatedAt: string;
}

// Domain shape used through the UI
export interface MappingTemplate {
  id: string;
  projectId: string;
  name: string;
  description: string | null;
  inputType: TemplateInputType;
  outputType: TemplateOutputType;
  messageType: string | null;
  messageVersion: string | null;
  status: MappingTemplateStatus;
  fieldCount: number;
  updatedAt: string;
}

export type MappingTemplateListState =
  | { status: 'loading' }
  | { status: 'success'; data: MappingTemplate[] }
  | { status: 'error'; error: string };

/** POST / PATCH body for a template's details */
export interface SaveMappingTemplatePayload {
  name: string;
  description: string | null;
  inputType: TemplateInputType;
  outputType: TemplateOutputType;
  messageType: string | null;
  messageVersion: string | null;
  /** Custom JSON only: builds the input field tree; never stored as data */
  inputSchema: string | null;
}

export interface MappingProjectDetailScreenProps {
  project: MappingProject;
  onBack: () => void;
  /** Called after templates are added, edited or deleted, so the grid stays current */
  onTemplatesChange: (projectId: string, templates: MappingTemplate[]) => void;
}

export interface MappingProjectHeaderProps {
  project: MappingProject;
  /** The loaded templates, for live stats; null while loading */
  templates: MappingTemplate[] | null;
}

export interface MappingTemplateCardProps {
  template: MappingTemplate;
  onOpen: (template: MappingTemplate) => void;
  onEdit: (template: MappingTemplate) => void;
  onDelete: (template: MappingTemplate) => void;
}

export interface MappingTemplateCardMenuProps {
  templateName: string;
  onEdit: () => void;
  onDelete: () => void;
}

export interface TemplateFormatFlowProps {
  inputType: TemplateInputType;
  outputType: TemplateOutputType;
  messageType: string | null;
  messageVersion: string | null;
}

export interface TemplateStatusIndicatorProps {
  status: MappingTemplateStatus;
}

export interface MappingTemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** The template being edited, or null to add a new one */
  template: MappingTemplate | null;
  /** Resolves once saved; a rejection is shown inside the dialog. */
  onSubmit: (values: MappingTemplateFormValues) => Promise<void>;
}

export interface OutputTypePickerProps {
  value: TemplateOutputType;
  onChange: (value: TemplateOutputType) => void;
  disabled?: boolean;
}

export interface MessageMatchFieldsProps {
  inputType: TemplateCatalogInputType;
  disabled?: boolean;
}

export interface CustomJsonSchemaFieldProps {
  /** Editing keeps the current field tree when the schema is left empty */
  isEditing: boolean;
  disabled?: boolean;
}

export interface CatalogModeToggleProps {
  value: CatalogMode;
  onChange: (mode: CatalogMode) => void;
  /** Names the toggle for screen readers, e.g. "Message type source" */
  label: string;
  disabled?: boolean;
}

export interface CatalogComboboxProps {
  id?: string;
  options: CatalogOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  searchPlaceholder: string;
  invalid?: boolean;
  disabled?: boolean;
}
