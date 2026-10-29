import type { ReactNode } from 'react';
import type {
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
}

export interface ConnectionTableRowProps {
  connection: Connection;
  onManage: (connection: Connection) => void;
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

// ── Add New Connection: Select EHR System ──────────────────────────

export type ConnectionsView = 'list' | 'select-ehr';

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

export interface SelectEhrScreenProps {
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
