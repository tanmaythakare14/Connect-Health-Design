import type { ReactNode } from 'react';
import type { NewMappingProjectFormValues } from '../components/new-project/schema';
import type { MappingTemplateFormValues } from '../components/template-dialog/schema';
import type {
  MAPPING_FORMAT,
  MAPPING_PROJECT_SORT,
  CATALOG_MODE,
  MAPPING_TEMPLATE_SORT,
  MAPPING_TEMPLATE_STATUS,
  TARGET_ADD_KIND,
  TARGET_FILTER,
  TARGET_VALUE_MODE,
  TARGET_VIEW,
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

// ── Template editor ─────────────────────────────────────────────────────

export interface MappingTemplateEditorScreenProps {
  project: MappingProject;
  template: MappingTemplate;
  /** Back to the project's templates */
  onBack: () => void;
  /** Back to every mapping project */
  onBackToProjects: () => void;
}

export interface TemplateEditorHeaderProps {
  project: MappingProject;
  template: MappingTemplate;
  onBack: () => void;
  onBackToProjects: () => void;
  /** Suggests source fields for unmapped target fields */
  onAutoMap: () => void;
  onSave: () => void;
  /** Save is only offered when something changed since the last save */
  hasUnsavedChanges: boolean;
  isSaving: boolean;
}

/** The kind of value a source field holds; drives its type icon. */
export type SourceValueType = 'text' | 'datetime' | 'number' | 'boolean';

/** How often a segment shows up: flagged as repeatable, or counted in the sample. */
export type SourceRepeat =
  | { kind: 'may-repeat' }
  | { kind: 'count'; count: number };

/**
 * One node of the source tree. Top-level nodes are segments (MSH, PID…),
 * nodes with children are composite fields, the rest are leaf fields.
 */
export interface SourceTreeNode {
  /** HL7 reference, e.g. "PID" or "PID.3.1"; unique within the tree */
  ref: string;
  label: string;
  /** Leaf fields only */
  valueType?: SourceValueType;
  /** The value in the sample message, when it has one */
  value?: string;
  /** Segments only */
  repeat?: SourceRepeat;
  children?: SourceTreeNode[];
}

export interface SourceSample {
  fileName: string;
  tree: SourceTreeNode[];
}

export interface SourcePanelProps {
  sourceLabel: string;
  sample: SourceSample | null;
  /** Refs that already feed a target field */
  mappedRefs: ReadonlySet<string>;
  onReplaceSample: (file: File) => void;
  onRemoveSample: () => void;
  /** Saves a new name for a field in the sample */
  onRenameField: (ref: string, label: string) => void;
}

export interface SourceTreeProps {
  nodes: SourceTreeNode[];
  expandedRefs: ReadonlySet<string>;
  /** While searching every branch is shown open */
  forceExpanded: boolean;
  mappedRefs: ReadonlySet<string>;
  selectedRef: string | null;
  onToggle: (ref: string) => void;
  onSelect: (ref: string) => void;
  /** The field being renamed in place */
  editingRef: string | null;
  onStartEdit: (ref: string) => void;
  onSaveEdit: (ref: string, label: string) => void;
  onCancelEdit: () => void;
  /** Rows that can be removed (added by hand) show a remove action */
  onRemoveField?: (ref: string) => void;
}

export interface SourceTreeRowProps {
  node: SourceTreeNode;
  depth: number;
  isExpanded: boolean;
  isMapped: boolean;
  isSelected: boolean;
  onToggle: (ref: string) => void;
  onSelect: (ref: string) => void;
  isEditing: boolean;
  onStartEdit: (ref: string) => void;
  onSaveEdit: (ref: string, label: string) => void;
  onCancelEdit: () => void;
  onRemoveField?: (ref: string) => void;
}

export interface SourceTypeIconProps {
  valueType: SourceValueType;
}

export interface SourceRepeatBadgeProps {
  repeat: SourceRepeat;
}

export interface SampleFileBarProps {
  fileName: string;
  /** What the sample is for, under the file name */
  caption: string;
  /** Names the sample in the remove button's label, e.g. "target sample" */
  noun: string;
  onReplace: () => void;
  onRemove: () => void;
}

export interface SampleEmptyStateProps {
  title: string;
  description: string;
  onUpload: () => void;
}

export interface ManualRefInputProps {
  /** Returns an error to show, or null when the ref was taken */
  onAdd: (ref: string) => string | null;
}

export type TargetView = (typeof TARGET_VIEW)[keyof typeof TARGET_VIEW];

export type TargetFilter = (typeof TARGET_FILTER)[keyof typeof TARGET_FILTER];

export type TargetAddKind =
  (typeof TARGET_ADD_KIND)[keyof typeof TARGET_ADD_KIND];

/** The source field a target field is filled from. */
export interface TargetFieldSource {
  ref: string;
  label: string;
}

/**
 * One node of the target tree. Nodes with children are objects or, when
 * `repeatSource` is set, repeating groups built once per source segment.
 */
export interface TargetTreeNode {
  /** Output path, e.g. "orderId" or "notes[0].text"; unique within the tree */
  path: string;
  label: string;
  /** Leaf fields only */
  valueType?: SourceValueType;
  /** Leaf fields only: where the value comes from, when mapped */
  source?: TargetFieldSource;
  /** Leaf fields only: rules (filters, formats) change the value on the way */
  hasRules?: boolean;
  /** Repeating groups only: the source segment that drives the loop */
  repeatSource?: string;
  /** An array: of values for a field, of objects for a group */
  isList?: boolean;
  /** One numbered item of a list ("Item 1" is 0) once a list has several */
  itemIndex?: number;
  /** Leaf fields only: a fixed value written to the output */
  customValue?: CustomValue;
  /** Leaf fields only: a Liquid expression worked out per message */
  expression?: string;
  children?: TargetTreeNode[];
}

export interface TargetSample {
  fileName: string;
  tree: TargetTreeNode[];
}

export interface TargetPanelProps {
  sample: TargetSample | null;
  onReplaceSample: (file: File) => void;
  onRemoveSample: () => void;
  onEditValue: (node: TargetTreeNode) => void;
  onEditRules: (node: TargetTreeNode) => void;
  onDeleteField: (node: TargetTreeNode) => void;
  /** Adds a field or group at the top level (null) or inside a branch */
  onAddNode: (parentPath: string | null, node: TargetTreeNode) => void;
  /** Adds another item to a list, like the existing one */
  onAddItem: (group: TargetTreeNode) => void;
}

export interface TargetTreeProps {
  nodes: TargetTreeNode[];
  expandedPaths: ReadonlySet<string>;
  /** While searching or filtering every branch is shown open */
  forceExpanded: boolean;
  selectedPath: string | null;
  onToggle: (path: string) => void;
  onSelect: (path: string) => void;
  onEditValue: (node: TargetTreeNode) => void;
  onEditRules: (node: TargetTreeNode) => void;
  onDeleteField: (node: TargetTreeNode) => void;
  onAddField: (parent: TargetTreeNode, kind: TargetAddKind) => void;
  /** The inline add form to show at the top of a branch, if it's open there */
  renderAddForm: (parent: TargetTreeNode) => ReactNode;
}

export interface TargetTreeRowProps {
  node: TargetTreeNode;
  depth: number;
  isExpanded: boolean;
  isSelected: boolean;
  onToggle: (path: string) => void;
  onSelect: (path: string) => void;
  onEditValue: (node: TargetTreeNode) => void;
  onEditRules: (node: TargetTreeNode) => void;
  onDeleteField: (node: TargetTreeNode) => void;
  onAddField: (parent: TargetTreeNode, kind: TargetAddKind) => void;
}

export interface TargetFilterToggleProps {
  value: TargetFilter;
  onChange: (value: TargetFilter) => void;
  neededCount: number;
}

export interface MappingProgressProps {
  mapped: number;
  total: number;
}

export interface TargetViewPlaceholderProps {
  title: string;
  description: string;
}

export type JsonTokenKind =
  | 'key'
  | 'string'
  | 'number'
  | 'literal'
  | 'punctuation'
  | 'plain';

export interface JsonToken {
  kind: JsonTokenKind;
  text: string;
}

export interface OutputPanelProps {
  /** What the mappings produce from the current samples; null when there's nothing to build from */
  output: unknown;
}

export interface JsonViewerProps {
  /** Pretty-printed JSON */
  json: string;
}

/** One thread: a source field (or segment) feeding a target field (or group). */
export interface MappingLink {
  sourceRef: string;
  targetPath: string;
}

export interface MappingWireLayerProps {
  links: MappingLink[];
  sourceTree: SourceTreeNode[];
  targetTree: TargetTreeNode[];
}

export interface TargetAddMenuProps {
  /** The object or group being added to */
  node: TargetTreeNode;
  /** Styles the + trigger */
  className?: string;
  onSelect: (kind: TargetAddKind) => void;
}

/** Where an inline add form is open, and for what. */
export interface TargetAdding {
  /** null: the top level */
  parentPath: string | null;
  kind: TargetAddKind;
}

export interface NewTargetField {
  name: string;
  valueType: SourceValueType;
  isList: boolean;
}

export interface NewTargetGroup {
  name: string;
  isList: boolean;
  /** Optional; '' to add fields later */
  firstField: string;
}

export interface TargetAddFieldFormProps {
  /** Keys already used at this level */
  takenNames: string[];
  onSubmit: (field: NewTargetField) => void;
  onCancel: () => void;
}

export interface TargetAddGroupFormProps {
  takenNames: string[];
  onSubmit: (group: NewTargetGroup) => void;
  onCancel: () => void;
}

export interface SourceNameEditorProps {
  /** The field's ref, used in the box's accessible labels */
  fieldRef: string;
  initialName: string;
  onSave: (name: string) => void;
  onCancel: () => void;
}

/** A fixed value a target field is given instead of a source. */
export type CustomValue = string | number | boolean;
export type CustomValueType = 'text' | 'number' | 'boolean';

export type TargetValueMode =
  (typeof TARGET_VALUE_MODE)[keyof typeof TARGET_VALUE_MODE];

/** What the Output value dialog applies to a field. */
export type TargetValueChange =
  | { kind: 'constant'; value: CustomValue }
  | { kind: 'expression'; expression: string }
  | { kind: 'clear' };

export interface TargetValueDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** The field being given a value; stays set while the dialog closes */
  node: TargetTreeNode | null;
  onApply: (path: string, change: TargetValueChange) => void;
}

export interface ValueModeToggleProps {
  value: TargetValueMode;
  onChange: (mode: TargetValueMode) => void;
}
