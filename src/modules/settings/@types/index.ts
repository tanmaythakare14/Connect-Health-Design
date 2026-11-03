import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import type { ConnectionSource } from '@/modules/connections';
import type { CreateApiKeyFormValues } from '../components/api-keys/schema';
import type { ChangePasswordFormValues } from '../components/security/schema';
import type { LlmConfigFormValues } from '../components/helix-ai/schema';
import type {
  AddUserFormValues,
  ResetUserPasswordFormValues,
} from '../components/users/schema';
import type {
  LICENSE_SOURCE_TYPE,
  LLM_PROVIDER,
  SETTINGS_SECTION,
  USAGE_FILTER,
  USER_ROLE,
} from '../constants';

export type {
  AddUserFormValues,
  ChangePasswordFormValues,
  CreateApiKeyFormValues,
  LlmConfigFormValues,
  ResetUserPasswordFormValues,
};

export type SettingsSectionId =
  (typeof SETTINGS_SECTION)[keyof typeof SETTINGS_SECTION];

/** One entry in the Settings tabs, and its screen's heading. */
export interface SettingsSectionConfig {
  id: SettingsSectionId;
  label: string;
  /** Subheading on the section's own screen */
  description: string;
  icon: LucideIcon;
}

// ── Component props ──────────────────────────────────────────────

export interface SettingsTabsProps {
  items: SettingsSectionConfig[];
  /** Names the tab list, e.g. "Settings" */
  ariaLabel: string;
  className?: string;
}

export interface SettingsPageHeaderProps {
  section: SettingsSectionConfig;
  /** Right-aligned, e.g. a primary "Create" button */
  actions?: ReactNode;
}

export interface SettingsCardProps {
  /** Ties the card to its heading for screen readers */
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  /** Right side of the card header, e.g. an "Edit" button */
  action?: ReactNode;
  children: ReactNode;
}

// ── General ──────────────────────────────────────────────────────

// DTO — deployment details and workspace preferences (currently mocked)
export interface GeneralSettingsApiDto {
  deploymentId: string;
  /** e.g. "production", "staging" */
  environment: string;
  version: string;
  usageDiagnosticsEnabled: boolean;
}

export type GeneralSettings = GeneralSettingsApiDto;

export type GeneralSettingsState =
  | { status: 'loading' }
  | { status: 'success'; data: GeneralSettings }
  | { status: 'error' };

export interface DeploymentCardProps {
  deploymentId: string;
  environment: string;
  version: string;
}

export interface UsageDiagnosticsCardProps {
  isEnabled: boolean;
  isSaving: boolean;
  onToggle: (enabled: boolean) => void;
}

// ── API keys ─────────────────────────────────────────────────────

// DTO — one API key (currently mocks/apiKeys.ts)
export interface ApiKeyApiDto {
  id: string;
  name: string;
  /** The full secret */
  key: string;
  isActive: boolean;
  /** ISO timestamp */
  createdAt: string;
}

export type ApiKey = ApiKeyApiDto;

export interface CreateApiKeyPayload {
  name: string;
}

export type ApiKeyListState =
  | { status: 'loading' }
  | { status: 'success'; data: ApiKey[] }
  | { status: 'error' };

export interface ApiKeyTableProps {
  apiKeys: ApiKey[];
  isLoading: boolean;
  /** Keys just created, highlighted briefly */
  newKeyIds: ReadonlySet<string>;
  emptyState: ReactNode;
  onToggleActive: (apiKey: ApiKey) => void;
  onDelete: (apiKey: ApiKey) => void;
}

export interface ApiKeyValueCellProps {
  apiKey: ApiKey;
  isRevealed: boolean;
  onToggleReveal: (apiKey: ApiKey) => void;
}

export interface ApiKeyStatusCellProps {
  apiKey: ApiKey;
  onToggleActive: (apiKey: ApiKey) => void;
}

export interface CreateApiKeyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Rejects to show the dialog's inline error */
  onCreate: (values: CreateApiKeyFormValues) => Promise<void>;
}

// ── Subscription ─────────────────────────────────────────────────

export type LicenseSourceType =
  (typeof LICENSE_SOURCE_TYPE)[keyof typeof LICENSE_SOURCE_TYPE];

// DTO — plan, license sources and marketplace details (currently mocked)
export interface SubscriptionApiDto {
  plan: {
    name: string;
    integrationsLimit: number;
    integrationsUsed: number;
    /** ISO date */
    expiresAt: string;
  };
  sources: Array<{
    id: string;
    type: LicenseSourceType;
    name: string;
    connections: number;
    inUse: number;
    isActive: boolean;
  }>;
  details: {
    customerId: string;
    awsAccountId: string;
    productCode: string;
    setupFeePaid: boolean;
    isActive: boolean;
  };
}

