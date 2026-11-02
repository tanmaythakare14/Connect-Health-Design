import type { JSX } from 'react';
import { Shield } from 'lucide-react';
import { CopyIconButton } from '@/components/common';
import { Badge } from '@/components/ui/badge';
import type { DeploymentCardProps } from '../../@types';
import { SettingsCard } from '../shared';

const ROW_CLASS_NAME =
  'grid grid-cols-1 items-center gap-1 py-3 sm:grid-cols-[10rem_minmax(0,1fr)] sm:gap-6';

/** Read-only deployment identity: ID (copyable), environment and version. */
export function DeploymentCard({
  deploymentId,
  environment,
  version,
}: DeploymentCardProps): JSX.Element {
  return (
    <SettingsCard
      id="settings-deployment"
      icon={Shield}
      title="Deployment"
      description="Share the Deployment ID with the ConnectHealth team during onboarding — it’s a random identifier, not derived from your account."
    >
      <dl className="-my-3 divide-y divide-border/70 text-sm">
        <div className={ROW_CLASS_NAME}>
          <dt className="text-muted-foreground">Deployment ID</dt>
          <dd className="flex min-w-0 items-center gap-1.5">
            <code className="truncate rounded-md border bg-muted/50 px-2 py-1 font-mono text-xs text-foreground">
              {deploymentId}
            </code>
            <CopyIconButton value={deploymentId} label="Deployment ID" />
          </dd>
        </div>

        <div className={ROW_CLASS_NAME}>
          <dt className="text-muted-foreground">Environment</dt>
          <dd>
            <Badge
              variant="outline"
              className="gap-1.5 rounded-md border-emerald-200 bg-emerald-50 font-medium text-emerald-700 capitalize dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300"
            >
              <span
                aria-hidden
                className="size-1.5 rounded-full bg-emerald-500"
              />
              {environment}
            </Badge>
          </dd>
        </div>

        <div className={ROW_CLASS_NAME}>
          <dt className="text-muted-foreground">Version</dt>
          <dd className="font-mono text-xs text-foreground">{version}</dd>
        </div>
      </dl>
    </SettingsCard>
  );
}
