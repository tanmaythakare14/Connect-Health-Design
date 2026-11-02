import { useCallback, useEffect, useState, type JSX } from 'react';
import { CircleAlert } from 'lucide-react';
import { EmptyState } from '@/components/common';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { logger } from '@/utils/logger';
import type { SubscriptionState } from '../../@types';
import { SETTINGS_SECTION } from '../../constants';
import { apiDtoToSubscription, getSubscription } from '../../service';
import { getSettingsSection } from '../../utils';
import { SettingsPageHeader } from '../shared';
import { ConnectionUsageSection } from './connection-usage';
import { LicenseSourcesCard } from './LicenseSourcesCard';
import { PlanDetailsCard } from './PlanDetailsCard';
import { SubscriptionStatusCard } from './SubscriptionStatusCard';

/** Bento layout: status (wide) and sources side by side, details below. */
const BENTO_CLASS_NAME = 'grid gap-4 lg:grid-cols-5';

/** Settings → Subscription: plan usage, license sources and plan details. */
export function SubscriptionSettings(): JSX.Element {
  const [state, setState] = useState<SubscriptionState>({ status: 'loading' });

  const loadSubscription = useCallback(async (): Promise<void> => {
    setState({ status: 'loading' });
    try {
      const dto = await getSubscription();
      setState({ status: 'success', data: apiDtoToSubscription(dto) });
    } catch (error) {
      logger.error('Loading subscription failed', { error });
      setState({ status: 'error' });
    }
  }, []);

  useEffect(() => {
    void loadSubscription();
  }, [loadSubscription]);

  const renderBody = (): JSX.Element => {
    if (state.status === 'loading') {
      return (
        <div className={BENTO_CLASS_NAME} aria-busy>
          <Skeleton className="h-64 rounded-2xl bg-muted lg:col-span-3" />
          <Skeleton className="h-64 rounded-2xl bg-muted lg:col-span-2" />
          <Skeleton className="h-48 rounded-2xl bg-muted lg:col-span-5" />
        </div>
      );
    }

    if (state.status === 'error') {
      return (
        <div className="rounded-xl border">
          <EmptyState
            tone="destructive"
            icon={CircleAlert}
            title="Subscription didn’t load"
            description="We couldn’t load your subscription details. Please try again."
            action={
              <Button
                variant="outline"
                size="sm"
                onClick={() => void loadSubscription()}
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
      <div className={BENTO_CLASS_NAME}>
        <div className="flex lg:col-span-3 [&>*]:flex-1">
          <SubscriptionStatusCard
            planName={data.planName}
            used={data.integrationsUsed}
            limit={data.integrationsLimit}
            remaining={data.integrationsRemaining}
            expiresAt={data.expiresAt}
          />
        </div>
        <div className="flex lg:col-span-2 [&>*]:flex-1">
          <LicenseSourcesCard sources={data.sources} />
        </div>
        <div className="lg:col-span-5">
          <PlanDetailsCard
            customerId={data.customerId}
            awsAccountId={data.awsAccountId}
            productCode={data.productCode}
            setupFeePaid={data.setupFeePaid}
            isActive={data.isActive}
          />
        </div>
        <div className="lg:col-span-5">
          <ConnectionUsageSection />
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <SettingsPageHeader
        section={getSettingsSection(SETTINGS_SECTION.SUBSCRIPTION)}
      />
      {renderBody()}
    </div>
  );
}
