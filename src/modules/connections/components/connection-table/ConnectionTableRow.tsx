import type { JSX } from 'react';
import { TableCell, TableRow } from '@/components/ui/table';
import type { ConnectionTableRowProps } from '../../@types';
import { CELL_CLASS_NAME } from './columns';
import { ConnectionActionsCell } from './ConnectionActionsCell';
import { ConnectionIdCell } from './ConnectionIdCell';
import { ConnectionSourceCell } from './ConnectionSourceCell';
import { ConnectionStatusCell } from './ConnectionStatusCell';
import { ConnectionTypeBadge } from './ConnectionTypeBadge';

export function ConnectionTableRow({
  connection,
  onManage,
  onToggleActive,
  onTest,
}: ConnectionTableRowProps): JSX.Element {
  return (
    <TableRow className="hover:bg-muted/40">
      <TableCell className={CELL_CLASS_NAME}>
        <ConnectionIdCell id={connection.id} />
      </TableCell>
      <TableCell className={CELL_CLASS_NAME}>
        <ConnectionSourceCell source={connection.source} />
      </TableCell>
      <TableCell className={CELL_CLASS_NAME}>
        <span
          title={connection.name}
          className="block truncate font-medium text-foreground"
        >
          {connection.name}
        </span>
      </TableCell>
      <TableCell className={CELL_CLASS_NAME}>
        <ConnectionTypeBadge type={connection.type} />
      </TableCell>
      <TableCell className={CELL_CLASS_NAME}>
        <ConnectionStatusCell
          connection={connection}
          onToggleActive={onToggleActive}
        />
      </TableCell>
      <TableCell className={CELL_CLASS_NAME}>
        <ConnectionActionsCell
          connection={connection}
          onManage={onManage}
          onTest={onTest}
        />
      </TableCell>
    </TableRow>
  );
}
