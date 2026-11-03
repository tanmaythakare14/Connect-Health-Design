import type {
  AdminUserApiDto,
  ApiKeyApiDto,
  ChangePasswordPayload,
  ConnectionUsageApiDto,
  CreateAdminUserPayload,
  CreateApiKeyPayload,
  GeneralSettingsApiDto,
  HelixAiSettingsApiDto,
  LlmConfigApiDto,
  ResetUserPasswordPayload,
  SaveLlmConfigPayload,
  SubscriptionApiDto,
  TwoFactorSettingsApiDto,
} from '../@types';
import { USER_ROLE } from '../constants';
import { buildMockKeySecret, MOCK_API_KEYS } from '../mocks/apiKeys';
import { MOCK_CONNECTION_USAGE } from '../mocks/connectionUsage';
import { MOCK_GENERAL_SETTINGS } from '../mocks/generalSettings';
import { applyMockLlmSave, MOCK_HELIX_AI_SETTINGS } from '../mocks/helixAi';
import { MOCK_SUBSCRIPTION } from '../mocks/subscription';
import {
  MOCK_ADMIN_USERS,
  MOCK_CURRENT_PASSWORD,
  MOCK_TWO_FACTOR_SETTINGS,
} from '../mocks/users';

const MOCK_LATENCY_MS = 400;

const simulateLatency = (): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, MOCK_LATENCY_MS));

// MOCK:API — no settings endpoints exist yet. Replace each body with a fetch
// to `${config.apiUrl}/api/v1/...` (see .claude/rules/api.md) and delete the mocks.

/** Deployment details and workspace preferences (GET /settings/general). */
export async function getGeneralSettings(): Promise<GeneralSettingsApiDto> {
  await simulateLatency();
  return { ...MOCK_GENERAL_SETTINGS };
}

/** Turn anonymous usage diagnostics on or off (PATCH /settings/general). */
export async function updateUsageDiagnostics(
  enabled: boolean,
): Promise<GeneralSettingsApiDto> {
  await simulateLatency();
  MOCK_GENERAL_SETTINGS.usageDiagnosticsEnabled = enabled;
  return { ...MOCK_GENERAL_SETTINGS };
}

/** Every API key in the workspace (GET /settings/api-keys). */
export async function listApiKeys(): Promise<ApiKeyApiDto[]> {
  await simulateLatency();
  return MOCK_API_KEYS.map((apiKey) => ({ ...apiKey }));
}

/** Create a key; the response holds its secret (POST /settings/api-keys). */
export async function createApiKey(
  payload: CreateApiKeyPayload,
): Promise<ApiKeyApiDto> {
  await simulateLatency();
  const created: ApiKeyApiDto = {
    id: `key-${Date.now()}`,
    name: payload.name,
    key: buildMockKeySecret(Date.now() % 100000),
    isActive: true,
    createdAt: new Date().toISOString(),
  };
  MOCK_API_KEYS.push(created);
  return { ...created };
}

/** Turn a key on or off (PATCH /settings/api-keys/:id). */
export async function updateApiKeyStatus(
  id: string,
  isActive: boolean,
): Promise<void> {
  await simulateLatency();
  const apiKey = MOCK_API_KEYS.find((item) => item.id === id);
  if (!apiKey) {
    throw new Error(`Unknown API key: ${id}`);
  }
  apiKey.isActive = isActive;
}

/** Permanently delete a key (DELETE /settings/api-keys/:id). */
export async function deleteApiKey(id: string): Promise<void> {
  await simulateLatency();
  const index = MOCK_API_KEYS.findIndex((item) => item.id === id);
  if (index === -1) {
    throw new Error(`Unknown API key: ${id}`);
  }
  MOCK_API_KEYS.splice(index, 1);
}

/** Plan, license sources and marketplace details (GET /settings/subscription). */
export async function getSubscription(): Promise<SubscriptionApiDto> {
  await simulateLatency();
  return {
    plan: { ...MOCK_SUBSCRIPTION.plan },
    sources: MOCK_SUBSCRIPTION.sources.map((source) => ({ ...source })),
    details: { ...MOCK_SUBSCRIPTION.details },
  };
}

/** How the plan's connection slots are used (GET /settings/subscription/usage). */
export async function getConnectionUsage(): Promise<ConnectionUsageApiDto> {
  await simulateLatency();
  return {
    ...MOCK_CONNECTION_USAGE,
    slots: MOCK_CONNECTION_USAGE.slots.map((slot) => ({
      ...slot,
      connections: slot.connections.map((item) => ({ ...item })),
    })),
  };
}

