import { useCallback, useEffect, useState, type JSX } from 'react';
import { Info, LoaderCircle, Play } from 'lucide-react';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { logger } from '@/utils/logger';
import type {
  ApiKeyListState,
  ConnectionTestRunState,
  TestConnectionScreenProps,
} from '../../@types';
import {
  apiDtoToApiKey,
  apiDtoToConnectionTestResult,
  listApiKeys,
  runConnectionTest,
} from '../../service';
import { ConnectionStatusBadge } from '../connection-table/ConnectionStatusBadge';
import { ConnectionTypeBadge } from '../connection-table/ConnectionTypeBadge';
import { ApiKeySelect } from './ApiKeySelect';
import { ConnectionTestResultPanel } from './ConnectionTestResultPanel';

const API_KEY_SELECT_ID = 'connection-test-api-key';

export function TestConnectionScreen({
  connection,
  onBack,
}: TestConnectionScreenProps): JSX.Element {
  const [apiKeysState, setApiKeysState] = useState<ApiKeyListState>({
    status: 'loading',
  });
  const [selectedApiKeyId, setSelectedApiKeyId] = useState('');
  const [runState, setRunState] = useState<ConnectionTestRunState>({
    status: 'idle',
  });
  const isRunning = runState.status === 'running';

  const loadApiKeys = useCallback(async (): Promise<void> => {
    setApiKeysState({ status: 'loading' });
    try {
      const dtos = await listApiKeys();
      setApiKeysState({ status: 'success', data: dtos.map(apiDtoToApiKey) });
    } catch (error) {
      logger.error('Loading API keys failed', { error });
      setApiKeysState({ status: 'error' });
    }
  }, []);

  useEffect(() => {
    void loadApiKeys();
  }, [loadApiKeys]);

  const selectedApiKey =
    apiKeysState.status === 'success'
      ? apiKeysState.data.find((apiKey) => apiKey.id === selectedApiKeyId)
      : undefined;

  const handleRunTest = async (): Promise<void> => {
    if (!selectedApiKey) {
      return;
    }
    setRunState({ status: 'running', apiKeyName: selectedApiKey.name });
    try {
      const dto = await runConnectionTest(connection.id, selectedApiKey.id);
      setRunState({
        status: 'done',
        result: apiDtoToConnectionTestResult(dto, selectedApiKey.name),
      });
    } catch (error) {
      logger.error('Connection test failed to run', {
        connectionId: connection.id,
        error,
      });
      setRunState({
        status: 'error',
        error: 'We couldn’t run the test. Please try again.',
      });
    }
  };

  return (
    <div className="space-y-6 p-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <button
                type="button"
                onClick={onBack}
                className="rounded-sm outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
              >
                Connections
              </button>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Test connection</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="space-y-1">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Test {connection.name}
          </h1>
          <ConnectionTypeBadge type={connection.type} />
          <ConnectionStatusBadge status={connection.status} />
        </div>
        <p className="text-sm text-muted-foreground">
          Verify service authentication and system permissions
        </p>
      </div>

      {/* Two halves on large screens: set up the test on the left, results on
          the right. Stacks into one column below lg. */}
      <div className="grid items-start gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <section
            aria-labelledby="connection-test-config-heading"
            className="rounded-xl border bg-card"
          >
            <div className="space-y-1 border-b px-5 py-4">
              <h2
                id="connection-test-config-heading"
                className="text-sm font-semibold text-foreground"
              >
                Test configuration
              </h2>
              <p className="text-sm text-muted-foreground">
                Checks backend service authentication with a signed JWT
                assertion — no user interaction required.
              </p>
            </div>

            <div className="p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                <div className="min-w-0 flex-1 space-y-2">
                  <Label htmlFor={API_KEY_SELECT_ID}>API key</Label>
                  <ApiKeySelect
                    id={API_KEY_SELECT_ID}
                    listState={apiKeysState}
                    value={selectedApiKeyId}
                    onValueChange={setSelectedApiKeyId}
                    onRetry={() => void loadApiKeys()}
                    disabled={isRunning}
                  />
                </div>
                <Button
                  onClick={() => void handleRunTest()}
                  disabled={!selectedApiKey || isRunning}
                >
                  {isRunning ? (
                    <LoaderCircle className="animate-spin" aria-hidden />
                  ) : (
                    <Play aria-hidden />
                  )}
                  {isRunning ? 'Running test…' : 'Run connection test'}
                </Button>
              </div>
            </div>
          </section>

          <section
            aria-labelledby="connection-test-scope-heading"
            className="flex items-start gap-3 rounded-xl border bg-muted/40 px-5 py-4"
          >
            <Info className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
            <div className="space-y-1">
              <h2
                id="connection-test-scope-heading"
                className="text-sm font-semibold text-foreground"
              >
                What we’re testing
              </h2>
              <p className="text-sm text-muted-foreground">
                We’ll validate your OAuth configuration, authenticate with the
                health system, verify access token permissions, and confirm FHIR
                API connectivity. Each step makes sure your integration is ready
                for production use.
              </p>
            </div>
          </section>
        </div>

        <ConnectionTestResultPanel
          runState={runState}
          onRetry={() => void handleRunTest()}
        />
      </div>
    </div>
  );
}
