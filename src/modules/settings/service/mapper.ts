import type {
  AddUserFormValues,
  AdminUser,
  AdminUserApiDto,
  ApiKey,
  ApiKeyApiDto,
  ConnectionUsage,
  ConnectionUsageApiDto,
  CreateAdminUserPayload,
  CreateApiKeyFormValues,
  CreateApiKeyPayload,
  GeneralSettings,
  GeneralSettingsApiDto,
  HelixAiSettings,
  HelixAiSettingsApiDto,
  LlmConfig,
  LlmConfigApiDto,
  LlmConfigFormValues,
  ResetUserPasswordFormValues,
  ResetUserPasswordPayload,
  SaveLlmConfigPayload,
  Subscription,
  SubscriptionApiDto,
  TwoFactorSettings,
  TwoFactorSettingsApiDto,
} from '../@types';
import { getLlmProviderOption } from '../utils';

export function apiDtoToGeneralSettings(
  dto: GeneralSettingsApiDto,
): GeneralSettings {
  return {
    deploymentId: dto.deploymentId,
    environment: dto.environment,
    version: dto.version,
    usageDiagnosticsEnabled: dto.usageDiagnosticsEnabled,
  };
}

export function apiDtoToApiKey(dto: ApiKeyApiDto): ApiKey {
  return {
    id: dto.id,
    name: dto.name,
    key: dto.key,
    isActive: dto.isActive,
    createdAt: dto.createdAt,
  };
}

export function formValuesToCreateApiKeyPayload(
  values: CreateApiKeyFormValues,
): CreateApiKeyPayload {
  return { name: values.name.trim() };
}

export function apiDtoToSubscription(dto: SubscriptionApiDto): Subscription {
  const { plan, sources, details } = dto;
  return {
    planName: plan.name,
    integrationsLimit: plan.integrationsLimit,
    integrationsUsed: plan.integrationsUsed,
    integrationsRemaining: Math.max(
      0,
      plan.integrationsLimit - plan.integrationsUsed,
    ),
    expiresAt: plan.expiresAt,
    sources: sources.map((source) => ({
      id: source.id,
      type: source.type,
      name: source.name,
      connections: source.connections,
      inUse: source.inUse,
      isActive: source.isActive,
    })),
    customerId: details.customerId,
    awsAccountId: details.awsAccountId,
    productCode: details.productCode,
    setupFeePaid: details.setupFeePaid,
    isActive: details.isActive,
  };
}

export function apiDtoToConnectionUsage(
  dto: ConnectionUsageApiDto,
): ConnectionUsage {
  return {
    usedSlots: dto.usedSlots,
    planSlots: dto.planSlots,
    remainingSlots: Math.max(0, dto.planSlots - dto.usedSlots),
    activeConnections: dto.activeConnections,
    totalConnections: dto.totalConnections,
    slots: dto.slots.map((slot) => ({
      id: slot.id,
      ehr: slot.ehr,
      organization: slot.organization,
      source: slot.source,
      connections: slot.connections.map((item) => ({ ...item })),
    })),
  };
}

export function apiDtoToLlmConfig(dto: LlmConfigApiDto): LlmConfig {
  return {
    provider: dto.provider,
    modelName: dto.modelName,
    values: { ...dto.values },
    secretHints: { ...dto.secretHints },
    updatedAt: dto.updatedAt,
  };
}

export function apiDtoToHelixAiSettings(
  dto: HelixAiSettingsApiDto,
): HelixAiSettings {
  return { isEnabled: dto.enabled, llm: apiDtoToLlmConfig(dto.llm) };
}

/**
 * Only the chosen provider's fields are sent. Blank secrets are left out,
 * which tells the API to keep the stored ones.
 */
export function llmFormValuesToPayload(
  values: LlmConfigFormValues,
): SaveLlmConfigPayload {
  const payload: SaveLlmConfigPayload = {
    provider: values.provider,
    modelName: values.modelName.trim(),
    values: {},
    secrets: {},
  };
  for (const field of getLlmProviderOption(values.provider).fields) {
    const value = values.credentials[field.key].trim();
    if (field.kind === 'text') {
      payload.values[field.key] = value;
    } else if (value) {
      payload.secrets[field.key] = value;
    }
  }
  return payload;
}

export function apiDtoToTwoFactorSettings(
  dto: TwoFactorSettingsApiDto,
): TwoFactorSettings {
  return { isEnrolled: dto.isEnrolled, requireOnLogin: dto.requireOnLogin };
}

export function apiDtoToAdminUser(dto: AdminUserApiDto): AdminUser {
  return {
    id: dto.id,
    name: dto.name,
    username: dto.username,
    email: dto.email,
    role: dto.role,
    mustResetPassword: dto.mustResetPassword,
    twoFactorEnabled: dto.twoFactorEnabled,
    isBuiltIn: dto.isBuiltIn,
  };
}

/** Blank optional fields are sent as null. */
export function formValuesToCreateAdminUserPayload(
  values: AddUserFormValues,
): CreateAdminUserPayload {
  const name = values.name.trim();
  const email = values.email.trim();
  return {
    name: name || null,
    username: values.username.trim(),
    email: email || null,
    password: values.password,
    mustResetPassword: values.mustResetPassword,
  };
}

export function formValuesToResetUserPasswordPayload(
  values: ResetUserPasswordFormValues,
): ResetUserPasswordPayload {
  return {
    password: values.password,
    mustResetPassword: values.mustResetPassword,
  };
}
