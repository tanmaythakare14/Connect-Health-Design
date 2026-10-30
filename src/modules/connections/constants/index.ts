import type {
  ConnectionSource,
  ConnectionStatus,
  ConnectionType,
  SigningAlgorithm,
  SigningKeyType,
} from '../@types';

export const CONNECTION_TYPE = {
  STANDALONE: 'standalone',
  EMBED: 'embed',
  OPENDENTAL: 'opendental',
  UNITY: 'unity',
  BACKEND: 'backend',
} as const;

export const CONNECTION_STATUS = {
  DRAFT: 'draft',
  ACTIVE: 'active',
  INACTIVE: 'inactive',
} as const;

export const CONNECTION_SOURCE = {
  EPIC: 'epic',
  OPENDENTAL: 'opendental',
  VERADIGM: 'veradigm',
} as const;

export const ALL_TYPES_FILTER = 'all';
export const ALL_STATUSES_FILTER = 'all';

export const CONNECTION_TYPE_LABELS: Record<ConnectionType, string> = {
  standalone: 'Standalone',
  embed: 'Embed',
  opendental: 'Opendental',
  unity: 'Unity',
  backend: 'Backend',
};

export const CONNECTION_TYPE_OPTIONS: Array<{
  value: ConnectionType;
  label: string;
}> = Object.values(CONNECTION_TYPE).map((value) => ({
  value,
  label: CONNECTION_TYPE_LABELS[value],
}));

export const CONNECTION_STATUS_LABELS: Record<ConnectionStatus, string> = {
  draft: 'Draft',
  active: 'Active',
  inactive: 'Inactive',
};

export const CONNECTION_STATUS_OPTIONS: Array<{
  value: ConnectionStatus;
  label: string;
}> = Object.values(CONNECTION_STATUS).map((value) => ({
  value,
  label: CONNECTION_STATUS_LABELS[value],
}));

export const CONNECTION_SOURCE_LABELS: Record<ConnectionSource, string> = {
  epic: 'Epic',
  opendental: 'Open Dental',
  veradigm: 'Veradigm',
};

export const PAGE_SIZE_OPTIONS = [10, 20, 50];
export const DEFAULT_PAGE_SIZE = 10;

export const EHR_AVAILABILITY = {
  AVAILABLE: 'available',
  COMING_SOON: 'coming_soon',
} as const;

/** The checks a connection test runs, in order (also shown while running). */
export const CONNECTION_TEST_STEPS: Array<{
  id: string;
  title: string;
  description: string;
}> = [
  {
    id: 'connection',
    title: 'Connection test',
    description: 'Checking connectivity to the EHR system',
  },
  {
    id: 'authentication',
    title: 'Authentication',
    description: 'Authenticating with JWT assertion',
  },
  {
    id: 'configuration',
    title: 'Validate configuration',
    description: 'Verifying OAuth endpoints and FHIR capabilities',
  },
];

/** Capability chips shown on a card before collapsing the rest into "+N". */
export const EHR_CAPABILITY_PREVIEW_COUNT = 4;
export const EHR_SKELETON_CARD_COUNT = 6;

// ── Manage: Standalone launch (Epic) ────────────────────────────────

/** Human-readable names for the "Connection type" field in setup screens */
export const CONNECTION_TYPE_SETUP_LABELS: Record<ConnectionType, string> = {
  standalone: 'Standalone launch',
  embed: 'EHR launch (embedded)',
  opendental: 'Open Dental',
  unity: 'Unity API',
  backend: 'Backend services',
};

export const EPIC_FHIR_URL = 'https://fhir.epic.com';
export const EPIC_FHIR_DOCS_URL = 'https://fhir.epic.com/Documentation';

/** How to create the Epic app for a standalone launch ("Not yet"). */
export const EPIC_STANDALONE_GUIDE_STEPS = [
  'Sign in at fhir.epic.com, open “Build Apps”, and create a new app.',
  'Select who will use the app: patients, or clinicians and administrative users.',
  'Add the ConnectHealth OAuth callback URL from step 3 below to the app’s “Redirect URIs”.',
  'Select the “Incoming APIs” the app needs. The OAuth scopes you request later must match these APIs.',
  'Save the app and copy its Client ID. Use the Non-Production Client ID for the Epic sandbox.',
  'Changes can take up to 1 hour to reach the Epic sandbox and up to 12 hours to reach live Epic organizations.',
] as const;

