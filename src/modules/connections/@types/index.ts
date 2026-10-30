import type { ComponentProps, ReactNode } from 'react';
import type { BackendSetupFormValues } from '../components/manage-connection/types/backend/schema';
import type { EmbedSetupFormValues } from '../components/manage-connection/types/embed/schema';
import type { OpendentalSetupFormValues } from '../components/manage-connection/types/opendental/schema';
import type { StandaloneSetupFormValues } from '../components/manage-connection/types/standalone/schema';
import type { UnitySetupFormValues } from '../components/manage-connection/types/unity/schema';

export type {
  BackendSetupFormValues,
  EmbedSetupFormValues,
  OpendentalSetupFormValues,
  StandaloneSetupFormValues,
  UnitySetupFormValues,
};
import type {
  ALL_STATUSES_FILTER,
  ALL_TYPES_FILTER,
  CONNECTION_SOURCE,
  CONNECTION_STATUS,
  CONNECTION_TYPE,
  EHR_AVAILABILITY,
} from '../constants';

export type ConnectionType =
  (typeof CONNECTION_TYPE)[keyof typeof CONNECTION_TYPE];
export type ConnectionStatus =
  (typeof CONNECTION_STATUS)[keyof typeof CONNECTION_STATUS];
export type ConnectionSource =
  (typeof CONNECTION_SOURCE)[keyof typeof CONNECTION_SOURCE];
export type ConnectionTypeFilter = ConnectionType | typeof ALL_TYPES_FILTER;
export type ConnectionStatusFilter =
  | ConnectionStatus
  | typeof ALL_STATUSES_FILTER;

// DTO — raw shape from the API (currently served from mocks/connections.ts)
export interface ConnectionApiDto {
  id: string;
  source: ConnectionSource;
  name: string;
  type: ConnectionType;
  status: ConnectionStatus;
}

// Domain shape used through the UI
export interface Connection {
  id: string;
  source: ConnectionSource;
  name: string;
  type: ConnectionType;
  status: ConnectionStatus;
}

// Licence usage — counted by the backend, so it can differ from the number of table rows
export interface ConnectionUsageApiDto {
  used: number;
  limit: number;
}

export interface ConnectionUsage {
  used: number;
  limit: number;
}

export type ConnectionListState =
  | { status: 'loading' }
  | { status: 'success'; data: Connection[]; usage: ConnectionUsage }
  | { status: 'error'; error: string };

// Component props
export interface ConnectionToolbarProps {
  search: string;
  onSearchChange: (search: string) => void;
  typeFilter: ConnectionTypeFilter;
  onTypeFilterChange: (type: ConnectionTypeFilter) => void;
  statusFilter: ConnectionStatusFilter;
  onStatusFilterChange: (status: ConnectionStatusFilter) => void;
  /** Shown beside the search bar once loaded. */
  usage?: ConnectionUsage;
  onUsageInfo: () => void;
  /** Page-level buttons placed right after the type filter. */
  actions?: ReactNode;
  disabled?: boolean;
}

export interface ConnectionUsageBadgeProps {
  usage: ConnectionUsage;
  onInfo: () => void;
}

export interface ConnectionTableProps {
  connections: Connection[];
  isLoading: boolean;
  skeletonRowCount: number;
  /** Rendered in place of rows when not loading and there are no connections. */
  emptyState: ReactNode;
  /** Pinned below the rows inside the card, e.g. pagination. */
  footer?: ReactNode;
  onManage: (connection: Connection) => void;
  /** Flips an active connection to inactive and back (not shown for drafts). */
  onToggleActive: (connection: Connection) => void;
  onTest: (connection: Connection) => void;
}

export interface ConnectionTableRowProps {
  connection: Connection;
  onManage: (connection: Connection) => void;
  onToggleActive: (connection: Connection) => void;
  onTest: (connection: Connection) => void;
}

export interface ConnectionStatusCellProps {
  connection: Connection;
  onToggleActive: (connection: Connection) => void;
}

export interface ConnectionActionsCellProps {
  connection: Connection;
  onManage: (connection: Connection) => void;
  onTest: (connection: Connection) => void;
}

export interface ConnectionIdCellProps {
  id: string;
}

export interface ConnectionSourceCellProps {
  source: ConnectionSource;
}

export interface ConnectionTypeBadgeProps {
  type: ConnectionType;
}

export interface ConnectionStatusBadgeProps {
  status: ConnectionStatus;
}

// ── Add New Connection ──────────────────────────────────────────────

export type ConnectionsView =
  | 'list'
  | 'add-connection'
  | 'test-connection'
  | 'manage-connection';

