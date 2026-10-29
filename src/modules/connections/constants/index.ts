import type {
  ConnectionSource,
  ConnectionStatus,
  ConnectionType,
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
} as const;

export const CONNECTION_SOURCE = {
  EPIC: 'epic',
  OPENDENTAL: 'opendental',
  VERADIGM: 'veradigm',
} as const;

export const ALL_TYPES_FILTER = 'all';

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
};

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

/** Capability chips shown on a card before collapsing the rest into "+N". */
export const EHR_CAPABILITY_PREVIEW_COUNT = 4;
export const EHR_SKELETON_CARD_COUNT = 6;