export interface LicenseSource {
  id: string;
  type: LicenseSourceType;
  name: string;
  connections: number;
  inUse: number;
  isActive: boolean;
}

export interface Subscription {
  planName: string;
  integrationsLimit: number;
  integrationsUsed: number;
  integrationsRemaining: number;
  expiresAt: string;
  sources: LicenseSource[];
  customerId: string;
  awsAccountId: string;
  productCode: string;
  setupFeePaid: boolean;
  isActive: boolean;
}

export type SubscriptionState =
  | { status: 'loading' }
  | { status: 'success'; data: Subscription }
  | { status: 'error' };

export interface SubscriptionStatusCardProps {
  planName: string;
  used: number;
  limit: number;
  remaining: number;
  expiresAt: string;
}

export interface UsageRingProps {
  used: number;
  limit: number;
}

export interface LicenseSourcesCardProps {
  sources: LicenseSource[];
}

export interface LicenseSourceItemProps {
  source: LicenseSource;
}

export interface PlanDetailsCardProps {
  customerId: string;
  awsAccountId: string;
  productCode: string;
  setupFeePaid: boolean;
  isActive: boolean;
}

// ── Subscription → Connection usage ──────────────────────────────

/** How slots count (all / using / sharing), or one connection source */
export type UsageFilter =
  | (typeof USAGE_FILTER)[keyof typeof USAGE_FILTER]
  | ConnectionSource;

export interface UsageFilterOption {
  value: UsageFilter;
  label: string;
}

export interface UsageConnectionDto {
  id: string;
  name: string;
  /** e.g. "Epic", "Allscripts (Veradigm)" */
  ehr: string;
  /** Connection type, e.g. "backend", "standalone", "embed" */
  type: string;
}

// DTO — how the plan's slots are being used (currently mocked)
export interface ConnectionUsageApiDto {
  usedSlots: number;
  planSlots: number;
  activeConnections: number;
  totalConnections: number;
  /** Each slot is one EHR organization; its connections share it */
  slots: Array<{
    id: string;
    ehr: string;
    /** Org host or name; null while the FHIR URL isn't set */
    organization: string | null;
    source: LicenseSourceType;
    connections: UsageConnectionDto[];
  }>;
}

export type UsageConnection = UsageConnectionDto;

export interface UsageSlot {
  id: string;
  ehr: string;
  organization: string | null;
  source: LicenseSourceType;
  connections: UsageConnection[];
}

export interface ConnectionUsage {
  usedSlots: number;
  planSlots: number;
  remainingSlots: number;
  activeConnections: number;
  totalConnections: number;
  slots: UsageSlot[];
}

export type ConnectionUsageState =
  | { status: 'loading' }
  | {
      status: 'success';
      data: ConnectionUsage;
    }
  | { status: 'error' };

export interface UsageStatTilesProps {
  usage: ConnectionUsage;
}

export interface UsageFilterBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  filter: UsageFilter;
  onFilterChange: (value: UsageFilter) => void;
}

export interface SlotCardProps {
  slot: UsageSlot;
}

export interface UsageGroupHeadingProps {
  icon: LucideIcon;
  title: string;
  count: number;
}

export interface ConnectionUsageHeaderActionsProps {
  isOpen: boolean;
  onToggleOpen: () => void;
  isRefreshing: boolean;
  onRefresh: () => void;
  refreshDisabled: boolean;
  /** id of the collapsible body, for aria-controls */
  bodyId: string;
}

// ── Helix AI ─────────────────────────────────────────────────────

export type LlmProvider = (typeof LLM_PROVIDER)[keyof typeof LLM_PROVIDER];

export type LlmCredentialKey = keyof LlmConfigFormValues['credentials'];

/** One credential input for a provider; secrets are write-only. */
export interface LlmCredentialField {
  key: LlmCredentialKey;
  label: string;
  /** "text" is shown and pre-filled; "secret" is never sent back by the API */
  kind: 'text' | 'secret';
  placeholder: string;
}

export interface LlmProviderOption {
  value: LlmProvider;
  label: string;
  modelPlaceholder: string;
  fields: LlmCredentialField[];
}

// DTO — Helix settings; secrets come back only as hints (currently mocked)
export interface HelixAiSettingsApiDto {
  enabled: boolean;
  llm: LlmConfigApiDto;
}

export interface LlmConfigApiDto {
  provider: LlmProvider;
  modelName: string;
  /** Plain (non-secret) credential values, e.g. region */
  values: Partial<Record<LlmCredentialKey, string>>;
  /** Stored secrets: a masked hint (e.g. "AKIA••••602") or null if fully hidden */
  secretHints: Partial<Record<LlmCredentialKey, string | null>>;
  /** ISO timestamp */
  updatedAt: string;
}

