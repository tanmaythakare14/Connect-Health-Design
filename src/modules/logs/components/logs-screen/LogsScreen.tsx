import type { JSX } from 'react';
import { LineTabsList, LineTabsTrigger } from '@/components/common';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { LOG_TABS } from '../../constants';
import { ApplicationLogs } from './ApplicationLogs';
import { LogsPlaceholder } from './LogsPlaceholder';

export function LogsScreen(): JSX.Element {
  return (
    <div className="space-y-6 p-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Logs
        </h1>
        <p className="text-sm text-muted-foreground">
          Trace every workflow run and audit event across your connections
        </p>
      </div>

      <Tabs defaultValue={LOG_TABS.APPLICATION} className="gap-5">
        <LineTabsList aria-label="Log type">
          <LineTabsTrigger value={LOG_TABS.APPLICATION}>
            Application
          </LineTabsTrigger>
          <LineTabsTrigger value={LOG_TABS.AUDIT}>Audit</LineTabsTrigger>
        </LineTabsList>

        <TabsContent value={LOG_TABS.APPLICATION}>
          <ApplicationLogs />
        </TabsContent>
        <TabsContent value={LOG_TABS.AUDIT}>
          <LogsPlaceholder
            title="Audit logs are on the way"
            description="The audit trail hasn’t been designed yet."
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
