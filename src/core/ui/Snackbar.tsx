import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, { FadeInDown, FadeOutDown } from 'react-native-reanimated';
import { AppSpacing } from '@/core/theme/app-spacing';
import { useBlackJetTheme } from '@/core/theme/blackjet';
import { BJText } from './BJText';

const VISIBLE_MS = 2000;

type Props = {
  /** Nothing is shown while null. A new message restarts the timer. */
  message: string | null;
  onHide: () => void;
  bottom: number;
};

/** The black bar that reports a form or network error for 2 s. */
export function Snackbar({ message, onHide, bottom }: Props) {
  const palette = useBlackJetTheme();

  useEffect(() => {
    if (!message) {
      return;
    }
    const timer = setTimeout(onHide, VISIBLE_MS);
    return () => clearTimeout(timer);
  }, [message, onHide]);

  if (!message) {
    return null;
  }
  return (
    <Animated.View
      key={message}
      testID="snackbar"
      accessibilityRole="alert"
      entering={FadeInDown.duration(200)}
      exiting={FadeOutDown.duration(200)}
      style={[styles.bar, { bottom, backgroundColor: palette.jetBlack }]}
    >
      <BJText tone="inverse" weight="regular">
        {message}
      </BJText>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  bar: {
    position: 'absolute',
    left: AppSpacing.spacing12,
    right: AppSpacing.spacing12,
    borderRadius: 8,
    paddingHorizontal: AppSpacing.spacing16,
    paddingVertical: AppSpacing.spacing12,
  },
});
