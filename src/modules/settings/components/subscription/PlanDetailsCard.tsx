import type { JSX, ReactNode } from 'react';
import { ShieldCheck } from 'lucide-react';
import { CopyIconButton } from '@/components/common';
import { cn } from '@/lib/utils';
import type { PlanDetailsCardProps } from '../../@types';
import { SettingsCard, StatusPill } from '../shared';

/** Full-width bento of marketplace identifiers and plan flags. */
export function PlanDetailsCard({
  customerId,
  awsAccountId,
  productCode,
  setupFeePaid,
  isActive,
}: PlanDetailsCardProps): JSX.Element {
  const tiles: Array<{ label: string; value: ReactNode; isWide?: boolean }> = [
    {
      label: 'Customer ID',
      isWide: true,
      value: (
        <span className="flex min-w-0 items-start gap-1">
          <code className="min-w-0 font-mono text-xs leading-relaxed break-all text-foreground">
            {customerId}
          </code>
          <CopyIconButton value={customerId} label="Customer ID" />
        </span>
      ),
    },
    {
      label: 'AWS account ID',
      value: (
        <span className="flex items-center gap-1">
          <code className="font-mono text-sm text-foreground">
            {awsAccountId}
          </code>
          <CopyIconButton value={awsAccountId} label="AWS account ID" />
        </span>
      ),
    },
    {
      label: 'Product code',
      value: (
        <code className="font-mono text-sm text-foreground">{productCode}</code>
      ),
    },
    {
      label: 'Setup fee paid',
      value: (
        <StatusPill
          isPositive={setupFeePaid}
          label={setupFeePaid ? 'Yes' : 'No'}
        />
      ),
    },
    {
      label: 'Status',
      value: (
        <StatusPill
          isPositive={isActive}
          label={isActive ? 'Active' : 'Inactive'}
        />
      ),
    },
  ];

  return (
    <SettingsCard
      id="plan-details"
      icon={ShieldCheck}
      title="Plan details"
      description="Additional information about your subscription"
    >
      <dl className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {tiles.map((tile) => (
          <div
            key={tile.label}
            className={cn(
              'flex min-w-0 flex-col justify-between gap-2 rounded-xl border bg-muted/30 p-4',
              tile.isWide && 'sm:col-span-2 xl:col-span-4',
            )}
          >
            <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              {tile.label}
            </dt>
            <dd className="min-w-0">{tile.value}</dd>
          </div>
        ))}
      </dl>
    </SettingsCard>
  );
}
