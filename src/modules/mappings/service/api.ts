import type {
  CreateMappingProjectPayload,
  ImportMappingProjectRequest,
  MappingProject,
  MappingProjectApiDto,
  MappingTemplateApiDto,
  SaveMappingTemplatePayload,
} from '../@types';
import {
  MAPPING_FORMAT,
  TEMPLATE_INPUT_TYPE,
  TEMPLATE_OUTPUT_TYPE,
  MAPPING_TEMPLATE_STATUS,
} from '../constants';
import { isMappingFormat } from '../utils';
import { MOCK_MAPPING_PROJECTS } from '../mocks/mappingProjects';
import { MOCK_TEMPLATES_BY_PROJECT } from '../mocks/mappingTemplates';

const MOCK_LATENCY_MS = 400;

const simulateLatency = (): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, MOCK_LATENCY_MS));

// MOCK:API — no mapping endpoints exist yet. Replace each body with a fetch to
// `${config.apiUrl}/api/v1/...` (see .claude/rules/api.md) and delete the mocks.
export async function listMappingProjects(): Promise<MappingProjectApiDto[]> {
  await simulateLatency();
  return MOCK_MAPPING_PROJECTS;
}

/** A new project starts empty: no templates, so no format yet. */
export async function createMappingProject(
  payload: CreateMappingProjectPayload,
): Promise<MappingProjectApiDto> {
  await simulateLatency();
  const id = `map-${crypto.randomUUID()}`;
  MOCK_TEMPLATES_BY_PROJECT.set(id, []);
  return {
    id,
    name: payload.name,
    description: payload.description,
    format: null,
    templateCount: 0,
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Copies a project and its templates; the copy is named "<name> (copy)".
 * MOCK: takes the whole project so copies of copies work without a server —
 * the real call only needs its id (POST /mapping-projects/:id/duplicate).
 */
export async function duplicateMappingProject(
  source: MappingProject,
): Promise<MappingProjectApiDto> {
  await simulateLatency();
  const id = `map-${crypto.randomUUID()}`;
  MOCK_TEMPLATES_BY_PROJECT.set(
    id,
    (MOCK_TEMPLATES_BY_PROJECT.get(source.id) ?? []).map((template) => ({
      ...template,
      id: `${id}-${template.id}`,
      projectId: id,
    })),
  );
  return {
    ...source,
    id,
    name: `${source.name} (copy)`,
    updatedAt: new Date().toISOString(),
  };
}

export async function deleteMappingProject(projectId: string): Promise<void> {
  await simulateLatency();
  if (!projectId) {
    throw new Error('A project id is required to delete a mapping project');
  }
  MOCK_TEMPLATES_BY_PROJECT.delete(projectId);
}

/**
 * Imports a project from an uploaded JSON export. The real endpoint would
 * answer 409 on a name clash when `overwrite` is false; the screen performs
 * that check against its local list while this is mocked.
 */
export async function importMappingProject(
  request: ImportMappingProjectRequest,
): Promise<MappingProjectApiDto> {
  await simulateLatency();
  const { definition, fileName } = request;
  const name =
    typeof definition.name === 'string' && definition.name.trim() !== ''
      ? definition.name.trim()
      : fileName.replace(/\.json$/i, '');

  const id = `map-${crypto.randomUUID()}`;
  const importedTemplates = Array.isArray(definition.templates)
    ? definition.templates
    : [];
  const now = new Date().toISOString();
  // Each exported template arrives as a draft until its mappings are checked.
  MOCK_TEMPLATES_BY_PROJECT.set(
    id,
    importedTemplates.map((entry: unknown, index) => {
      const fields =
        typeof entry === 'object' && entry !== null
          ? (entry as Record<string, unknown>)
          : {};
      return {
        id: `${id}-tpl-${index + 1}`,
        projectId: id,
        name:
          typeof fields.name === 'string'
            ? fields.name
            : `Template ${index + 1}`,
        description:
          typeof fields.description === 'string' ? fields.description : null,
        inputType: TEMPLATE_INPUT_TYPE.CUSTOM_JSON,
        outputType: TEMPLATE_OUTPUT_TYPE.FHIR_JSON,
        messageType: null,
        messageVersion: null,
        status: MAPPING_TEMPLATE_STATUS.DRAFT,
        fieldCount: 0,
        updatedAt: now,
      };
    }),
  );

  return {
    id,
    name,
    description:
      typeof definition.description === 'string'
        ? definition.description
        : null,
    format: isMappingFormat(definition.format)
      ? definition.format
      : MAPPING_FORMAT.JSON,
    templateCount: importedTemplates.length,
    updatedAt: now,
  };
}

// ── Templates ────────────────────────────────────────────────────

const templateDetails = ({
  name,
  description,
  inputType,
  outputType,
  messageType,
  messageVersion,
}: SaveMappingTemplatePayload): Pick<
  MappingTemplateApiDto,
  | 'name'
  | 'description'
  | 'inputType'
  | 'outputType'
  | 'messageType'
  | 'messageVersion'
> => ({
  name,
  description,
  inputType,
  outputType,
  messageType,
  messageVersion,
});

const templatesOf = (projectId: string): MappingTemplateApiDto[] =>
  MOCK_TEMPLATES_BY_PROJECT.get(projectId) ?? [];

export async function listMappingTemplates(
  projectId: string,
): Promise<MappingTemplateApiDto[]> {
  await simulateLatency();
  return templatesOf(projectId);
}

/** A new template has no field mappings yet, so it starts as a draft. */
export async function createMappingTemplate(
  projectId: string,
  payload: SaveMappingTemplatePayload,
): Promise<MappingTemplateApiDto> {
  await simulateLatency();
  // MOCK: the schema only builds the field tree, so it isn't stored.
  const details = templateDetails(payload);
  const created: MappingTemplateApiDto = {
    ...details,
    id: `tpl-${crypto.randomUUID()}`,
    projectId,
    status: MAPPING_TEMPLATE_STATUS.DRAFT,
    fieldCount: 0,
    updatedAt: new Date().toISOString(),
  };
  MOCK_TEMPLATES_BY_PROJECT.set(projectId, [
    created,
    ...templatesOf(projectId),
  ]);
  return created;
}

export async function updateMappingTemplate(
  projectId: string,
  templateId: string,
  payload: SaveMappingTemplatePayload,
): Promise<MappingTemplateApiDto> {
  await simulateLatency();
  const existing = templatesOf(projectId).find(({ id }) => id === templateId);
  if (!existing) {
    throw new Error(`Unknown mapping template: ${templateId}`);
  }
  // MOCK: the schema only builds the field tree, so it isn't stored.
  const details = templateDetails(payload);
  const updated: MappingTemplateApiDto = {
    ...existing,
    ...details,
    updatedAt: new Date().toISOString(),
  };
  MOCK_TEMPLATES_BY_PROJECT.set(
    projectId,
    templatesOf(projectId).map((template) =>
      template.id === templateId ? updated : template,
    ),
  );
  return updated;
}

export async function deleteMappingTemplate(
  projectId: string,
  templateId: string,
): Promise<void> {
  await simulateLatency();
  MOCK_TEMPLATES_BY_PROJECT.set(
    projectId,
    templatesOf(projectId).filter(({ id }) => id !== templateId),
  );
}

/** Saves a template's field mappings (source sample, target tree, values). */
export async function saveMappingTemplateMappings(
  projectId: string,
  templateId: string,
): Promise<void> {
  await simulateLatency();
  // MOCK: the mappings themselves stay in the editor; only the template's
  // "updated" time moves, so the templates list shows the save.
  const templates = MOCK_TEMPLATES_BY_PROJECT.get(projectId) ?? [];
  MOCK_TEMPLATES_BY_PROJECT.set(
    projectId,
    templates.map((template) =>
      template.id === templateId
        ? { ...template, updatedAt: new Date().toISOString() }
        : template,
    ),
  );
}