/** How to create the Epic app for an embedded (EHR) launch ("Not yet"). */
export const EPIC_EMBED_GUIDE_STEPS = [
  'Sign in at fhir.epic.com, open “Build Apps”, and create a new app for clinicians and administrative users.',
  'Add the ConnectHealth EHR Launch URL and OAuth callback URL from step 4 below to the app.',
  'Select the “Incoming APIs” the app needs. The OAuth scopes you request must match these APIs.',
  'Save the app and copy its Client ID. Use the Non-Production Client ID for the Epic sandbox.',
] as const;

// ── Manage: Open Dental ─────────────────────────────────────────────

export const OPENDENTAL_API_URL =
  'https://www.opendental.com/site/apiremote.html';
export const OPENDENTAL_API_DOCS_URL =
  'https://www.opendental.com/site/apispecification.html';

/** How to get the Open Dental keys ("Not yet"). */
export const OPENDENTAL_GUIDE_STEPS = [
  'Request Developer Portal access from Open Dental at vendor.relations@opendental.com. The Developer Key is shown in the Developer Portal.',
  'Generate a Customer Key for the Open Dental office in the Developer Portal.',
  'In Open Dental, open “Setup → Advanced Setup → API”, select “Add Key”, paste the Customer Key, and select “Enabled”.',
  'The office must run the eConnector for the Remote API to work.',
] as const;

// ── Manage: Backend services (Oracle Health / Cerner) ───────────────

export const ORACLE_HEALTH_CODE_CONSOLE_URL = 'https://code-console.cerner.com';
export const ORACLE_HEALTH_BACKEND_DOCS_URL =
  'https://fhir.cerner.com/authorization/';

/** How to register the Oracle Health system app ("Not yet"). */
export const ORACLE_HEALTH_GUIDE_STEPS = [
  'In code Console, register a new application with the type “System” (confidential).',
  'Oracle Health creates a system account for it in Cerner Central. Register the ConnectHealth JWKS URL from step 3 below there, in “System Account Management” — not in code Console.',
  'Request each system scope explicitly. Oracle Health doesn’t support wildcard scopes.',
  'Copy the Client ID. Each Oracle Health organization provisions production access through Oracle.',
] as const;

export const SIGNING_KEY_TYPE_OPTIONS: Array<{
  value: SigningKeyType;
  label: string;
}> = [
  { value: 'RSA', label: 'RSA' },
  { value: 'EC', label: 'EC (elliptic curve)' },
];

/** Algorithms each key type can sign with; the first is the default. */
export const SIGNING_ALGORITHMS_BY_KEY_TYPE: Record<
  SigningKeyType,
  SigningAlgorithm[]
> = {
  RSA: ['RS384', 'RS256', 'RS512'],
  EC: ['ES384', 'ES256', 'ES512'],
};

// ── Manage: Unity (Allscripts / Veradigm) ───────────────────────────

export const VERADIGM_DEVELOPER_PORTAL_URL = 'https://developer.veradigm.com';
export const VERADIGM_UNITY_DOCS_URL =
  'https://developer.veradigm.com/Unity_API';

/** How to get Unity API access ("Not yet"). */
export const UNITY_GUIDE_STEPS = [
  'Unity API access is part of the Veradigm Connect Integrator program.',
  'Contact Veradigm Connect at VeradigmConnect@veradigm.com to set up Unity access for the Veradigm organization.',
  'Veradigm provides the Unity endpoint URL, app name, and service credentials. The Veradigm organization provides the EHR user credentials.',
] as const;

export const UNITY_GUIDE_NOTE =
  'Your EHR’s portal may label these steps differently — check its developer documentation if something doesn’t match.';

/** Scopes Epic supports for a standalone launch, grouped for the "View all" picker. */
export const EPIC_SCOPE_CATALOG: Array<{
  title: string;
  groups: Array<{ label: string; scopes: string[] }>;
}> = [
  {
    title: 'Common scopes',
    groups: [
      { label: 'OpenID', scopes: ['fhirUser', 'openid', 'profile'] },
      { label: 'Launch', scopes: ['launch'] },
      { label: 'Access', scopes: ['offline_access', 'online_access'] },
    ],
  },
  {
    title: 'SMART v1 scopes',
    groups: [
      { label: 'Other', scopes: ['epic.scanning.dmsusername'] },
      {
        label: 'Patient',
        scopes: ['patient/*.read', 'patient/*.write', 'patient/*.*'],
      },
      { label: 'User', scopes: ['user/*.read', 'user/*.write', 'user/*.*'] },
    ],
  },
];

export const EPIC_AVAILABLE_SCOPE_COUNT = EPIC_SCOPE_CATALOG.flatMap(
  (catalog) => catalog.groups.flatMap((group) => group.scopes),
).length;
