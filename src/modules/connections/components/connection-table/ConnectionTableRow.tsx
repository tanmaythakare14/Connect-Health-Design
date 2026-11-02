import type { JSX } from 'react';
import { TableCell, TableRow } from '@/components/ui/table';
import type { ConnectionTableRowProps } from '../../@types';
import { ConnectionActionsCell } from './ConnectionActionsCell';
import { ConnectionIdCell } from './ConnectionIdCell';
import { ConnectionSourceCell } from './ConnectionSourceCell';
import { ConnectionStatusCell } from './ConnectionStatusCell';
import { ConnectionTypeBadge } from './ConnectionTypeBadge';

export function ConnectionTableRow({
  connection,
  cellClassName,
  onManage,
  onToggleActive,
  onTest,
}: ConnectionTableRowProps): JSX.Element {
  return (
    <TableRow className="hover:bg-muted/40">
      <TableCell className={cellClassName}>
        <ConnectionIdCell id={connection.id} />
      </TableCell>
      <TableCell className={cellClassName}>
        <ConnectionSourceCell source={connection.source} />
      </TableCell>
      <TableCell className={cellClassName}>
        <span
          title={connection.name}
          className="block truncate font-medium text-foreground"
        >
          {connection.name}
        </span>
      </TableCell>
      <TableCell className={cellClassName}>
        <ConnectionTypeBadge type={connection.type} />
      </TableCell>
      <TableCell className={cellClassName}>
        <ConnectionStatusCell
          connection={connection}
          onToggleActive={onToggleActive}
        />
      </TableCell>
      <TableCell className={cellClassName}>
        <ConnectionActionsCell
          connection={connection}
          onManage={onManage}
          onTest={onTest}
        />
      </TableCell>
    </TableRow>
  );
}