export type EhrAvailability =
  (typeof EHR_AVAILABILITY)[keyof typeof EHR_AVAILABILITY];

// DTO — raw shape from the API (currently served from mocks/ehrSystems.ts)
export interface EhrSystemApiDto {
  id: string;
  name: string;
  description: string;
  /** Short mark shown in the logo tile until vendor logos are supplied */
  monogram: string;
  capabilities: string[];
  availability: EhrAvailability;
}

export interface EhrSystem {
  id: string;
  name: string;
  description: string;
  monogram: string;
  capabilities: string[];
  isAvailable: boolean;
}

export type EhrSystemListState =
  | { status: 'loading' }
  | { status: 'success'; data: EhrSystem[] }
  | { status: 'error'; error: string };

export interface AddConnectionScreenProps {
  onBack: () => void;
  onSelect: (ehrSystem: EhrSystem) => void;
}

export interface EhrSystemCardProps {
  ehrSystem: EhrSystem;
  onSelect: (ehrSystem: EhrSystem) => void;
}

export interface EnterpriseSupportCalloutProps {
  onContact: () => void;
}

// ── Test connection ─────────────────────────────────────────────────

// DTO — raw shape from the API (currently served from mocks/apiKeys.ts)
export interface ApiKeyApiDto {
  id: string;
  name: string;
}

export interface ApiKey {
  id: string;
  name: string;
}

export type ApiKeyListState =
  | { status: 'loading' }
  | { status: 'success'; data: ApiKey[] }
  | { status: 'error' };

/** 'pending' = not run, because an earlier step failed */
export type ConnectionTestStepStatus = 'passed' | 'failed' | 'pending';

export interface ConnectionTestDetailDto {
  label: string;
  value: string;
}

export interface ConnectionTestErrorDto {
  /** User-facing summary, e.g. "Request failed with status code 500" */
  message: string;
  /** Raw response body from the health system, pretty-printed JSON */
  response?: string;
}

export interface ConnectionTestStepDto {
  id: string;
  title: string;
  description: string;
  status: ConnectionTestStepStatus;
  /** Key facts gathered by a passed step */
  details?: ConnectionTestDetailDto[];
  error?: ConnectionTestErrorDto;
}

export interface ConnectionTestResultApiDto {
  outcome: 'passed' | 'failed';
  durationMs: number;
  /** ISO 8601 timestamp */
  testedAt: string;
  steps: ConnectionTestStepDto[];
}

export type ConnectionTestStep = ConnectionTestStepDto;

export interface ConnectionTestResult {
  outcome: 'passed' | 'failed';
  durationMs: number;
  testedAt: string;
  steps: ConnectionTestStep[];
  apiKeyName: string;
}

export type ConnectionTestRunState =
  | { status: 'idle' }
  | { status: 'running'; apiKeyName: string }
  | { status: 'done'; result: ConnectionTestResult }
  | { status: 'error'; error: string };

export interface TestConnectionScreenProps {
  connection: Connection;
  onBack: () => void;
}

export interface ApiKeySelectProps {
  /** Links the trigger to its <Label htmlFor> */
  id: string;
  listState: ApiKeyListState;
  value: string;
  onValueChange: (apiKeyId: string) => void;
  onRetry: () => void;
  disabled?: boolean;
}

export interface ConnectionTestResultPanelProps {
  runState: ConnectionTestRunState;
  onRetry: () => void;
}

/** 'running' only exists client-side while a test is in flight */
export type ConnectionTestStepDisplayStatus =
  | ConnectionTestStepStatus
  | 'running';

// ── Manage connection ───────────────────────────────────────────────

export interface ManageConnectionScreenProps {
  connection: Connection;
  onBack: () => void;
}

/** Props every per-type details component receives from the shell. */
export interface ConnectionDetailsProps {
  connection: Connection;
}

export interface SetupSectionProps {
  /** Anchor id, so the progress checklist can scroll to it */
  id: string;
  step: number;
  title: string;
  description?: string;
  isComplete: boolean;
  children: ReactNode;
}

export interface SetupStep {
  id: string;
  step: number;
  title: string;
  isComplete: boolean;
  /** Not available yet (e.g. until "Yes, I have it" is chosen) */
  isLocked: boolean;
}

/** Answer to a setup screen's "do you already have it?" question */
export type SetupAnswer = 'yes' | 'not_yet';

// Standalone launch (Epic SMART on FHIR) setup

export type EpicAppStatus = SetupAnswer;

