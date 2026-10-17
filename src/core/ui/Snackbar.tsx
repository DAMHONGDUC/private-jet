import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, { FadeInDown, FadeOutDown } from 'react-native-reanimated';
import { spacing } from '@/core/theme/theme';
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
    left: spacing.md,
    right: spacing.md,
    borderRadius: 8,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
});
