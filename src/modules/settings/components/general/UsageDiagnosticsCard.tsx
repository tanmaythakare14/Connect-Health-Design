import type { JSX } from 'react';
import { Activity } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import type { UsageDiagnosticsCardProps } from '../../@types';
import { SettingsCard } from '../shared';

const SWITCH_ID = 'settings-usage-diagnostics';

/** Opt in or out of anonymous product-usage metadata. */
export function UsageDiagnosticsCard({
  isEnabled,
  isSaving,
  onToggle,
}: UsageDiagnosticsCardProps): JSX.Element {
  return (
    <SettingsCard
      id="settings-usage-diagnostics-card"
      icon={Activity}
      title="Usage diagnostics"
      description="Anonymous product-usage metadata (feature counts, versions, error categories) that helps improve ConnectHealth. Never includes patient data, message content, credentials, or anything from your clinical data."
    >
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0 space-y-0.5">
          <Label htmlFor={SWITCH_ID} className="text-sm font-medium">
            Share usage diagnostics
          </Label>
          <p className="text-sm text-muted-foreground">
            You can change this at any time.
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <Badge
            variant="outline"
            aria-hidden
            className={cn(
              'rounded-md font-medium',
              isEnabled
                ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300'
                : 'border-border bg-muted text-muted-foreground',
            )}
          >
            {isEnabled ? 'Enabled' : 'Disabled'}
          </Badge>
          <Switch
            id={SWITCH_ID}
            checked={isEnabled}
            onCheckedChange={onToggle}
            disabled={isSaving}
          />
        </div>
      </div>
    </SettingsCard>
  );
}
