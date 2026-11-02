import { useCallback, useEffect, useState, type JSX } from 'react';
import { CircleAlert, ShieldAlert } from 'lucide-react';
import { toast } from 'sonner';
import { EmptyState } from '@/components/common';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { logger } from '@/utils/logger';
import type { HelixAiSettingsState, LlmConfigFormValues } from '../../@types';
import { HELIX_SECURITY_NOTICE, SETTINGS_SECTION } from '../../constants';
import {
  apiDtoToHelixAiSettings,
  apiDtoToLlmConfig,
  getHelixAiSettings,
  llmFormValuesToPayload,
  saveLlmProviderConfig,
  updateHelixEnabled,
} from '../../service';
import { getSettingsSection } from '../../utils';
import { SettingsCallout, SettingsPageHeader } from '../shared';
import { EditLlmProviderDialog } from './EditLlmProviderDialog';
import { HelixAgentCard } from './HelixAgentCard';
import { LlmProviderCard } from './LlmProviderCard';

/** Settings → Helix AI: turn Helix on/off and configure its LLM provider. */
export function HelixAiSettings(): JSX.Element {
  const [state, setState] = useState<HelixAiSettingsState>({
    status: 'loading',
  });
  const [isSavingEnabled, setIsSavingEnabled] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const loadSettings = useCallback(async (): Promise<void> => {
    setState({ status: 'loading' });
    try {
      const dto = await getHelixAiSettings();
      setState({ status: 'success', data: apiDtoToHelixAiSettings(dto) });
    } catch (error) {
      logger.error('Loading Helix AI settings failed', { error });
      setState({ status: 'error' });
    }
  }, []);

  useEffect(() => {
    void loadSettings();
  }, [loadSettings]);

  const setEnabled = (isEnabled: boolean): void => {
    setState((current) =>
      current.status === 'success'
        ? { ...current, data: { ...current.data, isEnabled } }
        : current,
    );
  };

  // Flips immediately, then saves; a failed save puts the switch back.
  const handleToggleEnabled = async (enabled: boolean): Promise<void> => {
    setEnabled(enabled);
    setIsSavingEnabled(true);
    try {
      await updateHelixEnabled(enabled);
      toast.success(enabled ? 'Helix turned on' : 'Helix turned off', {
        description: enabled
          ? 'Your team can generate and debug workflows with AI.'
          : 'Your provider configuration is kept for when you turn it back on.',
      });
    } catch (error) {
      logger.error('Updating Helix status failed', { error });
      setEnabled(!enabled);
      toast.error('Couldn’t save your change', {
        description: 'Please try again.',
      });
    } finally {
      setIsSavingEnabled(false);
    }
  };

  // Rejections propagate so the dialog can show its inline error.
  const handleSaveLlmConfig = async (
    values: LlmConfigFormValues,
  ): Promise<void> => {
    const llm = apiDtoToLlmConfig(
      await saveLlmProviderConfig(llmFormValuesToPayload(values)),
    );
    setState((current) =>
      current.status === 'success'
        ? { ...current, data: { ...current.data, llm } }
        : current,
    );
    setIsEditOpen(false);
    toast.success('Helix configuration saved');
  };

  const renderBody = (): JSX.Element => {
    if (state.status === 'loading') {
      return (
        <div className="space-y-4" aria-busy>
          <Skeleton className="h-36 rounded-xl bg-muted" />
          <Skeleton className="h-64 rounded-xl bg-muted" />
        </div>
      );
    }

    if (state.status === 'error') {
      return (
        <div className="rounded-xl border">
          <EmptyState
            tone="destructive"
            icon={CircleAlert}
            title="Helix settings didn’t load"
            description="We couldn’t load your Helix AI settings. Please try again."
            action={
              <Button
                variant="outline"
                size="sm"
                onClick={() => void loadSettings()}
              >
                Try again
              </Button>
            }
          />
        </div>
      );
    }

    const { data } = state;
    return (
      <div className="space-y-4">
        <HelixAgentCard
          isEnabled={data.isEnabled}
          isSaving={isSavingEnabled}
          onToggle={(enabled) => void handleToggleEnabled(enabled)}
        />
        <LlmProviderCard
          config={data.llm}
          isHelixEnabled={data.isEnabled}
          onEdit={() => setIsEditOpen(true)}
        />
        <EditLlmProviderDialog
          key={data.llm.updatedAt}
          open={isEditOpen}
          onOpenChange={setIsEditOpen}
          config={data.llm}
          onSave={handleSaveLlmConfig}
        />
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <SettingsPageHeader
        section={getSettingsSection(SETTINGS_SECTION.HELIX_AI)}
      />
      {renderBody()}
      <SettingsCallout title="Security notice" icon={ShieldAlert}>
        <p>{HELIX_SECURITY_NOTICE}</p>
      </SettingsCallout>
    </div>
  );
}
