import type { JSX } from 'react';
import { Switch } from '@/components/ui/switch';
import type { ConnectionStatusCellProps } from '../../@types';
import { CONNECTION_STATUS } from '../../constants';
import { isToggleableStatus } from '../../utils';
import { ConnectionStatusBadge } from './ConnectionStatusBadge';

/** On/off switch for live (active / inactive) connections, then the status badge. */
export function ConnectionStatusCell({
  connection,
  onToggleActive,
}: ConnectionStatusCellProps): JSX.Element {
  const { name, status } = connection;
  const isActive = status === CONNECTION_STATUS.ACTIVE;

  return (
    <div className="flex items-center gap-3">
      {isToggleableStatus(status) ? (
        <Switch
          checked={isActive}
          onCheckedChange={() => onToggleActive(connection)}
          aria-label={isActive ? `Deactivate ${name}` : `Activate ${name}`}
        />
      ) : (
        // Same width as the switch, so badges line up down the column.
        <span aria-hidden className="w-8 shrink-0" />
      )}
      <ConnectionStatusBadge status={status} />
    </div>
  );
}