// DTO — raw shape from the API (currently built in mocks/standaloneConfigs.ts)
export interface StandaloneConfigApiDto {
  connectionId: string;
  name: string;
  ehrSystem: string;
  callbackUrl: string;
  appStatus: EpicAppStatus | null;
  clientId: string;
  clientSecret: string;
  fhirBaseUrl: string;
  authorizationUrl: string;
  tokenUrl: string;
  /** Space-separated, as OAuth expects */
  scopes: string;
}

export type StandaloneConfig = StandaloneConfigApiDto;

/** PUT body when saving a draft or continuing */
export type SaveStandaloneConfigPayload = Omit<
  StandaloneConfigApiDto,
  'connectionId' | 'ehrSystem' | 'callbackUrl'
> & { isDraft: boolean };

export interface DetectedOAuthEndpointsDto {
  authorizationUrl: string;
  tokenUrl: string;
}

export type StandaloneConfigState =
  | { status: 'loading' }
  | { status: 'success'; data: StandaloneConfig }
  | { status: 'error' };

export interface StandaloneSetupFormProps {
  config: StandaloneConfig;
  connectionType: ConnectionType;
}

export type SetupSavingMode = 'draft' | 'continue' | null;

export interface SetupActionBarProps {
  /** Titles of required steps still to do; empty means ready */
  missingStepTitles: string[];
  isDirty: boolean;
  savingMode: SetupSavingMode;
  canContinue: boolean;
  onSaveDraft: () => void;
  /** Called after the user confirms the discard dialog */
  onDiscard: () => void;
  /** Primary button text; defaults to "Continue" */
  continueLabel?: string;
}

export interface SetupGuideProps {
  title: string;
  steps: readonly string[];
  /** Main external link, e.g. "Open Epic on FHIR" */
  primaryLink: { label: string; href: string };
  docsHref: string;
  /** Small caveat shown under the steps */
  note?: string;
}

export interface NotLiveYetNoteProps {
  /** Name of the button that makes the connection live */
  publishLabel: string;
}

// Backend services (Oracle Health / Cerner) setup

export type SigningKeyType = 'RSA' | 'EC';

export type SigningAlgorithm =
  | 'RS256'
  | 'RS384'
  | 'RS512'
  | 'ES256'
  | 'ES384'
  | 'ES512';

// DTO — the connection's ConnectHealth-generated signing key pair
export interface SigningKeyPairApiDto {
  keyType: SigningKeyType;
  algorithm: SigningAlgorithm;
  /** PEM private key — shown masked, never copied out by the UI */
  privateKeyPem: string;
  /** Public JWKS (JSON) served at the connection's JWKS URL */
  publicJwks: string;
  /** PEM/base64 body of the X.509 public key certificate */
  publicKeyCertificate: string;
}

export type SigningKeyPair = SigningKeyPairApiDto;

export interface GenerateKeyPairPayload {
  keyType: SigningKeyType;
  algorithm: SigningAlgorithm;
}

// DTO — raw shape from the API (currently built in mocks/backendConfigs.ts)
export interface BackendConfigApiDto {
  connectionId: string;
  name: string;
  ehrSystem: string;
  appStatus: SetupAnswer | null;
  /** Where Oracle Health fetches ConnectHealth's public signing keys */
  jwksUrl: string;
  signingKeys: SigningKeyPairApiDto;
}

export type BackendConfig = BackendConfigApiDto;

export type SaveBackendConfigPayload = Pick<
  BackendConfigApiDto,
  'name' | 'appStatus'
> & { isDraft: boolean };

export type BackendConfigState =
  | { status: 'loading' }
  | { status: 'success'; data: BackendConfig }
  | { status: 'error' };

export interface BackendSetupFormProps {
  config: BackendConfig;
  connectionType: ConnectionType;
}

export interface AdvancedKeySettingsProps {
  connectionId: string;
  signingKeys: SigningKeyPair;
  onKeysGenerated: (keys: SigningKeyPair) => void;
  disabled?: boolean;
}

// Unity (Allscripts / Veradigm) setup

// DTO — raw shape from the API (currently built in mocks/unityConfigs.ts)
export interface UnityConfigApiDto {
  connectionId: string;
  name: string;
  ehrSystem: string;
  credentialsStatus: SetupAnswer | null;
  endpointUrl: string;
  appName: string;
  serviceUsername: string;
  servicePassword: string;
  ehrUsername: string;
  ehrPassword: string;
  /** Optional; prefixed to the service username when set */
  ubiquityId: string;
}

export type UnityConfig = UnityConfigApiDto;

export type SaveUnityConfigPayload = Omit<
  UnityConfigApiDto,
  'connectionId' | 'ehrSystem'
