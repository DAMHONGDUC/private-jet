import HapticFeedback from 'react-native-haptic-feedback';

const options = { enableVibrateFallback: false, ignoreAndroidSystemSettings: false };

/** The haptics the app uses (feature-docs/dashboard §5, plus success and error). */
export const haptics = {
  /** Tabs, opening sheets, the search button, the counter. */
  selection: () => HapticFeedback.trigger('selection', options),
  /** A date picked, a leg removed. */
  light: () => HapticFeedback.trigger('impactLight', options),
  /** A booking confirmed, a sign-in accepted. */
  success: () => HapticFeedback.trigger('notificationSuccess', options),
  /** Wrong password, a failed request. */
  error: () => HapticFeedback.trigger('notificationError', options),
};
