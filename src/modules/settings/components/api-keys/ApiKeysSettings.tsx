import { useCallback, useEffect, useState, type JSX } from 'react';
import { CircleAlert, KeyRound, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { ConfirmDialog, EmptyState } from '@/components/common';
import { Button } from '@/components/ui/button';
import { logger } from '@/utils/logger';
import type {
  ApiKey,
  ApiKeyListState,
  CreateApiKeyFormValues,
} from '../../@types';
import { NEW_API_KEY_HIGHLIGHT_MS, SETTINGS_SECTION } from '../../constants';
import {
  apiDtoToApiKey,
  createApiKey,
  deleteApiKey,
  formValuesToCreateApiKeyPayload,
  listApiKeys,
  updateApiKeyStatus,
} from '../../service';
import { getSettingsSection } from '../../utils';
import { SettingsPageHeader } from '../shared';
import { ApiKeySecurityTips } from './ApiKeySecurityTips';
import { ApiKeyTable } from './ApiKeyTable';
import { CreateApiKeyDialog } from './CreateApiKeyDialog';

const NO_NEW_KEYS: ReadonlySet<string> = new Set();

/** Settings → API Keys: list, create, turn on/off and delete keys. */
export function ApiKeysSettings(): JSX.Element {
  const [listState, setListState] = useState<ApiKeyListState>({
    status: 'loading',
  });
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newKeyIds, setNewKeyIds] = useState<ReadonlySet<string>>(NO_NEW_KEYS);
  // The key stays set after close so the dialog text doesn't vanish mid-animation.
  const [deleteTarget, setDeleteTarget] = useState<ApiKey | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const loadApiKeys = useCallback(async (): Promise<void> => {
    setListState({ status: 'loading' });
    try {
      const dtos = await listApiKeys();
      setListState({ status: 'success', data: dtos.map(apiDtoToApiKey) });
    } catch (error) {
      logger.error('Loading API keys failed', { error });
      setListState({ status: 'error' });
    }
  }, []);

  useEffect(() => {
    void loadApiKeys();
  }, [loadApiKeys]);

  const updateKeys = (update: (keys: ApiKey[]) => ApiKey[]): void => {
    setListState((current) =>
      current.status === 'success'
        ? { ...current, data: update(current.data) }
        : current,
    );
  };

  const setKeyActive = (id: string, isActive: boolean): void => {
    updateKeys((keys) =>
      keys.map((item) => (item.id === id ? { ...item, isActive } : item)),
    );
  };

  // Flips immediately, then saves; a failed save puts the switch back.
  const handleToggleActive = (apiKey: ApiKey): void => {
    const nextActive = !apiKey.isActive;
    setKeyActive(apiKey.id, nextActive);
    updateApiKeyStatus(apiKey.id, nextActive)
      .then(() => {
        toast.success(
          nextActive ? 'API key activated' : 'API key deactivated',
          {
            description: nextActive
              ? `“${apiKey.name}” can authenticate requests again.`
              : `Requests signed with “${apiKey.name}” will be rejected.`,
          },
        );
      })
      .catch((error: unknown) => {
        logger.error('Updating API key status failed', {
          apiKeyId: apiKey.id,
          error,
        });
        setKeyActive(apiKey.id, apiKey.isActive);
        toast.error('Couldn’t update the key', {
          description: 'Please try again.',
        });
      });
  };

  // Rejections propagate so the dialog can show its inline error.
  const handleCreate = async (
    values: CreateApiKeyFormValues,
  ): Promise<void> => {
    const created = apiDtoToApiKey(
      await createApiKey(formValuesToCreateApiKeyPayload(values)),
    );
    updateKeys((keys) => [...keys, created]);
    setIsCreateOpen(false);
    setNewKeyIds(new Set([created.id]));
    setTimeout(() => setNewKeyIds(NO_NEW_KEYS), NEW_API_KEY_HIGHLIGHT_MS);
    toast.success('API key created', {
      description: `“${created.name}” is active. Copy it from the table and store it safely.`,
    });
  };

  const handleDelete = (apiKey: ApiKey): void => {
    setDeleteTarget(apiKey);
    setIsDeleteOpen(true);
  };

  // Rejections propagate so ConfirmDialog can show its inline error.
  const handleConfirmDelete = async (): Promise<void> => {
    if (!deleteTarget) return;
    await deleteApiKey(deleteTarget.id);
    updateKeys((keys) => keys.filter((item) => item.id !== deleteTarget.id));
    toast.success('API key deleted', {
      description: `“${deleteTarget.name}” can no longer be used.`,
    });
  };

  return (
    <div className="space-y-6">
      <SettingsPageHeader
        section={getSettingsSection(SETTINGS_SECTION.API_KEYS)}
        actions={
          <Button onClick={() => setIsCreateOpen(true)}>
            <Plus aria-hidden />
            Create API Key
          </Button>
        }
      />

      {listState.status === 'error' ? (
        <div className="rounded-xl border">
          <EmptyState
            tone="destructive"
            icon={CircleAlert}
            title="API keys didn’t load"
            description="We couldn’t load your API keys. Please try again."
            action={
              <Button
                variant="outline"
                size="sm"
                onClick={() => void loadApiKeys()}
              >
                Try again
              </Button>
            }
          />
        </div>
      ) : (
        <ApiKeyTable
          apiKeys={listState.status === 'success' ? listState.data : []}
          isLoading={listState.status === 'loading'}
          newKeyIds={newKeyIds}
          onToggleActive={handleToggleActive}
          onDelete={handleDelete}
          emptyState={
            <EmptyState
              icon={KeyRound}
              title="No API keys yet"
              description="Create a key to let your systems call ConnectHealth."
              action={
                <Button size="sm" onClick={() => setIsCreateOpen(true)}>
                  <Plus aria-hidden />
                  Create API Key
                </Button>
              }
            />
          }
        />
      )}

      <ApiKeySecurityTips />

      <CreateApiKeyDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onCreate={handleCreate}
      />

      <ConfirmDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        destructive
        title="Delete API key?"
        description={
          <>
            This permanently deletes{' '}
            <span className="font-medium text-foreground">
              “{deleteTarget?.name}”
            </span>
            . Anything still using it will stop working. You can’t undo this.
          </>
        }
        confirmLabel="Delete key"
        pendingLabel="Deleting…"
        onConfirm={handleConfirmDelete}
        errorMessage="We couldn’t delete the key. Please try again."
      />
    </div>
  );
}
