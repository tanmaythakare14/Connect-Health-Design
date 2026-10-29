import type {
  ImportSource,
  Workflow,
  WorkflowConnectionFilter,
  WorkflowConnectionSummary,
  WorkflowDefinition,
  WorkflowTemplate,
} from '../@types';
import {
  ALL_CONNECTIONS_FILTER,
  IMPORT_SOURCE,
  NO_CONNECTIONS_FILTER,
} from '../constants';

export function isImportSource(value: string): value is ImportSource {
  return Object.values<string>(IMPORT_SOURCE).includes(value);
}

/** Case-insensitive match on the template name (the Library tab's search). */
export function filterTemplatesByName(
  templates: WorkflowTemplate[],
  search: string,
): WorkflowTemplate[] {
  const query = search.trim().toLowerCase();
  return query
    ? templates.filter((template) =>
        template.name.toLowerCase().includes(query),
      )
    : templates;
}

/** Parses an uploaded export; null unless it's valid JSON describing an object. */
export function parseWorkflowDefinition(
  text: string,
): WorkflowDefinition | null {
  try {
    const parsed: unknown = JSON.parse(text);
    return typeof parsed === 'object' &&
      parsed !== null &&
      !Array.isArray(parsed)
      ? (parsed as WorkflowDefinition)
      : null;
  } catch {
    return null;
  }
}

/** Case-insensitive name lookup, used for the "overwrite" check on import. */
export function findWorkflowByName(
  workflows: Workflow[],
  name: string,
): Workflow | undefined {
  const target = name.trim().toLowerCase();
  return workflows.find(
    (workflow) => workflow.name.trim().toLowerCase() === target,
  );
}

/** Case-insensitive match on name, description or connection name, narrowed by connection. */
export function filterWorkflows(
  workflows: Workflow[],
  search: string,
  connectionFilter: WorkflowConnectionFilter,
): Workflow[] {
  const query = search.trim().toLowerCase();

  return workflows.filter((workflow) => {
    if (
      connectionFilter === NO_CONNECTIONS_FILTER &&
      workflow.connections.length > 0
    ) {
      return false;
    }
    if (
      connectionFilter !== ALL_CONNECTIONS_FILTER &&
      connectionFilter !== NO_CONNECTIONS_FILTER &&
      !workflow.connections.some(
        (connection) => connection.id === connectionFilter,
      )
    ) {
      return false;
    }
    if (!query) {
      return true;
    }
    return [
      workflow.name,
      workflow.description ?? '',
      ...workflow.connections.map((connection) => connection.name),
    ].some((value) => value.toLowerCase().includes(query));
  });
}

/** Every distinct connection used by any workflow, A–Z — the filter's options. */
export function getConnectionOptions(
  workflows: Workflow[],
): WorkflowConnectionSummary[] {
  const byId = new Map<string, WorkflowConnectionSummary>();
  workflows.forEach((workflow) =>
    workflow.connections.forEach((connection) =>
      byId.set(connection.id, connection),
    ),
  );
  return [...byId.values()].sort((a, b) => a.name.localeCompare(b.name));
}

const DAY_MS = 24 * 60 * 60 * 1000;

/** "Today", "Yesterday", "3d ago", "2w ago", then a short date ("Sep 14"). */
export function formatUpdatedLabel(isoDate: string, now = new Date()): string {
  const startOfDay = (date: Date): number =>
    new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
  const date = new Date(isoDate);
  const days = Math.round((startOfDay(now) - startOfDay(date)) / DAY_MS);

  if (days <= 0) {
    return 'Today';
  }
  if (days === 1) {
    return 'Yesterday';
  }
  if (days < 7) {
    return `${days}d ago`;
  }
  if (days < 30) {
    return `${Math.floor(days / 7)}w ago`;
  }
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
