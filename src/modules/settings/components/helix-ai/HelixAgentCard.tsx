import type { JSX } from 'react';
import { Bot } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import type { HelixAgentCardProps } from '../../@types';
import { SettingsCard, StatusPill } from '../shared';

const SWITCH_ID = 'settings-helix-enabled';

/** Turn the Helix AI agent on or off. */
export function HelixAgentCard({
  isEnabled,
  isSaving,
  onToggle,
}: HelixAgentCardProps): JSX.Element {
  return (
    <SettingsCard
      id="settings-helix-agent"
      icon={Bot}
      title="Helix AI agent"
      description="Configure Helix, your AI-powered assistant for workflow generation and debugging."
    >
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0 space-y-0.5">
          <Label htmlFor={SWITCH_ID} className="text-sm font-medium">
            Enable Helix
          </Label>
          <p className="text-sm text-muted-foreground">
            Lets your team generate and debug workflows with AI.
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <StatusPill
            isPositive={isEnabled}
            label={isEnabled ? 'Enabled' : 'Disabled'}
          />
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
