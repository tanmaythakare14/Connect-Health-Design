import type { ApiKeyApiDto } from '../@types';

/**
 * MOCK API keys for the Test connection screen's key picker, served by
 * service/api.ts until the real endpoint exists. Delete once listApiKeys()
 * calls the API.
 */
export const MOCK_API_KEYS: ApiKeyApiDto[] = [
  { id: 'key-test', name: 'test' },
  { id: 'key-toggle-1787828384343', name: 'toggle-auth-1787828384343' },
  { id: 'key-delete-1787828392091', name: 'delete-auth-1787828392091' },
  { id: 'key-coh484-qa', name: 'COH484 QA Test Key' },
  {
    id: 'key-automation-1789541634755',
    name: 'automation-test-1789541634755',
  },
  { id: 'key-toggle-1790662105723', name: 'toggle-auth-1790662105723' },
  { id: 'key-toggle-1790663491493', name: 'toggle-auth-1790663491493' },
  {
    id: 'key-automation-1791191579846',
    name: 'automation-test-1791191579846',
  },
];

/**
 * MOCK: this key behaves as revoked, so the demo can show a failed test.
 * Every other key passes.
 */
export const MOCK_REVOKED_API_KEY_ID = 'key-delete-1787828392091';
