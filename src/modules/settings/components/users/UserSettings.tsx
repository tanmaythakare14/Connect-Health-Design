import { useCallback, useEffect, useState, type JSX } from 'react';
import { CircleAlert, Trash2, UserPlus, Users } from 'lucide-react';
import { toast } from 'sonner';
import { ConfirmDialog, EmptyState } from '@/components/common';
import { Button } from '@/components/ui/button';
import { logger } from '@/utils/logger';
import type {
  AddUserFormValues,
  AdminUser,
  AdminUserListState,
} from '../../@types';
import { NEW_USER_HIGHLIGHT_MS, SETTINGS_SECTION } from '../../constants';
import {
  apiDtoToAdminUser,
  createAdminUser,
  deleteAdminUser,
  formValuesToCreateAdminUserPayload,
  listAdminUsers,
} from '../../service';
import { getSettingsSection } from '../../utils';
import { SettingsPageHeader } from '../shared';
import { AddUserDialog } from './AddUserDialog';
import { UserTable } from './UserTable';

const NO_NEW_USERS: ReadonlySet<string> = new Set();

const displayNameOf = (user: AdminUser): string => user.name ?? user.username;

/** Settings → Users: adding and removing admins. */
export function UserSettings(): JSX.Element {
  const [listState, setListState] = useState<AdminUserListState>({
    status: 'loading',
  });
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newUserIds, setNewUserIds] =
    useState<ReadonlySet<string>>(NO_NEW_USERS);
  // Stays set after close so the dialog text doesn't vanish mid-animation.
  const [deleteTarget, setDeleteTarget] = useState<AdminUser | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const loadUsers = useCallback(async (): Promise<void> => {
    setListState({ status: 'loading' });
    try {
      const dtos = await listAdminUsers();
      setListState({ status: 'success', data: dtos.map(apiDtoToAdminUser) });
    } catch (error) {
      logger.error('Loading users failed', { error });
      setListState({ status: 'error' });
    }
  }, []);

  useEffect(() => {
    void loadUsers();
  }, [loadUsers]);

  const updateUsers = (update: (users: AdminUser[]) => AdminUser[]): void => {
    setListState((current) =>
      current.status === 'success'
        ? { ...current, data: update(current.data) }
        : current,
    );
  };

  // Rejections propagate so the dialog can show its inline error.
  const handleAdd = async (values: AddUserFormValues): Promise<void> => {
    const created = apiDtoToAdminUser(
      await createAdminUser(formValuesToCreateAdminUserPayload(values)),
    );
    updateUsers((users) => [...users, created]);
    setIsAddOpen(false);
    setNewUserIds(new Set([created.id]));
    setTimeout(() => setNewUserIds(NO_NEW_USERS), NEW_USER_HIGHLIGHT_MS);
    toast.success('User added', {
      description: `“${displayNameOf(created)}” can now sign in with their temporary password.`,
    });
  };

  const handleDelete = (user: AdminUser): void => {
    setDeleteTarget(user);
    setIsDeleteOpen(true);
  };

  // Rejections propagate so ConfirmDialog can show its inline error.
  const handleConfirmDelete = async (): Promise<void> => {
    if (!deleteTarget) return;
    await deleteAdminUser(deleteTarget.id);
    updateUsers((users) => users.filter((user) => user.id !== deleteTarget.id));
    toast.success('User deleted', {
      description: `“${displayNameOf(deleteTarget)}” no longer has console access.`,
    });
  };

  const users = listState.status === 'success' ? listState.data : [];

  return (
    <div className="space-y-6">
      <SettingsPageHeader
        section={getSettingsSection(SETTINGS_SECTION.USERS)}
        actions={
          <Button onClick={() => setIsAddOpen(true)}>
            <UserPlus aria-hidden />
            Add user
          </Button>
        }
      />

      <section
        aria-labelledby="settings-admin-users-heading"
        className="space-y-3"
      >
        <div className="flex items-baseline gap-2">
          <h3
            id="settings-admin-users-heading"
            className="text-sm font-semibold text-foreground"
          >
            Admin users
          </h3>
          {listState.status === 'success' && (
            <span className="text-sm text-muted-foreground tabular-nums">
              {users.length}
            </span>
          )}
        </div>

        {listState.status === 'error' ? (
          <div className="rounded-xl border">
            <EmptyState
              tone="destructive"
              icon={CircleAlert}
              title="Users didn’t load"
              description="We couldn’t load the user list. Please try again."
              action={
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => void loadUsers()}
                >
                  Try again
                </Button>
              }
            />
          </div>
        ) : (
          <UserTable
            users={users}
            isLoading={listState.status === 'loading'}
            newUserIds={newUserIds}
            onDelete={handleDelete}
            emptyState={
              <EmptyState
                icon={Users}
                title="No other users yet"
                description="Add a teammate to give them access to the management console."
                action={
                  <Button size="sm" onClick={() => setIsAddOpen(true)}>
                    <UserPlus aria-hidden />
                    Add user
                  </Button>
                }
              />
            }
          />
        )}
      </section>

      <AddUserDialog
        open={isAddOpen}
        onOpenChange={setIsAddOpen}
        onAdd={handleAdd}
      />

      <ConfirmDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        destructive
        title="Delete user"
        description={
          <>
            Are you sure you want to delete{' '}
            <span className="font-semibold text-foreground">
              {deleteTarget ? displayNameOf(deleteTarget) : ''}
            </span>
            ? This can’t be undone.
          </>
        }
        warning={{
          title: 'Warning',
          description:
            'Deleting this user will immediately revoke their access to the management console.',
        }}
        confirmationText={deleteTarget?.username}
        confirmLabel="Delete user"
        confirmIcon={Trash2}
        pendingLabel="Deleting…"
        onConfirm={handleConfirmDelete}
        errorMessage="We couldn’t delete the user. Please try again."
      />
    </div>
  );
}
