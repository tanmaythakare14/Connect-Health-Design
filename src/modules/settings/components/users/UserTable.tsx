import type { JSX } from 'react';
import { Trash } from 'lucide-react';
import { DataTable, type DataTableColumn } from '@/components/common';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import type { AdminUser, UserTableProps } from '../../@types';
import { USER_ROLE_LABELS } from '../../constants';
import { getUserInitials } from '../../utils';
import { UserStatusText } from './UserStatusText';

const EMPTY_VALUE = <span className="text-muted-foreground">—</span>;

/** Console users on the shared DataTable, with text statuses and row actions. */
export function UserTable({
  users,
  isLoading,
  newUserIds,
  emptyState,
  onDelete,
}: UserTableProps): JSX.Element {
  const columns: Array<DataTableColumn<AdminUser>> = [
    {
      key: 'name',
      header: 'Name',
      headClassName: 'w-1/5',
      skeletonClassName: 'w-36',
      cell: (user) => (
        <div className="flex min-w-0 items-center gap-3">
          <Avatar className="size-8 shrink-0">
            <AvatarFallback className="bg-accent text-xs font-semibold text-primary">
              {getUserInitials(user)}
            </AvatarFallback>
          </Avatar>
          {user.name ? (
            <span
              title={user.name}
              className="truncate font-medium text-foreground"
            >
              {user.name}
            </span>
          ) : (
            <span className="text-muted-foreground italic">No name</span>
          )}
        </div>
      ),
    },
    {
      key: 'username',
      header: 'Username',
      headClassName: 'w-1/6',
      skeletonClassName: 'w-28',
      cell: (user) => (
        <code
          title={user.username}
          className="block truncate font-mono text-xs text-foreground"
        >
          {user.username}
        </code>
      ),
    },
    {
      key: 'email',
      header: 'Email',
      skeletonClassName: 'w-44',
      cell: (user) =>
        user.email ? (
          <span
            data-pii
            title={user.email}
            className="block truncate text-muted-foreground"
          >
            {user.email}
          </span>
        ) : (
          EMPTY_VALUE
        ),
    },
    {
      key: 'role',
      header: 'Role',
      skeletonClassName: 'w-14',
      cell: (user) => (
        <span className="text-sm text-foreground">
          {USER_ROLE_LABELS[user.role]}
        </span>
      ),
    },
    {
      key: 'mustReset',
      header: 'Must reset',
      skeletonClassName: 'w-12',
      cell: (user) =>
        user.mustResetPassword ? (
          <UserStatusText tone="warning" label="Yes" />
        ) : (
          <UserStatusText tone="neutral" label="No" />
        ),
    },
    {
      key: 'twoFactor',
      header: '2FA',
      skeletonClassName: 'w-20',
      cell: (user) =>
        user.twoFactorEnabled ? (
          <UserStatusText tone="positive" label="Enabled" />
        ) : (
          <UserStatusText tone="warning" label="Not set up" />
        ),
    },
    {
      key: 'actions',
      header: <span className="sr-only">Actions</span>,
      headClassName: 'w-16',
      cellClassName: 'text-right',
      skeletonClassName: 'ml-auto w-7',
      cell: (user) => {
        const displayName = user.name ?? user.username;
        return (
          <div className="flex items-center justify-end">
            <Tooltip>
              {/* Span trigger so the tooltip still shows on a disabled button */}
              <TooltipTrigger asChild>
                <span tabIndex={user.isBuiltIn ? 0 : -1}>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(user)}
                    disabled={user.isBuiltIn}
                    aria-label={`Delete ${displayName}`}
                    className="size-8 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash aria-hidden />
                  </Button>
                </span>
              </TooltipTrigger>
              <TooltipContent>
                {user.isBuiltIn
                  ? 'The built-in administrator can’t be deleted'
                  : 'Delete user'}
              </TooltipContent>
            </Tooltip>
          </div>
        );
      },
    },
  ];

  return (
    <DataTable
      ariaLabel="Admin users"
      columns={columns}
      rows={users}
      getRowKey={(user) => user.id}
      isLoading={isLoading}
      emptyState={emptyState}
      rowClassName={(user) =>
        newUserIds.has(user.id)
          ? 'bg-accent/50 animate-in fade-in-0 slide-in-from-top-1'
          : undefined
      }
    />
  );
}
