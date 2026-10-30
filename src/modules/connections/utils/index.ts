import type {
  Connection,
  ConnectionStatus,
  ConnectionStatusFilter,
  ConnectionTypeFilter,
  EhrSystem,
  SigningKeyType,
} from '../@types';
import {
  ALL_STATUSES_FILTER,
  ALL_TYPES_FILTER,
  CONNECTION_SOURCE_LABELS,
  CONNECTION_STATUS,
  CONNECTION_TYPE,
  SIGNING_KEY_TYPE_OPTIONS,
} from '../constants';

export function isConnectionTypeFilter(
  value: string,
): value is ConnectionTypeFilter {
  return (
    value === ALL_TYPES_FILTER ||
    Object.values<string>(CONNECTION_TYPE).includes(value)
  );
}

export function isConnectionStatusFilter(
  value: string,
): value is ConnectionStatusFilter {
  return (
    value === ALL_STATUSES_FILTER ||
    Object.values<string>(CONNECTION_STATUS).includes(value)
  );
}

/** True for a well-formed https:// URL. */
export function isSigningKeyType(value: string): value is SigningKeyType {
  return SIGNING_KEY_TYPE_OPTIONS.some((option) => option.value === value);
}

export function isHttpsUrl(value: string): boolean {
  try {
    return new URL(value.trim()).protocol === 'https:';
  } catch {
    return false;
  }
}

/** Splits a space-separated OAuth scope string into a de-duplicated list. */
export function parseScopes(value: string): string[] {
  return [...new Set(value.trim().split(/\s+/).filter(Boolean))];
}

/** Active and inactive connections are live and can be switched; drafts can't. */
export function isToggleableStatus(status: ConnectionStatus): boolean {
  return (
    status === CONNECTION_STATUS.ACTIVE || status === CONNECTION_STATUS.INACTIVE
  );
}

/** Case-insensitive match on name, ID or source, narrowed by type and status. */
export function filterConnections(
  connections: Connection[],
  search: string,
  typeFilter: ConnectionTypeFilter,
  statusFilter: ConnectionStatusFilter,
): Connection[] {
  const query = search.trim().toLowerCase();

  return connections.filter((connection) => {
    if (typeFilter !== ALL_TYPES_FILTER && connection.type !== typeFilter) {
      return false;
    }
    if (
      statusFilter !== ALL_STATUSES_FILTER &&
      connection.status !== statusFilter
    ) {
      return false;
    }
    if (!query) {
      return true;
    }
    return [
      connection.name,
      connection.id,
      CONNECTION_SOURCE_LABELS[connection.source],
    ].some((value) => value.toLowerCase().includes(query));
  });
}

/** Case-insensitive match on name, description or any capability. */
export function filterEhrSystems(
  ehrSystems: EhrSystem[],
  search: string,
): EhrSystem[] {
  const query = search.trim().toLowerCase();
  if (!query) {
    return ehrSystems;
  }

  return ehrSystems.filter((ehrSystem) =>
    [ehrSystem.name, ehrSystem.description, ...ehrSystem.capabilities].some(
      (value) => value.toLowerCase().includes(query),
    ),
  );
}
