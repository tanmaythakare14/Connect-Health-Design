import type { JSX, ReactNode } from 'react';
import { Cpu, Lock, Pencil, PowerOff } from 'lucide-react';
import { CopyIconButton } from '@/components/common';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { LlmProviderCardProps } from '../../@types';
import { formatCreatedAt, getLlmProviderOption } from '../../utils';
import { SettingsCard } from '../shared';
import { LlmProviderForm } from './LlmProviderForm';

const NOT_SET = <span className="text-muted-foreground italic">Not set</span>;

/** Summary of the LLM provider; Edit turns the card into its form. */
export function LlmProviderCard({
  config,
  isHelixEnabled,
  isEditing,
  onEdit,
  onCancelEdit,
  onSave,
}: LlmProviderCardProps): JSX.Element {
  const option = getLlmProviderOption(config.provider);

  const tiles: Array<{ label: string; value: ReactNode; isWide?: boolean }> = [
    {
      label: 'Provider',
      value: (
        <span className="flex items-center gap-2 font-medium text-foreground">
          <span className="flex size-6 items-center justify-center rounded-md bg-accent text-primary">
            <Cpu aria-hidden className="size-3.5" />
          </span>
          {option.label}
        </span>
      ),
    },
    {
      label: 'Model',
      isWide: true,
      value: (
        <span className="flex min-w-0 items-center gap-1">
          <code className="min-w-0 font-mono text-xs break-all text-foreground">
            {config.modelName}
          </code>
          <CopyIconButton value={config.modelName} label="model name" />
        </span>
      ),
    },
    ...option.fields.map((field) => {
      if (field.kind === 'text') {
        const value = config.values[field.key];
        return {
          label: field.label,
          value: value ? (
            <span className="text-sm break-all text-foreground">{value}</span>
          ) : (
            NOT_SET
          ),
        };
      }
      const isStored = field.key in config.secretHints;
      const hint = config.secretHints[field.key];
      return {
        label: field.label,
        value: isStored ? (
          <span className="flex items-center gap-1.5 text-sm text-foreground">
            <Lock aria-hidden className="size-3.5 text-muted-foreground" />
            {hint ? (
              <code className="font-mono text-xs">{hint}</code>
            ) : (
              'Stored securely'
            )}
          </span>
        ) : (
          NOT_SET
        ),
      };
    }),
  ];

  return (
    <SettingsCard
      id="settings-llm-provider"
      icon={Cpu}
      title="LLM provider configuration"
      description={
        isEditing
          ? 'Changes apply to Helix right after you save.'
          : 'Configure your preferred LLM provider and credentials'
      }
      action={
        !isEditing && (
          <Button variant="outline" size="sm" onClick={onEdit}>
            <Pencil aria-hidden />
            Edit
          </Button>
        )
      }
    >
      {isEditing ? (
        <LlmProviderForm
          config={config}
          onCancel={onCancelEdit}
          onSave={onSave}
        />
      ) : (
        <div className="space-y-4 animate-in fade-in-0 duration-200">
          {!isHelixEnabled && (
            <p className="flex items-center gap-2 rounded-lg border bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
              <PowerOff aria-hidden className="size-4 shrink-0" />
              Helix is off — your configuration is kept.
            </p>
          )}

          <dl className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {tiles.map((tile) => (
              <div
                key={tile.label}
                className={cn(
                  'flex min-w-0 flex-col gap-2 rounded-xl border bg-muted/30 p-4',
                  tile.isWide && 'sm:col-span-2',
                )}
              >
                <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                  {tile.label}
                </dt>
                <dd className="min-w-0">{tile.value}</dd>
              </div>
            ))}
          </dl>

          <p className="text-xs text-muted-foreground">
            Last updated{' '}
            <time dateTime={config.updatedAt}>
              {formatCreatedAt(config.updatedAt)}
            </time>
          </p>
        </div>
      )}
    </SettingsCard>
  );
}
