import { useState, type JSX } from 'react';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import type { SettingsSectionId } from '../../@types';
import {
  DEFAULT_SETTINGS_SECTION,
  SETTINGS_SECTION,
  SETTINGS_SECTIONS,
} from '../../constants';
import { isSettingsSectionId } from '../../utils';
import { ApiKeysSettings } from '../api-keys';
import { GeneralSettings } from '../general';
import { HelixAiSettings } from '../helix-ai';
import { SecuritySettings } from '../security';
import { SettingsTabs } from '../settings-nav';
import { SubscriptionSettings } from '../subscription';
import { UserSettings } from '../users';

/** Each section's screen, one per tab. */
const SECTION_SCREENS: Record<SettingsSectionId, () => JSX.Element> = {
  [SETTINGS_SECTION.GENERAL]: GeneralSettings,
  [SETTINGS_SECTION.API_KEYS]: ApiKeysSettings,
  [SETTINGS_SECTION.SUBSCRIPTION]: SubscriptionSettings,
  [SETTINGS_SECTION.HELIX_AI]: HelixAiSettings,
  [SETTINGS_SECTION.USERS]: UserSettings,
  [SETTINGS_SECTION.SECURITY]: SecuritySettings,
};

/** Settings: a line tab per section, with the chosen section below. */
export function SettingsScreen(): JSX.Element {
  const [activeSectionId, setActiveSectionId] = useState<SettingsSectionId>(
    DEFAULT_SETTINGS_SECTION,
  );

  return (
    <div className="px-6 pb-6">
      <Tabs
        value={activeSectionId}
        onValueChange={(value) => {
          if (isSettingsSectionId(value)) setActiveSectionId(value);
        }}
        className="gap-5"
      >
        {/* Heading and tabs stay pinned while the section scrolls under them */}
        <div className="sticky top-0 z-20 -mx-6 space-y-5 bg-background px-6 pt-6">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              Settings
            </h1>
            <p className="text-sm text-muted-foreground">
              Manage your workspace, access, billing and AI preferences
            </p>
          </div>
          <SettingsTabs ariaLabel="Settings" items={SETTINGS_SECTIONS} />
        </div>

        {SETTINGS_SECTIONS.map(({ id }) => {
          const SectionScreen = SECTION_SCREENS[id];
          return (
            <TabsContent
              key={id}
              value={id}
              className="rounded-xl border bg-card p-6 shadow-sm animate-in fade-in-0 slide-in-from-bottom-1 duration-200"
            >
              <SectionScreen />
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}
