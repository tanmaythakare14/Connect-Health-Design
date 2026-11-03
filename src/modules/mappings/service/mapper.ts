import type {
  CatalogMode,
  CreateMappingProjectPayload,
  MappingProject,
  MappingProjectApiDto,
  MappingTemplate,
  MappingTemplateApiDto,
  MappingTemplateFormValues,
  NewMappingProjectFormValues,
  SaveMappingTemplatePayload,
} from '../@types';
import {
  ANY_VERSION,
  CATALOG_MODE,
  TEMPLATE_INPUT_TYPE,
  TEMPLATE_MESSAGE_CATALOGS,
} from '../constants';

export function apiDtoToMappingProject(
  dto: MappingProjectApiDto,
): MappingProject {
  return {
    id: dto.id,
    name: dto.name,
    description: dto.description,
    format: dto.format,
    templateCount: dto.templateCount,
    updatedAt: dto.updatedAt,
  };
}

export function formValuesToCreateMappingProjectPayload(
  values: NewMappingProjectFormValues,
): CreateMappingProjectPayload {
  const description = values.description.trim();
  return {
    name: values.name.trim(),
    description: description === '' ? null : description,
  };
}

export function apiDtoToMappingTemplate(
  dto: MappingTemplateApiDto,
): MappingTemplate {
  return {
    id: dto.id,
    projectId: dto.projectId,
    name: dto.name,
    description: dto.description,
    inputType: dto.inputType,
    outputType: dto.outputType,
    messageType: dto.messageType,
    messageVersion: dto.messageVersion,
    status: dto.status,
    fieldCount: dto.fieldCount,
    updatedAt: dto.updatedAt,
  };
}

export function formValuesToSaveMappingTemplatePayload(
  values: MappingTemplateFormValues,
): SaveMappingTemplatePayload {
  const description = values.description.trim();
  const isCustomJson = values.inputType === TEMPLATE_INPUT_TYPE.CUSTOM_JSON;
  const messageType = values.messageType.trim();
  const messageVersion = values.messageVersion.trim();
  const inputSchema = values.inputSchema.trim();
  // Custom JSON has no message type or version; the others have no schema.
  return {
    name: values.name.trim(),
    description: description === '' ? null : description,
    inputType: values.inputType,
    outputType: values.outputType,
    messageType: isCustomJson || messageType === '' ? null : messageType,
    messageVersion:
      isCustomJson || messageVersion === '' ? null : messageVersion,
    inputSchema: isCustomJson && inputSchema !== '' ? inputSchema : null,
  };
}

/** Saved template → dialog values, for editing. */
export function mappingTemplateToFormValues(
  template: MappingTemplate,
): MappingTemplateFormValues {
  const catalog =
    template.inputType === TEMPLATE_INPUT_TYPE.CUSTOM_JSON
      ? null
      : TEMPLATE_MESSAGE_CATALOGS[template.inputType];
  const messageType = template.messageType ?? '';
  const messageVersion = template.messageVersion ?? ANY_VERSION;
  // Values the catalog doesn't know open in Custom, so they stay editable.
  const modeFor = (value: string, known: string[]): CatalogMode =>
    value === '' || known.includes(value)
      ? CATALOG_MODE.CATALOG
      : CATALOG_MODE.CUSTOM;

  return {
    name: template.name,
    description: template.description ?? '',
    inputType: template.inputType,
    outputType: template.outputType,
    messageTypeMode: modeFor(
      messageType,
      catalog?.types.map((option) => option.value) ?? [],
    ),
    messageType,
    versionMode: modeFor(messageVersion, catalog?.versions ?? []),
    messageVersion,
    inputSchema: '',
  };
}
