import type {
  HelixAiSettingsApiDto,
  LlmCredentialKey,
  SaveLlmConfigPayload,
} from '../@types';
import { LLM_PROVIDER } from '../constants';

/** Key IDs keep a recognisable hint; true secrets come back fully hidden. */
const HINTED_SECRET_KEYS: LlmCredentialKey[] = ['accessKeyId'];

const maskHint = (value: string): string =>
  value.length > 7 ? `${value.slice(0, 4)}••••${value.slice(-3)}` : '••••';

/**
 * MOCK Helix AI settings. Mutable so the toggle and saved provider config
 * persist while the app is open. Delete once the settings API exists.
 */
export const MOCK_HELIX_AI_SETTINGS: HelixAiSettingsApiDto = {
  enabled: true,
  llm: {
    provider: LLM_PROVIDER.BEDROCK,
    modelName: 'global.anthropic.claude-sonnet-4-5-20250929-v1:0',
    values: { region: 'us-east-1' },
    secretHints: { accessKeyId: 'AKIA••••602', secretAccessKey: null },
    updatedAt: '2026-10-28T09:42:00.000Z',
  },
};

/**
 * Applies a save like the API would: plain values replace, typed secrets
 * replace (stored as hints only), blank secrets keep the stored ones —
 * unless the provider changed, in which case old secrets no longer apply.
 */
export function applyMockLlmSave(payload: SaveLlmConfigPayload): void {
  const current = MOCK_HELIX_AI_SETTINGS.llm;
  const keptHints =
    payload.provider === current.provider ? { ...current.secretHints } : {};

  for (const [key, value] of Object.entries(payload.secrets)) {
    if (value) {
      keptHints[key as LlmCredentialKey] = HINTED_SECRET_KEYS.includes(
        key as LlmCredentialKey,
      )
        ? maskHint(value)
        : null;
    }
  }

  MOCK_HELIX_AI_SETTINGS.llm = {
    provider: payload.provider,
    modelName: payload.modelName,
    values: { ...payload.values },
    secretHints: keptHints,
    updatedAt: new Date().toISOString(),
  };
}
