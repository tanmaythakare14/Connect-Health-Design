import type { GeneralSettingsApiDto } from '../@types';

/**
 * MOCK general settings, served by service/api.ts until the endpoint exists.
 * Mutable so the diagnostics toggle persists across screen visits.
 */
export const MOCK_GENERAL_SETTINGS: GeneralSettingsApiDto = {
  deploymentId: '24ea5030-585f-4337-af3b-ffde9abcd0f3',
  environment: 'production',
  version: '0.4.0-271026-123',
  usageDiagnosticsEnabled: true,
};
