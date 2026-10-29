import { createSlice } from '@reduxjs/toolkit';
import type { RootState } from '../index';

export type ThemeMode = 'light' | 'dark';

interface UiState {
  sidebarCollapsed: boolean;
  theme: ThemeMode;
  guidesAutoOpenDisabled: boolean;
}

const initialState: UiState = {
  sidebarCollapsed: false,
  theme: 'light',
  guidesAutoOpenDisabled: false,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar(state) {
      state.sidebarCollapsed = !state.sidebarCollapsed;
    },
    toggleTheme(state) {
      state.theme = state.theme === 'dark' ? 'light' : 'dark';
    },
    toggleGuidesAutoOpen(state) {
      state.guidesAutoOpenDisabled = !state.guidesAutoOpenDisabled;
    },
  },
});

export const { toggleSidebar, toggleTheme, toggleGuidesAutoOpen } =
  uiSlice.actions;

export const selectSidebarCollapsed = (state: RootState): boolean =>
  state.ui.sidebarCollapsed;
export const selectTheme = (state: RootState): ThemeMode => state.ui.theme;
export const selectGuidesAutoOpenDisabled = (state: RootState): boolean =>
  state.ui.guidesAutoOpenDisabled;

export default uiSlice.reducer;
