import { useCallback, useEffect, useState, type JSX } from 'react';
import { toast } from 'sonner';
import { ConfirmDialog } from '@/components/common';
import { logger } from '@/utils/logger';
import type { TwoFactorSettingsState } from '../../@types';
import { SETTINGS_SECTION } from '../../constants';
import {
  apiDtoToTwoFactorSettings,
  getTwoFactorSettings,
  resetTwoFactor,
  updateRequireTwoFactor,
} from '../../service';
import { getSettingsSection } from '../../utils';
import { SettingsPageHeader } from '../shared';
import { ChangePasswordCard } from './ChangePasswordCard';
import { TwoFactorCard } from './TwoFactorCard';

/** Settings → Security: the signed-in user's password and 2FA. */
export function SecuritySettings(): JSX.Element {
  const [twoFactorState, setTwoFactorState] = useState<TwoFactorSettingsState>({
    status: 'loading',
  });
  const [isSavingTwoFactor, setIsSavingTwoFactor] = useState(false);
  const [isResetTwoFactorOpen, setIsResetTwoFactorOpen] = useState(false);

  const loadTwoFactor = useCallback(async (): Promise<void> => {
    setTwoFactorState({ status: 'loading' });
    try {
      const dto = await getTwoFactorSettings();
      setTwoFactorState({
        status: 'success',
        data: apiDtoToTwoFactorSettings(dto),
      });
    } catch (error) {
      logger.error('Loading two-factor settings failed', { error });
      setTwoFactorState({ status: 'error' });
    }
  }, []);

  useEffect(() => {
    void loadTwoFactor();
  }, [loadTwoFactor]);

  const setRequireOnLogin = (requireOnLogin: boolean): void => {
    setTwoFactorState((current) =>
      current.status === 'success'
        ? { ...current, data: { ...current.data, requireOnLogin } }
        : current,
    );
  };

  // Flips immediately, then saves; a failed save puts the switch back.
  const handleToggleRequire = async (required: boolean): Promise<void> => {
    setRequireOnLogin(required);
    setIsSavingTwoFactor(true);
    try {
      await updateRequireTwoFactor(required);
      toast.success(
        required ? '2FA required on login' : '2FA no longer required',
        {
          description: required
            ? 'You’ll be asked for a code each time you sign in.'
            : 'You can sign in with just your password.',
        },
      );
    } catch (error) {
      logger.error('Updating 2FA requirement failed', { error });
      setRequireOnLogin(!required);
      toast.error('Couldn’t save your change', {
        description: 'Please try again.',
      });
    } finally {
      setIsSavingTwoFactor(false);
    }
  };

  // Rejections propagate so ConfirmDialog can show its inline error.
  const handleConfirmResetTwoFactor = async (): Promise<void> => {
    await resetTwoFactor();
    toast.success('2FA reset started', {
      description:
        'Scan the new code with your authenticator app at your next sign-in.',
    });
  };

  return (
    <div className="space-y-6">
      <SettingsPageHeader
        section={getSettingsSection(SETTINGS_SECTION.SECURITY)}
      />

      {/* Stacked, half the container's width on wide screens */}
      <div className="space-y-6 xl:w-1/2">
        <TwoFactorCard
          state={twoFactorState}
          isSaving={isSavingTwoFactor}
          onToggleRequire={(required) => void handleToggleRequire(required)}
          onReset={() => setIsResetTwoFactorOpen(true)}
          onRetry={() => void loadTwoFactor()}
        />

        <ChangePasswordCard />
      </div>

      <ConfirmDialog
        open={isResetTwoFactorOpen}
        onOpenChange={setIsResetTwoFactorOpen}
        title="Reset two-factor authentication?"
        description="You’ll set up a new authenticator app at your next sign-in. Your current one keeps working until the new one is verified."
        confirmLabel="Reset 2FA"
        pendingLabel="Resetting…"
        onConfirm={handleConfirmResetTwoFactor}
        errorMessage="We couldn’t reset 2FA. Please try again."
      />
    </div>
  );
}
