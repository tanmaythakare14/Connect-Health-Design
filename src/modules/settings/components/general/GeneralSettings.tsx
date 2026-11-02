import { useCallback, useEffect, useState, type JSX } from 'react';
import { CircleAlert } from 'lucide-react';
import { toast } from 'sonner';
import { EmptyState } from '@/components/common';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { logger } from '@/utils/logger';
import type { GeneralSettingsState } from '../../@types';
import { SETTINGS_SECTION } from '../../constants';
import {
  apiDtoToGeneralSettings,
  getGeneralSettings,
  updateUsageDiagnostics,
} from '../../service';
import { getSettingsSection } from '../../utils';
import { SettingsPageHeader } from '../shared';
import { DeploymentCard } from './DeploymentCard';
import { UsageDiagnosticsCard } from './UsageDiagnosticsCard';

const SKELETON_CARD_COUNT = 2;

/** Settings → General: deployment details and usage diagnostics. */
export function GeneralSettings(): JSX.Element {
  const [state, setState] = useState<GeneralSettingsState>({
    status: 'loading',
  });
  const [isSavingDiagnostics, setIsSavingDiagnostics] = useState(false);

  const loadSettings = useCallback(async (): Promise<void> => {
    setState({ status: 'loading' });
    try {
      const dto = await getGeneralSettings();
      setState({ status: 'success', data: apiDtoToGeneralSettings(dto) });
    } catch (error) {
      logger.error('Loading general settings failed', { error });
      setState({ status: 'error' });
    }
  }, []);

  useEffect(() => {
    void loadSettings();
  }, [loadSettings]);

  const setDiagnostics = (enabled: boolean): void => {
    setState((current) =>
      current.status === 'success'
        ? {
            ...current,
            data: { ...current.data, usageDiagnosticsEnabled: enabled },
          }
        : current,
    );
  };

  // Flips immediately, then saves; a failed save puts the switch back.
  const handleToggleDiagnostics = async (enabled: boolean): Promise<void> => {
    setDiagnostics(enabled);
    setIsSavingDiagnostics(true);
    try {
      await updateUsageDiagnostics(enabled);
      toast.success(
        enabled
          ? 'Usage diagnostics turned on'
          : 'Usage diagnostics turned off',
      );
    } catch (error) {
      logger.error('Updating usage diagnostics failed', { error });
      setDiagnostics(!enabled);
      toast.error('Couldn’t save your change', {
        description: 'Please try again.',
      });
    } finally {
      setIsSavingDiagnostics(false);
    }
  };

  const renderBody = (): JSX.Element => {
    if (state.status === 'loading') {
      return (
        <div className="space-y-4" aria-busy>
          {Array.from({ length: SKELETON_CARD_COUNT }, (_, index) => (
            <div key={index} className="space-y-4 rounded-xl border p-5">
              <Skeleton className="h-5 w-40 bg-muted" />
              <Skeleton className="h-4 w-full max-w-lg bg-muted" />
              <Skeleton className="h-9 w-full bg-muted" />
            </div>
          ))}
        </div>
      );
    }

    if (state.status === 'error') {
      return (
        <div className="rounded-xl border">
          <EmptyState
            tone="destructive"
            icon={CircleAlert}
            title="Settings didn’t load"
            description="We couldn’t load your general settings. Please try again."
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
        <DeploymentCard
          deploymentId={data.deploymentId}
          environment={data.environment}
          version={data.version}
        />
        <UsageDiagnosticsCard
          isEnabled={data.usageDiagnosticsEnabled}
          isSaving={isSavingDiagnostics}
          onToggle={(enabled) => void handleToggleDiagnostics(enabled)}
        />
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <SettingsPageHeader
        section={getSettingsSection(SETTINGS_SECTION.GENERAL)}
      />
      {renderBody()}
    </div>
  );
}
