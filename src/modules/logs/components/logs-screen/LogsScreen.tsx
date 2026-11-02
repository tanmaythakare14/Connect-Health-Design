import { useState, type JSX } from 'react';
import { LineTabsList, LineTabsTrigger } from '@/components/common';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import type { LogsScreenProps, LogTab } from '../../@types';
import { LOG_TABS } from '../../constants';
import { isLogTab } from '../../utils';
import { AuditEventsPanel } from '../audit-events-panel';
import { ApplicationLogs } from './ApplicationLogs';
import { LogTabBadges } from './LogTabBadges';

export function LogsScreen({
  initialTab = LOG_TABS.APPLICATION,
}: LogsScreenProps): JSX.Element {
  // Controlled so the tab row can show the active tab's badges.
  const [activeTab, setActiveTab] = useState<LogTab>(initialTab);

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

      <Tabs
        value={activeTab}
        onValueChange={(value) => {
          if (isLogTab(value)) setActiveTab(value);
        }}
        className="gap-5"
      >
        {/* The row owns the divider so the badges sit on the same line as the
            tabs; on narrow screens they wrap under them. */}
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-b">
          <LineTabsList aria-label="Log type" className="w-auto border-b-0">
            <LineTabsTrigger value={LOG_TABS.APPLICATION}>
              Application
            </LineTabsTrigger>
            <LineTabsTrigger value={LOG_TABS.AUDIT}>Audit</LineTabsTrigger>
          </LineTabsList>
          <div className="pb-2 sm:pb-0">
            <LogTabBadges tab={activeTab} />
          </div>
        </div>

        <TabsContent value={LOG_TABS.APPLICATION}>
          <ApplicationLogs />
        </TabsContent>
        <TabsContent value={LOG_TABS.AUDIT}>
          <AuditEventsPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
}
