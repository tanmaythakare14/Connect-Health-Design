import type { ComponentProps, ReactNode } from 'react';
import type { AddWorkflowFormValues } from '../components/add-workflow/schema';
import type {
  IMPORT_SOURCE,
  WORKFLOW_STATUS,
  WORKFLOW_TEMPLATE_CATEGORY,
} from '../constants';

export type { AddWorkflowFormValues };

export type WorkflowStatus =
  (typeof WORKFLOW_STATUS)[keyof typeof WORKFLOW_STATUS];

/**
 * Minimal connection shape owned by this module (no import from the
 * connections module — see .claude/rules/modules.md).
 */
export interface WorkflowConnectionSummaryDto {
  id: string;
  name: string;
}

// DTO — raw shape from the API (currently served from mocks/workflows.ts)
export interface WorkflowApiDto {
  id: string;
  name: string;
  description: string | null;
  connections: WorkflowConnectionSummaryDto[];
  nodeCount: number;
  /** ISO 8601 timestamp */
  updatedAt: string;
  status: WorkflowStatus;
}

export interface WorkflowConnectionSummary {
  id: string;
  name: string;
}

// Domain shape used through the UI
export interface Workflow {
  id: string;
  name: string;
  description: string | null;
  connections: WorkflowConnectionSummary[];
  nodeCount: number;
  updatedAt: string;
  status: WorkflowStatus;
}

/** 'all', 'none' (workflows without connections) or a connection id */
export type WorkflowConnectionFilter = string;

export type WorkflowListState =
  | { status: 'loading' }
  | { status: 'success'; data: Workflow[] }
  | { status: 'error'; error: string };

// Component props
export interface WorkflowToolbarProps {
  search: string;
  onSearchChange: (search: string) => void;
  connectionFilter: WorkflowConnectionFilter;
  onConnectionFilterChange: (filter: WorkflowConnectionFilter) => void;
  connectionOptions: WorkflowConnectionSummary[];
  /** Page-level buttons pinned to the right end of the toolbar row. */
  actions?: ReactNode;
  disabled?: boolean;
}

export interface WorkflowCardProps {
  workflow: Workflow;
  onOpen: (workflow: Workflow) => void;
  onToggleStatus: (workflow: Workflow) => void;
  onExport: (workflow: Workflow) => void;
  onSettings: (workflow: Workflow) => void;
  onDelete: (workflow: Workflow) => void;
}

export interface WorkflowStatusToggleButtonProps {
  workflowName: string;
  status: WorkflowStatus;
  onToggleStatus: () => void;
}

export interface WorkflowCardMenuProps {
  workflowName: string;
  onExport: () => void;
  onSettings: () => void;
  onDelete: () => void;
}

export interface WorkflowStatusBadgeProps {
  status: WorkflowStatus;
}

export interface WorkflowConnectionChipsProps {
  connections: WorkflowConnectionSummary[];
}

// ── Add Workflow dialog ──────────────────────────────────────────

/** POST body for creating a workflow */
export interface CreateWorkflowPayload {
  name: string;
  description: string | null;
  connectionIds: string[];
}

export type ConnectionOptionsState =
  | { status: 'loading' }
  | { status: 'success'; data: WorkflowConnectionSummary[] }
  | { status: 'error' };

export interface AddWorkflowDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Resolves once created; a rejection is shown inside the dialog. */
  onCreate: (values: AddWorkflowFormValues) => Promise<void>;
}

/** id / aria-* come from FormControl so the label and errors stay linked. */
export interface ConnectionMultiSelectProps
  extends Pick<
    ComponentProps<'button'>,
    'id' | 'aria-describedby' | 'aria-invalid'
  > {
  options: WorkflowConnectionSummary[];
  value: string[];
  onChange: (connectionIds: string[]) => void;
  isLoading: boolean;
  hasError: boolean;
  onRetry: () => void;
  disabled?: boolean;
}

// ── Import Workflow dialog ───────────────────────────────────────

export type ImportSource = (typeof IMPORT_SOURCE)[keyof typeof IMPORT_SOURCE];

export type WorkflowTemplateCategory =
  (typeof WORKFLOW_TEMPLATE_CATEGORY)[keyof typeof WORKFLOW_TEMPLATE_CATEGORY];

// DTO — raw shape from the API (currently served from mocks/workflowTemplates.ts)
export interface WorkflowTemplateApiDto {
  id: string;
  name: string;
  description: string;
  category: WorkflowTemplateCategory;
  nodeCount: number;
}

export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: WorkflowTemplateCategory;
  nodeCount: number;
}

export type WorkflowTemplateListState =
  | { status: 'loading' }
  | { status: 'success'; data: WorkflowTemplate[] }
  | { status: 'error' };

/** A JSON workflow export, after checking it parses to an object */
export type WorkflowDefinition = Record<string, unknown>;

/** POST body for importing a workflow */
export type ImportWorkflowRequest =
  | {
      source: 'file';
      fileName: string;
      definition: WorkflowDefinition;
      overwrite: boolean;
    }
  | { source: 'library'; templateId: string; overwrite: boolean };

/** 'conflict' = a workflow with that name exists and overwrite was off */
export type ImportWorkflowResult =
  | { status: 'imported' }
  | { status: 'conflict'; name: string };

export interface ImportWorkflowDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** A rejection is shown inside the dialog as a generic failure. */
  onImport: (request: ImportWorkflowRequest) => Promise<ImportWorkflowResult>;
}

export interface WorkflowTemplateLibraryProps {
  listState: WorkflowTemplateListState;
  search: string;
  onSearchChange: (search: string) => void;
  selectedTemplateId: string | null;
  onSelectTemplate: (templateId: string) => void;
  onRetry: () => void;
  disabled?: boolean;
}

export interface WorkflowTemplateOptionProps {
  template: WorkflowTemplate;
  isSelected: boolean;
  disabled?: boolean;
}
