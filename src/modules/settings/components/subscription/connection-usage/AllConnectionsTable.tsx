import type { JSX } from 'react';
import { DataTable, type DataTableColumn } from '@/components/common';
import {
  ConnectionSourceCell,
  ConnectionStatusBadge,
  ConnectionTypeBadge,
  type Connection,
} from '@/modules/connections';
import type { AllConnectionsTableProps } from '../../../@types';

const COLUMNS: Array<DataTableColumn<Connection>> = [
  {
    key: 'name',
    header: 'Connection name',
    headClassName: 'w-2/5',
    skeletonClassName: 'w-40',
    cell: (connection) => (
      <span className="font-medium text-foreground">{connection.name}</span>
    ),
  },
  {
    key: 'source',
    header: 'Source',
    skeletonClassName: 'w-24',
    cell: (connection) => <ConnectionSourceCell source={connection.source} />,
  },
  {
    key: 'type',
    header: 'Type',
    skeletonClassName: 'w-20',
    cell: (connection) => <ConnectionTypeBadge type={connection.type} />,
  },
  {
    key: 'status',
    header: 'Status',
    skeletonClassName: 'w-16',
    cell: (connection) => <ConnectionStatusBadge status={connection.status} />,
  },
];

/** Every connection from the Connections screen, read-only. */
export function AllConnectionsTable({
  connections,
  emptyState,
}: AllConnectionsTableProps): JSX.Element {
  return (
    <DataTable
      columns={COLUMNS}
      rows={connections}
      getRowKey={(connection) => connection.id}
      emptyState={emptyState}
      ariaLabel="All connections"
    />
  );
}
