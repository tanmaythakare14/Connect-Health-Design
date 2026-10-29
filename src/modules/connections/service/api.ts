import type {
  ConnectionApiDto,
  ConnectionUsageApiDto,
  EhrSystemApiDto,
} from '../@types';
import { MOCK_CONNECTION_USAGE, MOCK_CONNECTIONS } from '../mocks/connections';
import { MOCK_EHR_SYSTEMS } from '../mocks/ehrSystems';

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
