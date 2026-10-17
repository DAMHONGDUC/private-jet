import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

/** Which pushes the member wants. UI preferences only; the demo sends none. */
export type NotificationPrefs = {
  flightUpdates: boolean;
  concierge: boolean;
  offers: boolean;
};

export type SettingsState = { notifications: NotificationPrefs };

const initialState: SettingsState = {
  notifications: { flightUpdates: true, concierge: true, offers: false },
};

export const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    notificationToggled(state, action: PayloadAction<keyof NotificationPrefs>) {
      state.notifications[action.payload] = !state.notifications[action.payload];
    },
  },
});

export const { notificationToggled } = settingsSlice.actions;

type WithSettings = { [settingsSlice.name]: SettingsState };

export const selectNotificationPrefs = (state: WithSettings) => state.settings.notifications;
