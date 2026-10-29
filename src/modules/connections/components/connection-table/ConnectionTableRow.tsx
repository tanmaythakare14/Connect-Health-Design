import type { JSX } from 'react';
import { Button } from '@/components/ui/button';
import { TableCell, TableRow } from '@/components/ui/table';
import type { ConnectionTableRowProps } from '../../@types';
import { CELL_CLASS_NAME } from './columns';
import { ConnectionIdCell } from './ConnectionIdCell';
import { ConnectionSourceCell } from './ConnectionSourceCell';
import { ConnectionStatusBadge } from './ConnectionStatusBadge';
import { ConnectionTypeBadge } from './ConnectionTypeBadge';

export function ConnectionTableRow({
  connection,
  onManage,
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
        <ConnectionStatusBadge status={connection.status} />
      </TableCell>
      <TableCell className={CELL_CLASS_NAME}>
        {/* Tertiary action: text-weight button, no fill or border.
            -ml-3 cancels the button's own padding so "Manage" lines up with the header. */}
        <Button
          variant="ghost"
          size="sm"
          className="-ml-3 text-primary hover:bg-accent hover:text-primary"
          onClick={() => onManage(connection)}
          aria-label={`Manage ${connection.name}`}
        >
          Manage
        </Button>
      </TableCell>
    </TableRow>
  );
}
