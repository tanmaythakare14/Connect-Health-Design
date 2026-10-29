// MOCK-ONLY cross-module import: the Connections screen's mock stands in for the
// shared GET /api/v1/connections endpoint so both screens show the same data.
// It goes away with the mocks — the real call below is a plain fetch.
import { MOCK_CONNECTIONS } from '@/modules/connections/mocks/connections';
import type {
  CreateWorkflowPayload,
  ImportWorkflowRequest,
  WorkflowApiDto,
  WorkflowConnectionSummaryDto,
  WorkflowTemplateApiDto,
} from '../@types';
import { IMPORT_SOURCE, WORKFLOW_STATUS } from '../constants';
import { MOCK_WORKFLOW_TEMPLATES } from '../mocks/workflowTemplates';
import { MOCK_WORKFLOWS } from '../mocks/workflows';

const MOCK_LATENCY_MS = 400;

const simulateLatency = (): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, MOCK_LATENCY_MS));

// MOCK:API — no workflows endpoints exist yet. Replace each body with a fetch to
// `${config.apiUrl}/api/v1/...` (see .claude/rules/api.md) and delete the mocks.
export async function listWorkflows(): Promise<WorkflowApiDto[]> {
  await simulateLatency();
  return MOCK_WORKFLOWS;
}

/** Connections a workflow may be allowed to use (GET /api/v1/connections). */
export async function listConnectionOptions(): Promise<
  WorkflowConnectionSummaryDto[]
> {
  await simulateLatency();
  return MOCK_CONNECTIONS.map(({ id, name }) => ({ id, name }));
}

export async function createWorkflow(
  payload: CreateWorkflowPayload,
): Promise<WorkflowApiDto> {
  await simulateLatency();
  const namesById = new Map(
    MOCK_CONNECTIONS.map((connection) => [connection.id, connection.name]),
  );

  // A new workflow has no nodes yet, so it starts inactive.
  return {
    id: `wf-${crypto.randomUUID()}`,
    name: payload.name,
    description: payload.description,
    connections: payload.connectionIds.flatMap((id) => {
      const name = namesById.get(id);
      return name ? [{ id, name }] : [];
    }),
    nodeCount: 0,
    updatedAt: new Date().toISOString(),
    status: WORKFLOW_STATUS.INACTIVE,
  };
}

export async function deleteWorkflow(workflowId: string): Promise<void> {
  await simulateLatency();
  if (!workflowId) {
    throw new Error('A workflow id is required to delete a workflow');
  }
}

export async function listWorkflowTemplates(): Promise<
  WorkflowTemplateApiDto[]
> {
  await simulateLatency();
  return MOCK_WORKFLOW_TEMPLATES;
}

/**
 * Imports from an uploaded JSON export or a library template. The real
 * endpoint would answer 409 on a name clash when `overwrite` is false; the
 * screen performs that check against its local list while this is mocked.
 */
export async function importWorkflow(
  request: ImportWorkflowRequest,
): Promise<WorkflowApiDto> {
  await simulateLatency();
  const base = {
    id: `wf-${crypto.randomUUID()}`,
    connections: [],
    updatedAt: new Date().toISOString(),
    // Imported workflows start paused until reviewed.
    status: WORKFLOW_STATUS.INACTIVE,
  };

  if (request.source === IMPORT_SOURCE.LIBRARY) {
    const template = MOCK_WORKFLOW_TEMPLATES.find(
      ({ id }) => id === request.templateId,
    );
    if (!template) {
      throw new Error(`Unknown workflow template: ${request.templateId}`);
    }
    return {
      ...base,
      name: template.name,
      description: template.description,
      nodeCount: template.nodeCount,
    };
  }

  const { definition, fileName } = request;
  const name =
    typeof definition.name === 'string' && definition.name.trim() !== ''
      ? definition.name.trim()
      : fileName.replace(/\.json$/i, '');

  return {
    ...base,
    name,
    description:
      typeof definition.description === 'string'
        ? definition.description
        : null,
    nodeCount: Array.isArray(definition.nodes) ? definition.nodes.length : 0,
  };
}
