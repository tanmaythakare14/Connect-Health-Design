import type {
  AdminUser,
  LlmConfig,
  LlmCredentialKey,
  LlmProvider,
  LlmProviderOption,
  SettingsSectionConfig,
  SettingsSectionId,
  UsageFilter,
  UsageSlot,
} from '../@types';
import {
  API_KEY_MASK_PREFIX_LENGTH,
  API_KEY_MASK_SUFFIX_LENGTH,
  LLM_PROVIDER_OPTIONS,
  SETTINGS_SECTIONS,
  USAGE_FILTER,
  USAGE_FILTER_OPTIONS,
} from '../constants';

/** A section's menu entry and heading; every id has one. */
export function getSettingsSection(
  id: SettingsSectionId,
): SettingsSectionConfig {
  return (
    SETTINGS_SECTIONS.find((section) => section.id === id) ??
    SETTINGS_SECTIONS[0]
  );
}

/** "0deb8a2d…6556" — enough to recognise a key without exposing it. */
export function maskApiKey(key: string): string {
  if (key.length <= API_KEY_MASK_PREFIX_LENGTH + API_KEY_MASK_SUFFIX_LENGTH) {
    return key;
  }
  return `${key.slice(0, API_KEY_MASK_PREFIX_LENGTH)}…${key.slice(-API_KEY_MASK_SUFFIX_LENGTH)}`;
}

const createdAtFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
});

/** "Feb 20, 2026, 15:26" */
export function formatCreatedAt(iso: string): string {
  return createdAtFormatter.format(new Date(iso));
}

const DAY_MS = 24 * 60 * 60 * 1000;

const expiryFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
});

/** "Feb 17, 2027" */
export function formatExpiryDate(iso: string): string {
  return expiryFormatter.format(new Date(iso));
}

/** Whole days from now until the date; 0 once it has passed. */
export function daysUntil(iso: string, now = Date.now()): number {
  return Math.max(0, Math.ceil((new Date(iso).getTime() - now) / DAY_MS));
}

/** used / limit, clamped to 0–1 (0 when there's no limit). */
export function usageRatio(used: number, limit: number): number {
  return limit > 0 ? Math.min(1, used / limit) : 0;
}

/** "Epic — fhir.epic.com" or "Stedi — pending configuration". */
export function formatSlotTitle(slot: UsageSlot): string {
  return `${slot.ehr} — ${slot.organization ?? 'pending configuration'}`;
}

/**
 * Why a connection in a slot counts the way it does. The first connection
 * holds the slot; the rest share it.
 */
export function describeSlotConnection(slot: UsageSlot, index: number): string {
  const holder = slot.connections[0];
  const shareCount = slot.connections.length;
  if (index > 0) {
    return `Shares a slot with “${holder.name}” — both point to the same EHR organization, so they count as 1.`;
  }
  const pending =
    slot.organization === null ? ' (its FHIR URL isn’t set yet)' : '';
  return shareCount > 1
    ? `Uses 1 connection slot${pending} — shared by ${shareCount} connections to the same EHR organization.`
    : `Uses 1 connection slot${pending}.`;
}

const matchesQuery = (fields: string[], query: string): boolean =>
  fields.some((field) => field.toLowerCase().includes(query));

/** Slots matching the search and filter (shared = more than one connection). */
export function filterUsageSlots(
  slots: UsageSlot[],
  search: string,
  filter: UsageFilter,
): UsageSlot[] {
  const query = search.trim().toLowerCase();
  return slots.filter(
    (slot) =>
      (filter !== USAGE_FILTER.SHARED_SLOT || slot.connections.length > 1) &&
      (query === '' ||
        matchesQuery(
          [
            formatSlotTitle(slot),
            ...slot.connections.flatMap((item) => [item.name, item.type]),
          ],
          query,
        )),
  );
}

export function isUsageFilter(value: string): value is UsageFilter {
  return USAGE_FILTER_OPTIONS.some((option) => option.value === value);
}

/** A provider's label and credential fields; every provider has one. */
export function getLlmProviderOption(provider: LlmProvider): LlmProviderOption {
  return (
    LLM_PROVIDER_OPTIONS.find((option) => option.value === provider) ??
    LLM_PROVIDER_OPTIONS[0]
  );
}

export function isLlmProvider(value: string): value is LlmProvider {
  return LLM_PROVIDER_OPTIONS.some((option) => option.value === value);
}

/** Secrets the API says are stored for the config's provider. */
export function getStoredSecretKeys(config: LlmConfig): LlmCredentialKey[] {
  return getLlmProviderOption(config.provider)
    .fields.filter(
      (field) => field.kind === 'secret' && field.key in config.secretHints,
    )
    .map((field) => field.key);
}

/** Up to two initials from the name, else the username's first letter. */
export function getUserInitials(user: AdminUser): string {
  const words = (user.name ?? '').trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) {
    return user.username.charAt(0).toUpperCase();
  }
  return words
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join('');
}
