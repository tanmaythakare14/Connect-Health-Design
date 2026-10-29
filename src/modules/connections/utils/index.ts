import type { Connection, ConnectionTypeFilter, EhrSystem } from '../@types';
import {
  ALL_TYPES_FILTER,
  CONNECTION_SOURCE_LABELS,
  CONNECTION_TYPE,
} from '../constants';

export function isConnectionTypeFilter(
  value: string,
): value is ConnectionTypeFilter {
  return (
    value === ALL_TYPES_FILTER ||
    Object.values<string>(CONNECTION_TYPE).includes(value)
  );
}

/** Case-insensitive match on name, ID or source, narrowed by type. */
export function filterConnections(
  connections: Connection[],
  search: string,
  typeFilter: ConnectionTypeFilter,
): Connection[] {
  const query = search.trim().toLowerCase();

  return connections.filter((connection) => {
    if (typeFilter !== ALL_TYPES_FILTER && connection.type !== typeFilter) {
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
