import type {
  ApiKey,
  ApiKeyApiDto,
  BackendConfig,
  BackendConfigApiDto,
  BackendSetupFormValues,
  SaveBackendConfigPayload,
  SigningKeyPair,
  SigningKeyPairApiDto,
  EmbedConfig,
  EmbedConfigApiDto,
  EmbedSetupFormValues,
  OpendentalConfig,
  OpendentalConfigApiDto,
  OpendentalSetupFormValues,
  SaveEmbedConfigPayload,
  SaveOpendentalConfigPayload,
  SaveUnityConfigPayload,
  UnityConfig,
  UnityConfigApiDto,
  UnitySetupFormValues,
  WorkflowOption,
  WorkflowOptionDto,
  Connection,
  ConnectionApiDto,
  ConnectionTestResult,
  ConnectionTestResultApiDto,
  SaveStandaloneConfigPayload,
  StandaloneConfig,
  StandaloneConfigApiDto,
  StandaloneSetupFormValues,
  ConnectionUsage,
  ConnectionUsageApiDto,
  EhrSystem,
  EhrSystemApiDto,
} from '../@types';
import { EHR_AVAILABILITY } from '../constants';

export function apiDtoToEhrSystem(dto: EhrSystemApiDto): EhrSystem {
  return {
    id: dto.id,
    name: dto.name,
    description: dto.description,
    monogram: dto.monogram,
    capabilities: dto.capabilities,
    isAvailable: dto.availability === EHR_AVAILABILITY.AVAILABLE,
  };
}

export function apiDtoToConnection(dto: ConnectionApiDto): Connection {
  return {
    id: dto.id,
    source: dto.source,
    name: dto.name,
    type: dto.type,
    status: dto.status,
  };
}

export function apiDtoToConnectionUsage(
  dto: ConnectionUsageApiDto,
): ConnectionUsage {
  return {
    used: dto.used,
    limit: dto.limit,
  };
}

export function apiDtoToStandaloneConfig(
  dto: StandaloneConfigApiDto,
): StandaloneConfig {
  return { ...dto };
}

export function standaloneFormToPayload(
  values: StandaloneSetupFormValues,
  isDraft: boolean,
): SaveStandaloneConfigPayload {
  return {
    name: values.name.trim(),
    appStatus: values.appStatus,
    clientId: values.clientId.trim(),
    clientSecret: values.clientSecret,
    fhirBaseUrl: values.fhirBaseUrl.trim(),
    authorizationUrl: values.authorizationUrl.trim(),
    tokenUrl: values.tokenUrl.trim(),
    // Normalise whitespace so the scope list is always single-spaced
    scopes: values.scopes.trim().split(/\s+/).filter(Boolean).join(' '),
    isDraft,
  };
}

export function apiDtoToEmbedConfig(dto: EmbedConfigApiDto): EmbedConfig {
  return { ...dto };
}

export function embedFormToPayload(
  values: EmbedSetupFormValues,
  isDraft: boolean,
): SaveEmbedConfigPayload {
  return {
    name: values.name.trim(),
    appStatus: values.appStatus,
    clientId: values.clientId.trim(),
    clientSecret: values.clientSecret,
    scopes: values.scopes.trim().split(/\s+/).filter(Boolean).join(' '),
    workflowId: values.workflowId,
    embeddedAppUrl: values.embeddedAppUrl.trim(),
    isDraft,
  };
}

export function apiDtoToOpendentalConfig(
  dto: OpendentalConfigApiDto,
): OpendentalConfig {
  return { ...dto };
}

export function opendentalFormToPayload(
  values: OpendentalSetupFormValues,
  isDraft: boolean,
): SaveOpendentalConfigPayload {
  return {
    name: values.name.trim(),
    keysStatus: values.keysStatus,
    developerKey: values.developerKey.trim(),
    customerKey: values.customerKey.trim(),
    isDraft,
  };
}

export function apiDtoToBackendConfig(dto: BackendConfigApiDto): BackendConfig {
  return { ...dto, signingKeys: apiDtoToSigningKeyPair(dto.signingKeys) };
}

export function apiDtoToSigningKeyPair(
  dto: SigningKeyPairApiDto,
): SigningKeyPair {
  return { ...dto };
}

export function backendFormToPayload(
  values: BackendSetupFormValues,
  isDraft: boolean,
): SaveBackendConfigPayload {
  return {
    name: values.name.trim(),
    appStatus: values.appStatus,
    isDraft,
  };
}

export function apiDtoToUnityConfig(dto: UnityConfigApiDto): UnityConfig {
  return { ...dto };
}

export function unityFormToPayload(
  values: UnitySetupFormValues,
  isDraft: boolean,
): SaveUnityConfigPayload {
  return {
    name: values.name.trim(),
    credentialsStatus: values.credentialsStatus,
    endpointUrl: values.endpointUrl.trim(),
    appName: values.appName.trim(),
    serviceUsername: values.serviceUsername.trim(),
    servicePassword: values.servicePassword,
    ehrUsername: values.ehrUsername.trim(),
    ehrPassword: values.ehrPassword,
    ubiquityId: values.ubiquityId.trim(),
    isDraft,
  };
}

export function apiDtoToWorkflowOption(dto: WorkflowOptionDto): WorkflowOption {
  return {
    id: dto.id,
    name: dto.name,
  };
}

export function apiDtoToApiKey(dto: ApiKeyApiDto): ApiKey {
  return {
    id: dto.id,
    name: dto.name,
  };
}

/** Adds the key's display name so the result panel can say what was tested. */
export function apiDtoToConnectionTestResult(
  dto: ConnectionTestResultApiDto,
  apiKeyName: string,
): ConnectionTestResult {
  return {
    outcome: dto.outcome,
    durationMs: dto.durationMs,
    testedAt: dto.testedAt,
    steps: dto.steps.map((step) => ({ ...step })),
    apiKeyName,
  };
}
