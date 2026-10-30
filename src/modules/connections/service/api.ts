import type {
  ApiKeyApiDto,
  BackendConfigApiDto,
  ClientIdCheckResultDto,
  SaveBackendConfigPayload,
  GenerateKeyPairPayload,
  SigningKeyPairApiDto,
  EmbedConfigApiDto,
  OpendentalConfigApiDto,
  SaveEmbedConfigPayload,
  SaveOpendentalConfigPayload,
  SaveUnityConfigPayload,
  UnityConfigApiDto,
  WorkflowOptionDto,
  ConnectionApiDto,
  ConnectionStatus,
  ConnectionTestResultApiDto,
  ConnectionTestStepDto,
  ConnectionUsageApiDto,
  DetectedOAuthEndpointsDto,
  EhrSystemApiDto,
  SaveStandaloneConfigPayload,
  StandaloneConfigApiDto,
} from '../@types';
import { CONNECTION_TEST_STEPS } from '../constants';
import { MOCK_API_KEYS, MOCK_REVOKED_API_KEY_ID } from '../mocks/apiKeys';
import {
  buildMockBackendConfig,
  buildMockSigningKeys,
} from '../mocks/backendConfigs';
import { MOCK_CONNECTION_USAGE, MOCK_CONNECTIONS } from '../mocks/connections';
import { MOCK_EHR_SYSTEMS } from '../mocks/ehrSystems';
import {
  buildMockEmbedConfig,
  MOCK_TAKEN_EMBED_CLIENT_ID,
  MOCK_TAKEN_EMBED_CLIENT_ID_OWNER,
} from '../mocks/embedConfigs';
import { buildMockOpendentalConfig } from '../mocks/opendentalConfigs';
import { buildMockStandaloneConfig } from '../mocks/standaloneConfigs';
import { buildMockUnityConfig } from '../mocks/unityConfigs';
import { MOCK_WORKFLOW_OPTIONS } from '../mocks/workflowOptions';

const MOCK_LATENCY_MS = 400;

const simulateLatency = (): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, MOCK_LATENCY_MS));

// MOCK:API — no connections endpoints exist yet. Replace each body with a fetch to
// `${config.apiUrl}/api/v1/connections...` (see .claude/rules/api.md) and delete the mocks.
export async function listConnections(): Promise<ConnectionApiDto[]> {
  await simulateLatency();
  return MOCK_CONNECTIONS;
}

export async function getConnectionUsage(): Promise<ConnectionUsageApiDto> {
  await simulateLatency();
  return MOCK_CONNECTION_USAGE;
}

export async function listEhrSystems(): Promise<EhrSystemApiDto[]> {
  await simulateLatency();
  return MOCK_EHR_SYSTEMS;
}

/** Activate or deactivate a live connection (PATCH /connections/:id). */
export async function updateConnectionStatus(
  connectionId: string,
  status: ConnectionStatus,
): Promise<void> {
  await simulateLatency();
  if (!connectionId || !status) {
    throw new Error('A connection id and status are required');
  }
}

/** Standalone-launch setup for one connection (GET /connections/:id/standalone). */
export async function getStandaloneConfig(
  connectionId: string,
): Promise<StandaloneConfigApiDto> {
  await simulateLatency();
  const connection = MOCK_CONNECTIONS.find(({ id }) => id === connectionId);
  if (!connection) {
    throw new Error(`Unknown connection: ${connectionId}`);
  }
  return buildMockStandaloneConfig(connection.id, connection.name);
}

/** Save the setup, as a draft or to continue (PUT /connections/:id/standalone). */
export async function saveStandaloneConfig(
  connectionId: string,
  payload: SaveStandaloneConfigPayload,
): Promise<void> {
  await simulateLatency();
  if (!connectionId || !payload.name) {
    throw new Error('A connection id and name are required to save');
  }
}

/**
 * Discover OAuth endpoints from a FHIR base URL (its SMART configuration).
 * MOCK: derives them from Epic's URL pattern; only https URLs succeed.
 */
export async function detectOAuthEndpoints(
  fhirBaseUrl: string,
): Promise<DetectedOAuthEndpointsDto> {
  await simulateLatency();
  const url = new URL(fhirBaseUrl);
  if (url.protocol !== 'https:') {
    throw new Error('FHIR base URL must use https');
  }
  const oauthRoot = fhirBaseUrl.replace(/\/api\/FHIR\/R4\/?$/i, '');
  return {
    authorizationUrl: `${oauthRoot}/oauth2/authorize`,
    tokenUrl: `${oauthRoot}/oauth2/token`,
  };
}

/** Embedded-launch setup for one connection (GET /connections/:id/embed). */
export async function getEmbedConfig(
  connectionId: string,
): Promise<EmbedConfigApiDto> {
  await simulateLatency();
  const connection = MOCK_CONNECTIONS.find(({ id }) => id === connectionId);
  if (!connection) {
    throw new Error(`Unknown connection: ${connectionId}`);
  }
  return buildMockEmbedConfig(connection.id, connection.name);
}

/** Save the embedded setup, as a draft or to continue (PUT /connections/:id/embed). */
export async function saveEmbedConfig(
  connectionId: string,
  payload: SaveEmbedConfigPayload,
): Promise<void> {
  await simulateLatency();
  if (!connectionId || !payload.name) {
    throw new Error('A connection id and name are required to save');
  }
}

/**
 * Whether another embedded connection already uses this Epic Client ID
 * (GET /connections/embed/client-id-availability).
 */
export async function checkEmbedClientId(
  connectionId: string,
  clientId: string,
): Promise<ClientIdCheckResultDto> {
  await simulateLatency();
  if (!connectionId) {
    throw new Error('A connection id is required to check a Client ID');
  }
  return clientId.trim() === MOCK_TAKEN_EMBED_CLIENT_ID
    ? { isAvailable: false, usedBy: MOCK_TAKEN_EMBED_CLIENT_ID_OWNER }
    : { isAvailable: true };
}

