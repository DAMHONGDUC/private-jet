import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

/** `system` follows the phone's setting; the others pin the app to one look. */
export enum ThemeMode {
  System = 'system',
  Light = 'light',
  Dark = 'dark',
}

export enum Language {
  English = 'en',
  Vietnamese = 'vi',
}

export const THEME_MODES: readonly ThemeMode[] = [
  ThemeMode.System,
  ThemeMode.Light,
  ThemeMode.Dark,
];
export const LANGUAGES: readonly Language[] = [
  Language.English,
  Language.Vietnamese,
];

export type PreferencesState = { themeMode: ThemeMode; language: Language };

const initialState: PreferencesState = {
  themeMode: ThemeMode.System,
  language: Language.English,
};

/**
 * How the app looks and speaks. Kept in memory: there is no storage yet, so
 * a relaunch starts from the defaults.
 */
export const preferencesSlice = createSlice({
  name: 'preferences',
  initialState,
  reducers: {
    themeModeSelected(state, action: PayloadAction<ThemeMode>) {
      state.themeMode = action.payload;
    },
    languageSelected(state, action: PayloadAction<Language>) {
      state.language = action.payload;
    },
  },
});

export const { themeModeSelected, languageSelected } = preferencesSlice.actions;

type WithPreferences = { [preferencesSlice.name]: PreferencesState };

export const selectThemeMode = (state: WithPreferences) =>
  state.preferences.themeMode;
export const selectLanguage = (state: WithPreferences) =>
  state.preferences.language;
