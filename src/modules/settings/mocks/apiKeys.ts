import type { ApiKeyApiDto } from '../@types';

/** A 32-character hex secret, deterministic so the mock list stays stable. */
export function buildMockKeySecret(seed: number): string {
  return Array.from({ length: 4 }, (_, index) =>
    ((seed * 2654435761 + index * 40503) >>> 0).toString(16).padStart(8, '0'),
  ).join('');
}

const MOCK_KEYS: Array<[name: string, isActive: boolean, createdAt: string]> = [
  ['test', true, '2026-02-20T15:26:00'],
  ['toggle-auth-1787828384343', true, '2026-08-27T16:29:00'],
  ['delete-auth-1787828392091', true, '2026-08-27T16:29:00'],
  ['COH484 QA Test Key', true, '2026-09-09T15:34:00'],
  ['automation-test-1789541634755', true, '2026-09-16T12:23:00'],
  ['toggle-test-1789541652228', false, '2026-09-16T12:24:00'],
  ['authcheck-1790662096885', false, '2026-09-29T11:38:00'],
  ['toggle-auth-1790662105723', true, '2026-09-29T11:38:00'],
  ['toggle-auth-1790663491493', true, '2026-09-29T12:01:00'],
  ['automation-test-1791191579846', true, '2026-10-05T14:43:00'],
  ['QA_COH744 MCP (delete after)', false, '2026-10-20T16:29:00'],
  ['qa-coh803-test-key', false, '2026-10-28T14:21:00'],
  ['qa_coh800_apikey_test', false, '2026-10-30T14:56:00'],
  ['qa_coh800_apikey_test2', true, '2026-10-30T14:56:00'],
];

/**
 * MOCK API keys, oldest first like the current console. Mutable: create,
 * status changes and deletes persist while the app is open.
 */
export const MOCK_API_KEYS: ApiKeyApiDto[] = MOCK_KEYS.map(
  ([name, isActive, createdAt], index) => ({
    id: `key-${index + 1}`,
    name,
    key: buildMockKeySecret(index + 1),
    isActive,
    createdAt: new Date(createdAt).toISOString(),
  }),
);
