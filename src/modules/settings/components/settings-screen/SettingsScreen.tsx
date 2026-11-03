import { useState, type JSX } from 'react';
import type { SettingsSectionId } from '../../@types';
import {
  DEFAULT_SETTINGS_SECTION,
  SETTINGS_SECTION,
  SETTINGS_SECTIONS,
} from '../../constants';
import { ApiKeysSettings } from '../api-keys';
import { ChangePasswordSettings } from '../change-password';
import { GeneralSettings } from '../general';
import { HelixAiSettings } from '../helix-ai';
import { SettingsSideNav } from '../settings-nav';
import { SubscriptionSettings } from '../subscription';
import { UserSettings } from '../users';

/** Each section's screen, one per menu entry. */
const SECTION_SCREENS: Record<SettingsSectionId, () => JSX.Element> = {
  [SETTINGS_SECTION.GENERAL]: GeneralSettings,
  [SETTINGS_SECTION.API_KEYS]: ApiKeysSettings,
  [SETTINGS_SECTION.SUBSCRIPTION]: SubscriptionSettings,
  [SETTINGS_SECTION.HELIX_AI]: HelixAiSettings,
  [SETTINGS_SECTION.USERS]: UserSettings,
  [SETTINGS_SECTION.CHANGE_PASSWORD]: ChangePasswordSettings,
};

/**
 * Settings: a side menu of sections, with the chosen section on the right.
 * On large screens the page fills the content area without scrolling — the
 * menu stays put and only the section's content scrolls.
 */
export function SettingsScreen(): JSX.Element {
  const [activeSectionId, setActiveSectionId] = useState<SettingsSectionId>(
    DEFAULT_SETTINGS_SECTION,
  );
  const ActiveScreen = SECTION_SCREENS[activeSectionId];

  return (
    <div className="flex min-h-full flex-col gap-6 p-6 lg:h-full">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Settings
        </h1>
        <p className="text-sm text-muted-foreground">
          Manage your workspace, access, billing and AI preferences
        </p>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-6 lg:flex-row">
        <SettingsSideNav
          ariaLabel="Settings"
          items={SETTINGS_SECTIONS}
          activeId={activeSectionId}
          onSelect={setActiveSectionId}
        />

        {/* key replays the entrance animation when the section changes */}
        <div
          key={activeSectionId}
          className="min-w-0 flex-1 rounded-xl border bg-card p-6 shadow-sm animate-in fade-in-0 slide-in-from-bottom-1 duration-200 lg:overflow-y-auto"
        >
          <ActiveScreen />
        </div>
      </div>
    </div>
  );
}
