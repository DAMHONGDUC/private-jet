import HapticFeedback from 'react-native-haptic-feedback';

const options = { enableVibrateFallback: false, ignoreAndroidSystemSettings: false };

/** The two haptics the dashboard uses (feature-docs/dashboard §5). */
export const haptics = {
  /** Tabs, opening sheets, the search button, the counter. */
  selection: () => HapticFeedback.trigger('selection', options),
  /** A date picked, a leg removed. */
  light: () => HapticFeedback.trigger('impactLight', options),
};
