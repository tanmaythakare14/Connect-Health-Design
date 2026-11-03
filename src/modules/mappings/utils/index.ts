import type {
  MappingFormat,
  MappingTemplate,
  MappingTemplateSort,
  MappingProject,
  MappingProjectDefinition,
  MappingProjectSort,
} from '../@types';
import {
  MAPPING_FORMAT,
  MAPPING_PROJECT_SORT,
  TEMPLATE_INPUT_TYPE,
  MAPPING_TEMPLATE_SORT,
} from '../constants';

/** Case-insensitive match on the project's name or description. */
export function filterMappingProjects(
  projects: MappingProject[],
  search: string,
): MappingProject[] {
  const query = search.trim().toLowerCase();
  if (!query) {
    return projects;
  }
  return projects.filter((project) =>
    [project.name, project.description ?? ''].some((value) =>
      value.toLowerCase().includes(query),
    ),
  );
}

/** A sorted copy; ties fall back to the name so the order is stable. */
export function sortMappingProjects(
  projects: MappingProject[],
  sort: MappingProjectSort,
): MappingProject[] {
  const byName = (a: MappingProject, b: MappingProject): number =>
    a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });

  return [...projects].sort((a, b) => {
    switch (sort) {
      case MAPPING_PROJECT_SORT.NAME:
        return byName(a, b);
      case MAPPING_PROJECT_SORT.MOST_TEMPLATES:
        return b.templateCount - a.templateCount || byName(a, b);
      default:
        return b.updatedAt.localeCompare(a.updatedAt) || byName(a, b);
    }
  });
}

export function isMappingFormat(value: unknown): value is MappingFormat {
  return Object.values<unknown>(MAPPING_FORMAT).includes(value);
}

/** Parses an uploaded export; null unless it's valid JSON describing an object. */
export function parseMappingProjectDefinition(
  text: string,
): MappingProjectDefinition | null {
  try {
    const parsed: unknown = JSON.parse(text);
    return typeof parsed === 'object' &&
      parsed !== null &&
      !Array.isArray(parsed)
      ? (parsed as MappingProjectDefinition)
      : null;
  } catch {
    return null;
  }
}

/** Case-insensitive name lookup, used for the "overwrite" check on import. */
export function findMappingProjectByName(
  projects: MappingProject[],
  name: string,
): MappingProject | undefined {
  const target = name.trim().toLowerCase();
  return projects.find(
    (project) => project.name.trim().toLowerCase() === target,
  );
}

/** Case-insensitive match on a template's name, description or message type. */
export function filterMappingTemplates(
  templates: MappingTemplate[],
  search: string,
): MappingTemplate[] {
  const query = search.trim().toLowerCase();
  if (!query) {
    return templates;
  }
  return templates.filter((template) =>
    [
      template.name,
      template.description ?? '',
      template.messageType ?? '',
      template.messageVersion ?? '',
    ].some((value) => value.toLowerCase().includes(query)),
  );
}

/** A sorted copy; ties fall back to the name so the order is stable. */
export function sortMappingTemplates(
  templates: MappingTemplate[],
  sort: MappingTemplateSort,
): MappingTemplate[] {
  const byName = (a: MappingTemplate, b: MappingTemplate): number =>
    a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });

  return [...templates].sort((a, b) => {
    switch (sort) {
      case MAPPING_TEMPLATE_SORT.NAME:
        return byName(a, b);
      case MAPPING_TEMPLATE_SORT.MOST_FIELDS:
        return b.fieldCount - a.fieldCount || byName(a, b);
      default:
        return b.updatedAt.localeCompare(a.updatedAt) || byName(a, b);
    }
  });
}

/**
 * A project's badge follows its newest template's input type (Custom JSON
 * shows as JSON). Null with no templates.
 */
export function deriveProjectFormat(
  templates: MappingTemplate[],
): MappingFormat | null {
  const newest = sortMappingTemplates(
    templates,
    MAPPING_TEMPLATE_SORT.RECENTLY_UPDATED,
  )[0];
  if (!newest) {
    return null;
  }
  return newest.inputType === TEMPLATE_INPUT_TYPE.CUSTOM_JSON
    ? 'json'
    : newest.inputType;
}
