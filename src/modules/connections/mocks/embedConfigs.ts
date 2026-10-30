import type { EmbedConfigApiDto } from '../@types';

const MOCK_AUTH_BASE_URL = 'https://qa.connecthealth.ai/api/workflow/auth';

/**
 * MOCK: this Client ID is already used by another embedded connection, so
 * the demo can show the uniqueness check failing. Any other ID is available.
 */
export const MOCK_TAKEN_EMBED_CLIENT_ID = 'northwind-embed-client';
export const MOCK_TAKEN_EMBED_CLIENT_ID_OWNER = 'Northwind clinic embed';

/**
 * MOCK embedded-launch setup for a connection, served by service/api.ts
 * until the real endpoint exists. The "Epic app" question starts unanswered
 * and the linked system is unset (it binds on the first EHR launch).
 * Delete once getEmbedConfig() calls the API.
 */
export function buildMockEmbedConfig(
  connectionId: string,
  name: string,
): EmbedConfigApiDto {
  return {
    connectionId,
    name,
    ehrSystem: 'Epic',
    launchUrl: `${MOCK_AUTH_BASE_URL}/${connectionId}/launch`,
    callbackUrl: `${MOCK_AUTH_BASE_URL}/${connectionId}/callback`,
    appStatus: null,
    clientId: '',
    clientSecret: '',
    scopes: 'launch openid fhirUser patient/Patient.read',
    linkedSystem: null,
    workflowId: '',
    embeddedAppUrl: '',
  };
}
