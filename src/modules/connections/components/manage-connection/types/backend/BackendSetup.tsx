import { useCallback, useEffect, useState, type JSX } from 'react';
import { CircleAlert } from 'lucide-react';
import { EmptyState } from '@/components/common';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { logger } from '@/utils/logger';
import type {
  BackendConfigState,
  ConnectionDetailsProps,
} from '../../../../@types';
import { apiDtoToBackendConfig, getBackendConfig } from '../../../../service';
import { BackendSetupForm } from './BackendSetupForm';

const SKELETON_SECTION_COUNT = 2;

/** Backend services (Oracle Health) details: loads the saved setup, then shows the form. */
export function BackendSetup({
  connection,
}: ConnectionDetailsProps): JSX.Element {
  const [configState, setConfigState] = useState<BackendConfigState>({
    status: 'loading',
  });

  const loadConfig = useCallback(async (): Promise<void> => {
    setConfigState({ status: 'loading' });
    try {
      const dto = await getBackendConfig(connection.id);
      setConfigState({ status: 'success', data: apiDtoToBackendConfig(dto) });
    } catch (error) {
      logger.error('Loading backend setup failed', {
        connectionId: connection.id,
        error,
      });
      setConfigState({ status: 'error' });
    }
  }, [connection.id]);

  useEffect(() => {
    void loadConfig();
  }, [loadConfig]);

  if (configState.status === 'loading') {
    return (
      <div className="space-y-4" aria-busy>
        {Array.from({ length: SKELETON_SECTION_COUNT }, (_, index) => (
          <div key={index} className="space-y-4 rounded-xl border bg-card p-5">
            <Skeleton className="h-5 w-48 bg-muted" />
            <div className="grid gap-4 sm:grid-cols-3">
              <Skeleton className="h-9 bg-muted" />
              <Skeleton className="h-9 bg-muted" />
              <Skeleton className="h-9 bg-muted" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (configState.status === 'error') {
    return (
      <div className="rounded-xl border bg-card">
        <EmptyState
          tone="destructive"
          icon={CircleAlert}
          title="Setup didn’t load"
          description="We couldn’t load this connection’s settings."
          action={
            <Button
              variant="outline"
              size="sm"
              onClick={() => void loadConfig()}
            >
              Try again
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <BackendSetupForm
      config={configState.data}
      connectionType={connection.type}
    />
  );
}
