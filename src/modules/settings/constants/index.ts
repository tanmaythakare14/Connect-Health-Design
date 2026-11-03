import {
  CreditCard,
  KeyRound,
  LockKeyhole,
  SlidersHorizontal,
  Sparkles,
  Users,
} from 'lucide-react';
import type {
  LicenseSourceType,
  LlmProviderOption,
  SettingsSectionConfig,
  UsageFilter,
  UserPasswordRule,
  UserRole,
} from '../@types';

export const SETTINGS_SECTION = {
  GENERAL: 'general',
  API_KEYS: 'api-keys',
  SUBSCRIPTION: 'subscription',
  HELIX_AI: 'helix-ai',
  USERS: 'users',
  CHANGE_PASSWORD: 'change-password',
} as const;

/** Side menu order; General opens by default. */
export const SETTINGS_SECTIONS: SettingsSectionConfig[] = [
  {
    id: SETTINGS_SECTION.GENERAL,
    label: 'General',
    description: 'Your deployment details and product diagnostics',
    icon: SlidersHorizontal,
  },
  {
    id: SETTINGS_SECTION.API_KEYS,
    label: 'API Keys',
    description:
      'Manage your API keys for ConnectHealth integration. Keep your keys secure and never share them publicly.',
    icon: KeyRound,
  },
  {
    id: SETTINGS_SECTION.SUBSCRIPTION,
    label: 'Subscription',
    description:
      'View your current subscription plan and usage details from AWS Marketplace',
    icon: CreditCard,
  },
  {
    id: SETTINGS_SECTION.HELIX_AI,
    label: 'Helix AI',
    description:
      'Configure Helix, your AI-powered assistant for workflow generation and debugging',
    icon: Sparkles,
  },
  {
    id: SETTINGS_SECTION.USERS,
    label: 'Users',
    description:
      'Manage admin users who have access to the ConnectHealth management console',
    icon: Users,
  },
  {
    id: SETTINGS_SECTION.CHANGE_PASSWORD,
    label: 'Change Password',
    description:
      'Update the password you use to sign in to the ConnectHealth management console',
    icon: LockKeyhole,
  },
];

export const DEFAULT_SETTINGS_SECTION = SETTINGS_SECTION.GENERAL;

// ── API keys ─────────────────────────────────────────────────────

export const API_KEY_NAME_MAX_LENGTH = 64;

/** Characters kept visible either side of a masked key */
export const API_KEY_MASK_PREFIX_LENGTH = 8;
export const API_KEY_MASK_SUFFIX_LENGTH = 4;

/** How long a newly created key stays highlighted */
export const NEW_API_KEY_HIGHLIGHT_MS = 4000;

export const API_KEY_SECURITY_TIPS = [
  'Never share your API keys publicly or in client-side code',
  'Regularly rotate your API keys for enhanced security',
  'Disable unused keys immediately to prevent unauthorized access',
  'Monitor API key usage in the audit logs',
] as const;

// ── Subscription ─────────────────────────────────────────────────

export const LICENSE_SOURCE_TYPE = {
  AWS_MARKETPLACE: 'aws_marketplace',
  CONNECTHEALTH: 'connecthealth',
} as const;

/** Usage at or above this share of the limit is flagged as running low */
export const USAGE_WARNING_RATIO = 0.9;

export const LICENSE_SOURCE_LABELS: Record<LicenseSourceType, string> = {
  aws_marketplace: 'AWS Marketplace',
  connecthealth: 'ConnectHealth License',
};

// ── Subscription → Connection usage ──────────────────────────────

export const USAGE_FILTER = {
  ALL: 'all',
  USING_SLOT: 'using',
  SHARED_SLOT: 'shared',
} as const;

export const USAGE_FILTER_OPTIONS: Array<{
  value: UsageFilter;
  label: string;
}> = [
  { value: USAGE_FILTER.ALL, label: 'All connections' },
  { value: USAGE_FILTER.USING_SLOT, label: 'Using a slot' },
  { value: USAGE_FILTER.SHARED_SLOT, label: 'Sharing a slot' },
];

