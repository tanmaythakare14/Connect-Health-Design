import { useCallback, useEffect, useState, type JSX } from 'react';
import { CircleAlert } from 'lucide-react';
import { EmptyState } from '@/components/common';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { logger } from '@/utils/logger';
import type {
  ConnectionDetailsProps,
  OpendentalConfigState,
} from '../../../../@types';
import {
  apiDtoToOpendentalConfig,
  getOpendentalConfig,
} from '../../../../service';
import { OpendentalSetupForm } from './OpendentalSetupForm';

const SKELETON_SECTION_COUNT = 2;

/** Open Dental details: loads the saved setup, then shows the form. */
export function OpendentalSetup({
  connection,
}: ConnectionDetailsProps): JSX.Element {
  const [configState, setConfigState] = useState<OpendentalConfigState>({
    status: 'loading',
  });

  const loadConfig = useCallback(async (): Promise<void> => {
    setConfigState({ status: 'loading' });
    try {
      const dto = await getOpendentalConfig(connection.id);
      setConfigState({
        status: 'success',
        data: apiDtoToOpendentalConfig(dto),
      });
    } catch (error) {
      logger.error('Loading Open Dental setup failed', {
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
    <OpendentalSetupForm
      config={configState.data}
      connectionType={connection.type}
      connectionStatus={connection.status}
    />
  );
}
