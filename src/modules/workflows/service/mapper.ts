import type {
  AddWorkflowFormValues,
  CreateWorkflowPayload,
  Workflow,
  WorkflowApiDto,
  WorkflowConnectionSummary,
  WorkflowConnectionSummaryDto,
  WorkflowTemplate,
  WorkflowTemplateApiDto,
} from '../@types';

export function apiDtoToWorkflowTemplate(
  dto: WorkflowTemplateApiDto,
): WorkflowTemplate {
  return {
    id: dto.id,
    name: dto.name,
    description: dto.description,
    category: dto.category,
    nodeCount: dto.nodeCount,
  };
}

export function apiDtoToWorkflow(dto: WorkflowApiDto): Workflow {
  return {
    id: dto.id,
    name: dto.name,
    description: dto.description,
    connections: dto.connections.map(apiDtoToConnectionSummary),
    nodeCount: dto.nodeCount,
    updatedAt: dto.updatedAt,
    status: dto.status,
  };
}

export function apiDtoToConnectionSummary(
  dto: WorkflowConnectionSummaryDto,
): WorkflowConnectionSummary {
  return {
    id: dto.id,
    name: dto.name,
  };
}

export function formValuesToCreateWorkflowPayload(
  values: AddWorkflowFormValues,
): CreateWorkflowPayload {
  const description = values.description.trim();

  return {
    name: values.name.trim(),
    description: description === '' ? null : description,
    connectionIds: values.connectionIds,
  };
}