export type LlmConfig = LlmConfigApiDto;

export interface HelixAiSettings {
  isEnabled: boolean;
  llm: LlmConfig;
}

export type HelixAiSettingsState =
  | { status: 'loading' }
  | { status: 'success'; data: HelixAiSettings }
  | { status: 'error' };

export interface SaveLlmConfigPayload {
  provider: LlmProvider;
  modelName: string;
  values: Partial<Record<LlmCredentialKey, string>>;
  /** Only secrets the user typed; anything left out is kept as stored */
  secrets: Partial<Record<LlmCredentialKey, string>>;
}

export interface HelixAgentCardProps {
  isEnabled: boolean;
  isSaving: boolean;
  onToggle: (enabled: boolean) => void;
}

export interface LlmProviderCardProps {
  config: LlmConfig;
  isHelixEnabled: boolean;
  /** The card shows the edit form in place of the summary */
  isEditing: boolean;
  onEdit: () => void;
  onCancelEdit: () => void;
  /** Rejects to show the form's inline error */
  onSave: (values: LlmConfigFormValues) => Promise<void>;
}

export interface LlmProviderFormProps {
  config: LlmConfig;
  onCancel: () => void;
  /** Rejects to show the form's inline error */
  onSave: (values: LlmConfigFormValues) => Promise<void>;
}

export interface ProviderCredentialFieldsProps {
  provider: LlmProvider;
  /** Secrets already stored for this provider (blank keeps them) */
  storedSecretKeys: LlmCredentialKey[];
  disabled: boolean;
}

export interface SettingsCalloutProps {
  title: string;
  icon: LucideIcon;
  children: ReactNode;
}

export interface StatusPillProps {
  /** Green when true, grey when false */
  isPositive: boolean;
  label: string;
}

export interface SettingsPlaceholderProps {
  /** What this screen will hold, e.g. "API key management" */
  title: string;
  description: string;
}

// ── Users ────────────────────────────────────────────────────────

export type UserRole = (typeof USER_ROLE)[keyof typeof USER_ROLE];

// DTO — one console user (currently mocks/users.ts)
export interface AdminUserApiDto {
  id: string;
  name: string | null;
  username: string;
  email: string | null;
  role: UserRole;
  /** Must choose a new password at next sign-in */
  mustResetPassword: boolean;
  twoFactorEnabled: boolean;
  /** The built-in administrator, which can't be deleted */
  isBuiltIn: boolean;
}

export type AdminUser = AdminUserApiDto;

export interface CreateAdminUserPayload {
  name: string | null;
  username: string;
  email: string | null;
  password: string;
  mustResetPassword: boolean;
}

export interface ResetUserPasswordPayload {
  password: string;
  mustResetPassword: boolean;
}

export type AdminUserListState =
  | { status: 'loading' }
  | { status: 'success'; data: AdminUser[] }
  | { status: 'error' };

// DTO — the signed-in user's two-factor setup (currently mocked)
export interface TwoFactorSettingsApiDto {
  /** An authenticator app is set up */
  isEnrolled: boolean;
  requireOnLogin: boolean;
}

export type TwoFactorSettings = TwoFactorSettingsApiDto;

export type TwoFactorSettingsState =
  | { status: 'loading' }
  | { status: 'success'; data: TwoFactorSettings }
  | { status: 'error' };

export interface TwoFactorCardProps {
  state: TwoFactorSettingsState;
  isSaving: boolean;
  onToggleRequire: (required: boolean) => void;
  onReset: () => void;
  onRetry: () => void;
}

export interface UserTableProps {
  users: AdminUser[];
  isLoading: boolean;
  /** Users just added, highlighted briefly */
  newUserIds: ReadonlySet<string>;
  emptyState: ReactNode;
  onDelete: (user: AdminUser) => void;
}

export interface UserStatusTextProps {
  tone: 'positive' | 'warning' | 'neutral';
  label: string;
}

export interface AddUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Rejects to show the dialog's inline error */
  onAdd: (values: AddUserFormValues) => Promise<void>;
}

export interface ResetUserPasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Users to choose from */
  users: AdminUser[];
  /** Rejects to show the dialog's inline error */
  onReset: (values: ResetUserPasswordFormValues) => Promise<void>;
}

export interface UserPasswordRule {
  id: string;
  label: string;
  test: (value: string) => boolean;
}

// ── Change password ──────────────────────────────────────────────

// Payload for POST /settings/account/password
export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

export interface PasswordRequirementsProps {
  /** Ties the list to the password input via aria-describedby */
  id: string;
  password: string;
}