export const CONNECTION_COUNTING_RULES = [
  'Each connection to a distinct EHR organization uses one slot in your plan.',
  'Connections that point to the same EHR organization share a single slot — even if you create several.',
  'Inactive connections don’t use a slot.',
  'An embedded (EHR-launched) connection starts using a slot only after its first launch.',
  'Some shared networks (e.g. a shared Athena endpoint or a shared Epic network) count as a single slot.',
] as const;

// ── Helix AI ─────────────────────────────────────────────────────

export const LLM_PROVIDER = {
  BEDROCK: 'bedrock',
  VERTEX_AI: 'vertex_ai',
} as const;

/**
 * Providers Helix can use. Each entry's fields drive both the edit dialog
 * and the read-only summary, so adding a provider is one entry here.
 */
export const LLM_PROVIDER_OPTIONS: LlmProviderOption[] = [
  {
    value: LLM_PROVIDER.BEDROCK,
    label: 'AWS Bedrock',
    modelPlaceholder: 'e.g., global.anthropic.claude-sonnet-4-5-20250929-v1:0',
    fields: [
      {
        key: 'region',
        label: 'Region',
        kind: 'text',
        placeholder: 'us-east-1',
      },
      {
        key: 'accessKeyId',
        label: 'Access key ID',
        kind: 'secret',
        placeholder: 'AKIAIOSFODNN7EXAMPLE',
      },
      {
        key: 'secretAccessKey',
        label: 'Secret access key',
        kind: 'secret',
        placeholder: 'Your AWS secret access key',
      },
    ],
  },
  {
    value: LLM_PROVIDER.VERTEX_AI,
    label: 'Google Vertex AI',
    modelPlaceholder: 'e.g., claude-sonnet-4-5@20250929',
    fields: [
      {
        key: 'projectId',
        label: 'Project ID',
        kind: 'text',
        placeholder: 'e.g., my-gcp-project',
      },
      {
        key: 'region',
        label: 'Region',
        kind: 'text',
        placeholder: 'us-east5',
      },
      {
        key: 'serviceAccountKey',
        label: 'Service account key (JSON)',
        kind: 'secret',
        placeholder: 'Paste your service account key JSON',
      },
    ],
  },
];

export const HELIX_SECURITY_NOTICE =
  'Your credentials are stored securely in AWS Secrets Manager. Never share your API keys or service account credentials publicly.';

// ── Users ────────────────────────────────────────────────────────

export const USER_ROLE = {
  ADMIN: 'admin',
} as const;

export const USER_ROLE_LABELS: Record<UserRole, string> = {
  admin: 'Admin',
};

export const USER_NAME_MAX_LENGTH = 80;
export const USERNAME_MAX_LENGTH = 64;
export const USER_PASSWORD_MIN_LENGTH = 8;

/** How long a newly added user stays highlighted */
export const NEW_USER_HIGHLIGHT_MS = 4000;

/** Every rule must pass; also drives the live checklist under the field. */
export const USER_PASSWORD_RULES: UserPasswordRule[] = [
  {
    id: 'length',
    label: `At least ${USER_PASSWORD_MIN_LENGTH} characters`,
    test: (value) => value.length >= USER_PASSWORD_MIN_LENGTH,
  },
  {
    id: 'uppercase',
    label: 'One uppercase letter (A–Z)',
    test: (value) => /[A-Z]/.test(value),
  },
  {
    id: 'lowercase',
    label: 'One lowercase letter (a–z)',
    test: (value) => /[a-z]/.test(value),
  },
  {
    id: 'number',
    label: 'One number (0–9)',
    test: (value) => /\d/.test(value),
  },
  {
    id: 'symbol',
    label: 'One symbol (!@#$…)',
    test: (value) => /[^A-Za-z0-9\s]/.test(value),
  },
];