const cloneLlmConfig = (llm: LlmConfigApiDto): LlmConfigApiDto => ({
  ...llm,
  values: { ...llm.values },
  secretHints: { ...llm.secretHints },
});

/** Helix on/off and its LLM provider; secrets come back as hints (GET /settings/helix). */
export async function getHelixAiSettings(): Promise<HelixAiSettingsApiDto> {
  await simulateLatency();
  return {
    enabled: MOCK_HELIX_AI_SETTINGS.enabled,
    llm: cloneLlmConfig(MOCK_HELIX_AI_SETTINGS.llm),
  };
}

/** Turn Helix on or off (PATCH /settings/helix). */
export async function updateHelixEnabled(enabled: boolean): Promise<void> {
  await simulateLatency();
  MOCK_HELIX_AI_SETTINGS.enabled = enabled;
}

/** Save the LLM provider; omitted secrets are kept (PUT /settings/helix/llm). */
export async function saveLlmProviderConfig(
  payload: SaveLlmConfigPayload,
): Promise<LlmConfigApiDto> {
  await simulateLatency();
  applyMockLlmSave(payload);
  return cloneLlmConfig(MOCK_HELIX_AI_SETTINGS.llm);
}

/** The signed-in user's two-factor setup (GET /settings/users/me/2fa). */
export async function getTwoFactorSettings(): Promise<TwoFactorSettingsApiDto> {
  await simulateLatency();
  return { ...MOCK_TWO_FACTOR_SETTINGS };
}

/** Ask for a 2FA code at every sign-in, or not (PATCH /settings/users/me/2fa). */
export async function updateRequireTwoFactor(required: boolean): Promise<void> {
  await simulateLatency();
  MOCK_TWO_FACTOR_SETTINGS.requireOnLogin = required;
}

/**
 * Start setting up a new authenticator app; the current one keeps working
 * until the new one is verified (POST /settings/users/me/2fa/reset).
 */
export async function resetTwoFactor(): Promise<void> {
  await simulateLatency();
}

/** Every console user (GET /settings/users). */
export async function listAdminUsers(): Promise<AdminUserApiDto[]> {
  await simulateLatency();
  return MOCK_ADMIN_USERS.map((user) => ({ ...user }));
}

/** Add a console user with a temporary password (POST /settings/users). */
export async function createAdminUser(
  payload: CreateAdminUserPayload,
): Promise<AdminUserApiDto> {
  await simulateLatency();
  if (MOCK_ADMIN_USERS.some((user) => user.username === payload.username)) {
    throw new Error(`Username taken: ${payload.username}`);
  }
  const created: AdminUserApiDto = {
    id: `user-${Date.now()}`,
    name: payload.name,
    username: payload.username,
    email: payload.email,
    role: USER_ROLE.ADMIN,
    mustResetPassword: payload.mustResetPassword,
    twoFactorEnabled: false,
    isBuiltIn: false,
  };
  MOCK_ADMIN_USERS.push(created);
  return { ...created };
}

/** Give a user a new temporary password (POST /settings/users/:id/password). */
export async function resetAdminUserPassword(
  id: string,
  payload: ResetUserPasswordPayload,
): Promise<AdminUserApiDto> {
  await simulateLatency();
  const user = MOCK_ADMIN_USERS.find((item) => item.id === id);
  if (!user) {
    throw new Error(`Unknown user: ${id}`);
  }
  user.mustResetPassword = payload.mustResetPassword;
  return { ...user };
}

/** Remove a user's console access (DELETE /settings/users/:id). */
export async function deleteAdminUser(id: string): Promise<void> {
  await simulateLatency();
  const index = MOCK_ADMIN_USERS.findIndex((item) => item.id === id);
  if (index === -1 || MOCK_ADMIN_USERS[index].isBuiltIn) {
    throw new Error(`Can't delete user: ${id}`);
  }
  MOCK_ADMIN_USERS.splice(index, 1);
}

/** The current password didn't match; the form shows it on that field. */
export class IncorrectCurrentPasswordError extends Error {
  constructor() {
    super('Current password is incorrect');
    this.name = 'IncorrectCurrentPasswordError';
  }
}

/** Change the signed-in user's password (POST /settings/account/password). */
export async function changePassword(
  payload: ChangePasswordPayload,
): Promise<void> {
  await simulateLatency();
  if (payload.currentPassword !== MOCK_CURRENT_PASSWORD) {
    throw new IncorrectCurrentPasswordError();
  }
}
