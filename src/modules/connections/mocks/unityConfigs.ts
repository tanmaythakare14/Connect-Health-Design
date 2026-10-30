import type { UnityConfigApiDto } from '../@types';

/**
 * MOCK Unity (Allscripts / Veradigm) setup for a connection, served by
 * service/api.ts until the real endpoint exists. The service credentials
 * are pre-filled (as in the current console); the credentials question
 * starts unanswered. Delete once getUnityConfig() calls the API.
 */
export function buildMockUnityConfig(
  connectionId: string,
  name: string,
): UnityConfigApiDto {
  return {
    connectionId,
    name,
    ehrSystem: 'Allscripts (Veradigm)',
    credentialsStatus: null,
    endpointUrl: '',
    appName: '',
    serviceUsername: 'ch-design',
    servicePassword: 'qa-service-pass',
    ehrUsername: '',
    ehrPassword: '',
    ubiquityId: '',
  };
}