/** Open Dental setup for one connection (GET /connections/:id/opendental). */
export async function getOpendentalConfig(
  connectionId: string,
): Promise<OpendentalConfigApiDto> {
  await simulateLatency();
  const connection = MOCK_CONNECTIONS.find(({ id }) => id === connectionId);
  if (!connection) {
    throw new Error(`Unknown connection: ${connectionId}`);
  }
  return buildMockOpendentalConfig(connection.id, connection.name);
}

/**
 * Save the Open Dental setup (PUT /connections/:id/opendental).
 * `isDraft: false` publishes the connection.
 */
export async function saveOpendentalConfig(
  connectionId: string,
  payload: SaveOpendentalConfigPayload,
): Promise<void> {
  await simulateLatency();
  if (!connectionId || !payload.name) {
    throw new Error('A connection id and name are required to save');
  }
}

/** Backend-services setup for one connection (GET /connections/:id/backend). */
export async function getBackendConfig(
  connectionId: string,
): Promise<BackendConfigApiDto> {
  await simulateLatency();
  const connection = MOCK_CONNECTIONS.find(({ id }) => id === connectionId);
  if (!connection) {
    throw new Error(`Unknown connection: ${connectionId}`);
  }
  return buildMockBackendConfig(connection.id, connection.name);
}

/** Save the backend-services setup (PUT /connections/:id/backend). */
export async function saveBackendConfig(
  connectionId: string,
  payload: SaveBackendConfigPayload,
): Promise<void> {
  await simulateLatency();
  if (!connectionId || !payload.name) {
    throw new Error('A connection id and name are required to save');
  }
}

/**
 * Replace the connection's signing key pair (POST /connections/:id/backend/keys).
 * The JWKS URL stays the same; it serves the new public key straight away.
 */
export async function generateSigningKeyPair(
  connectionId: string,
  payload: GenerateKeyPairPayload,
): Promise<SigningKeyPairApiDto> {
  await simulateLatency();
  if (!connectionId) {
    throw new Error('A connection id is required to generate keys');
  }
  return buildMockSigningKeys(payload.keyType, payload.algorithm);
}

/** Unity setup for one connection (GET /connections/:id/unity). */
export async function getUnityConfig(
  connectionId: string,
): Promise<UnityConfigApiDto> {
  await simulateLatency();
  const connection = MOCK_CONNECTIONS.find(({ id }) => id === connectionId);
  if (!connection) {
    throw new Error(`Unknown connection: ${connectionId}`);
  }
  return buildMockUnityConfig(connection.id, connection.name);
}

/**
 * Save the Unity setup (PUT /connections/:id/unity).
 * `isDraft: false` publishes the connection.
 */
export async function saveUnityConfig(
  connectionId: string,
  payload: SaveUnityConfigPayload,
): Promise<void> {
  await simulateLatency();
  if (!connectionId || !payload.name) {
    throw new Error('A connection id and name are required to save');
  }
}

/** Workflows an embedded connection can run (GET /workflows, minimal fields). */
export async function listWorkflowOptions(): Promise<WorkflowOptionDto[]> {
  await simulateLatency();
  return MOCK_WORKFLOW_OPTIONS;
}

/** API keys that can authenticate a connection test (GET /api-keys). */
export async function listApiKeys(): Promise<ApiKeyApiDto[]> {
  await simulateLatency();
  return MOCK_API_KEYS;
}

const MOCK_TEST_DURATION_MS = 1600;

/**
 * Runs the connection test (POST /connections/:id/test): connectivity,
 * JWT-assertion authentication, then OAuth/FHIR configuration checks.
 * A failed step stops the run; later steps come back 'pending'.
 */
export async function runConnectionTest(
  connectionId: string,
  apiKeyId: string,
): Promise<ConnectionTestResultApiDto> {
  await new Promise((resolve) => setTimeout(resolve, MOCK_TEST_DURATION_MS));
  if (!connectionId || !apiKeyId) {
    throw new Error('A connection id and API key are required to run a test');
  }

  const [connectionStep, authStep, configStep] = CONNECTION_TEST_STEPS;
  const isRevoked = apiKeyId === MOCK_REVOKED_API_KEY_ID;

  const connectionResult: ConnectionTestStepDto = {
    ...connectionStep,
    status: 'passed',
    details: [
      { label: 'Status', value: 'Connected' },
      { label: 'Integration type', value: 'Backend service' },
    ],
  };

  if (isRevoked) {
    return {
      outcome: 'failed',
      durationMs: 412,
      testedAt: new Date().toISOString(),
      steps: [
        connectionResult,
        {
          ...authStep,
          status: 'failed',
          error: {
            message: 'Request failed with status code 500',
            response: JSON.stringify(
              {
                success: false,
                error: 'Client Assertion invalid',
                timestamp: Date.now(),
              },
              null,
              2,
            ),
          },
        },
        { ...configStep, status: 'pending' },
      ],
    };
  }

  return {
    outcome: 'passed',
    durationMs: 842,
    testedAt: new Date().toISOString(),
    steps: [
      connectionResult,
      {
        ...authStep,
        status: 'passed',
        details: [
          { label: 'Token type', value: 'Bearer' },
          { label: 'Expires in', value: '300 seconds' },
        ],
      },
      {
        ...configStep,
        status: 'passed',
        details: [
          { label: 'OAuth endpoints', value: 'Reachable' },
          { label: 'FHIR version', value: 'R4' },
          { label: 'Scopes granted', value: 'system/*.read' },
        ],
      },
    ],
  };
}
