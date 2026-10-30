import type { StandaloneConfigApiDto } from '../@types';

const MOCK_CALLBACK_BASE_URL = 'https://qa.connecthealth.ai/api/workflow/auth';

/**
 * MOCK standalone-launch setup for a connection, served by service/api.ts
 * until the real endpoint exists. Credentials and endpoints are pre-filled
 * (as in the current console) but the "Epic app" question starts unanswered.
 * Delete once getStandaloneConfig() calls the API.
 */
export function buildMockStandaloneConfig(
  connectionId: string,
  name: string,
): StandaloneConfigApiDto {
  return {
    connectionId,
    name,
    ehrSystem: 'Epic',
    callbackUrl: `${MOCK_CALLBACK_BASE_URL}/${connectionId}/callback`,
    appStatus: null,
    clientId: 'userqa',
    clientSecret: 'qa-secret',
    fhirBaseUrl: 'https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4',
    authorizationUrl:
      'https://fhir.epic.com/interconnect-fhir-oauth/oauth2/authorize',
    tokenUrl: 'https://fhir.epic.com/interconnect-fhir-oauth/oauth2/token',
    scopes: 'openid fhirUser patient/Patient.read offline_access',
  };
}
