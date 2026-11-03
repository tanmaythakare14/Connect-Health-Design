import type { JSX } from 'react';
import { CircleAlert, LogIn, RefreshCw, ShieldCheck } from 'lucide-react';
import { EmptyState } from '@/components/common';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import type { TwoFactorCardProps } from '../../@types';
import { SettingsCard, StatusPill } from '../shared';

const SWITCH_ID = 'settings-require-2fa';

/** The signed-in user's 2FA: require it at sign-in, or set up a new app. */
export function TwoFactorCard({
  state,
  isSaving,
  onToggleRequire,
  onReset,
  onRetry,
}: TwoFactorCardProps): JSX.Element {
  const renderBody = (): JSX.Element => {
    if (state.status === 'loading') {
      return (
        <div className="space-y-4" aria-busy>
          <Skeleton className="h-10 rounded-lg bg-muted" />
          <Skeleton className="h-10 rounded-lg bg-muted" />
        </div>
      );
    }

    if (state.status === 'error') {
      return (
        <EmptyState
          tone="destructive"
          icon={CircleAlert}
          title="Two-factor settings didn’t load"
          description="We couldn’t load your two-factor settings. Please try again."
          action={
            <Button variant="outline" size="sm" onClick={onRetry}>
              Try again
            </Button>
          }
        />
      );
    }

    const { requireOnLogin } = state.data;
    return (
      <div className="divide-y">
        <div className="flex items-center justify-between gap-4 pb-4">
          <div className="flex min-w-0 items-start gap-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-accent text-primary">
              <LogIn aria-hidden className="size-4" />
            </span>
            <div className="min-w-0 space-y-0.5">
              <Label htmlFor={SWITCH_ID} className="text-sm font-medium">
                Require 2FA on login
              </Label>
              <p className="text-sm text-muted-foreground">
                Ask for a code from your authenticator app when you sign in.
              </p>
            </div>
          </div>
          <Switch
            id={SWITCH_ID}
            checked={requireOnLogin}
            onCheckedChange={onToggleRequire}
            disabled={isSaving}
          />
        </div>

        <div className="flex items-center justify-between gap-4 pt-4">
          <div className="flex min-w-0 items-start gap-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-accent text-primary">
              <RefreshCw aria-hidden className="size-4" />
            </span>
            <div className="min-w-0 space-y-0.5">
              <p className="text-sm font-medium text-foreground">Reset 2FA</p>
              <p className="text-sm text-muted-foreground">
                Set up a new authenticator app. Your current one keeps working
                until the new one is verified.
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={onReset}>
            Reset
          </Button>
        </div>
      </div>
    );
  };

  return (
    <SettingsCard
      id="settings-two-factor"
      icon={ShieldCheck}
      title="Two-factor authentication"
      description="Protect your account with a 6-digit code from an authenticator app."
      action={
        state.status === 'success' && (
          <StatusPill
            isPositive={state.data.isEnrolled}
            label={state.data.isEnrolled ? 'Enabled' : 'Not set up'}
          />
        )
      }
    >
      {renderBody()}
    </SettingsCard>
  );
}
