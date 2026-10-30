import type { OpendentalConfigApiDto } from '../@types';

/** Open Dental's Remote API endpoint — the same for every connection. */
export const OPENDENTAL_API_BASE_URL = 'https://api.opendental.com/api/v1';

/**
 * MOCK Open Dental setup for a connection, served by service/api.ts until
 * the real endpoint exists. The keys question starts unanswered.
 * Delete once getOpendentalConfig() calls the API.
 */
export function buildMockOpendentalConfig(
  connectionId: string,
  name: string,
): OpendentalConfigApiDto {
  return {
    connectionId,
    name,
    ehrSystem: 'Open Dental',
    keysStatus: null,
    developerKey: '',
    customerKey: '',
    apiBaseUrl: OPENDENTAL_API_BASE_URL,
  };
}
