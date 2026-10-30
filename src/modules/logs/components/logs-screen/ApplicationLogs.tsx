import type { JSX } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { APPLICATION_LOG_TABS } from '../../constants';
import { RawEventsPanel } from '../raw-events-panel';
import { RunsPanel } from '../runs-panel';

/** Application logs, split into workflow runs and raw log lines. */
export function ApplicationLogs(): JSX.Element {
  return (
    <Tabs defaultValue={APPLICATION_LOG_TABS.RUNS} className="gap-4">
      <TabsList aria-label="Application log views">
        <TabsTrigger value={APPLICATION_LOG_TABS.RUNS} className="px-4">
          Runs
        </TabsTrigger>
        <TabsTrigger value={APPLICATION_LOG_TABS.RAW} className="px-4">
          Raw
        </TabsTrigger>
      </TabsList>

      <TabsContent value={APPLICATION_LOG_TABS.RUNS}>
        <RunsPanel />
      </TabsContent>
      <TabsContent value={APPLICATION_LOG_TABS.RAW}>
        <RawEventsPanel />
      </TabsContent>
    </Tabs>
  );
}