> & { isDraft: boolean };

export type UnityConfigState =
  | { status: 'loading' }
  | { status: 'success'; data: UnityConfig }
  | { status: 'error' };

export interface UnitySetupFormProps {
  config: UnityConfig;
  connectionType: ConnectionType;
  /** Drafts show the "isn't live yet" note */
  connectionStatus: ConnectionStatus;
}

export interface SetupChoiceProps {
  value: SetupAnswer | null;
  onChange: (value: SetupAnswer) => void;
  /** The question, for screen readers (it's shown visually as the section description) */
  ariaLabel: string;
  yesDescription: string;
  notYetDescription: string;
  disabled?: boolean;
}

// Open Dental setup

// DTO — raw shape from the API (currently built in mocks/opendentalConfigs.ts)
export interface OpendentalConfigApiDto {
  connectionId: string;
  name: string;
  ehrSystem: string;
  keysStatus: SetupAnswer | null;
  developerKey: string;
  customerKey: string;
  /** Fixed Open Dental Remote API endpoint — read-only */
  apiBaseUrl: string;
}

export type OpendentalConfig = OpendentalConfigApiDto;

export type SaveOpendentalConfigPayload = Omit<
  OpendentalConfigApiDto,
  'connectionId' | 'ehrSystem' | 'apiBaseUrl'
> & { isDraft: boolean };

export type OpendentalConfigState =
  | { status: 'loading' }
  | { status: 'success'; data: OpendentalConfig }
  | { status: 'error' };

export interface OpendentalSetupFormProps {
  config: OpendentalConfig;
  connectionType: ConnectionType;
  /** Drafts show the "isn't live yet" note */
  connectionStatus: ConnectionStatus;
}

// EHR launch (embedded, Epic) setup

export interface WorkflowOptionDto {
  id: string;
  name: string;
}

export type WorkflowOption = WorkflowOptionDto;

export type WorkflowOptionsState =
  | { status: 'loading' }
  | { status: 'success'; data: WorkflowOption[] }
  | { status: 'error' };

// DTO — raw shape from the API (currently built in mocks/embedConfigs.ts)
export interface EmbedConfigApiDto {
  connectionId: string;
  name: string;
  ehrSystem: string;
  launchUrl: string;
  callbackUrl: string;
  appStatus: EpicAppStatus | null;
  clientId: string;
  clientSecret: string;
  /** Space-separated; ConnectHealth adds `launch` if missing */
  scopes: string;
  /** FHIR base URL bound on the first EHR launch; null until then */
  linkedSystem: string | null;
  /** '' = no workflow */
  workflowId: string;
  embeddedAppUrl: string;
}

export type EmbedConfig = EmbedConfigApiDto;

export type SaveEmbedConfigPayload = Omit<
  EmbedConfigApiDto,
  'connectionId' | 'ehrSystem' | 'launchUrl' | 'callbackUrl' | 'linkedSystem'
> & { isDraft: boolean };

export type EmbedConfigState =
  | { status: 'loading' }
  | { status: 'success'; data: EmbedConfig }
  | { status: 'error' };

export interface ClientIdCheckResultDto {
  isAvailable: boolean;
  /** Name of the embedded connection already using the ID */
  usedBy?: string;
}

export type ClientIdCheckState =
  | { status: 'idle' }
  | { status: 'checking' }
  | { status: 'available' }
  | { status: 'taken'; usedBy: string }
  | { status: 'error' };

export interface EmbedSetupFormProps {
  config: EmbedConfig;
  connectionType: ConnectionType;
}

/** id / aria-* come from FormControl so the label and errors stay linked. */
export interface WorkflowComboboxProps
  extends Pick<
    ComponentProps<'button'>,
    'id' | 'aria-describedby' | 'aria-invalid'
  > {
  optionsState: WorkflowOptionsState;
  /** '' = no workflow */
  value: string;
  onChange: (workflowId: string) => void;
  onRetry: () => void;
  disabled?: boolean;
}

/** id / aria-* come from FormControl so the label and errors stay linked. */
export interface OAuthScopesFieldProps
  extends Pick<
    ComponentProps<'input'>,
    'id' | 'aria-describedby' | 'aria-invalid'
  > {
  /** Space-separated scopes */
  value: string;
  onChange: (value: string) => void;
}

export interface ConnectionTestStepItemProps {
  title: string;
  description: string;
  status: ConnectionTestStepDisplayStatus;
  details?: ConnectionTestDetailDto[];
  error?: ConnectionTestErrorDto;
  /** Hides the connector line under the last step */
  isLast: boolean;
}
