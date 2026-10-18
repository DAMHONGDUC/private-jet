import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { makeStyles } from '@/core/theme/blackjet';

const DOT = 7;

function Dot({ index }: { index: number }) {
  const styles = useStyles();
  const lift = useSharedValue(0);

  useEffect(() => {
    const ease = Easing.inOut(Easing.quad);
    lift.value = withDelay(
      index * 150,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 300, easing: ease }),
          withTiming(0, { duration: 300, easing: ease }),
        ),
        -1,
      ),
    );
  }, [index, lift]);

  const style = useAnimatedStyle(() => ({
    opacity: 0.35 + lift.value * 0.65,
    transform: [{ translateY: -lift.value * 4 }],
  }));
  return <Animated.View style={[styles.dot, style]} />;
}

/** Three dots that rise in turn while the concierge writes. */
export function TypingDots({ testID }: { testID?: string }) {
  const styles = useStyles();
  return (
    <View
      testID={testID}
      accessibilityLabel="Concierge is typing"
      style={styles.bubble}
    >
      {[0, 1, 2].map(index => (
        <Dot key={index} index={index} />
      ))}
    </View>
  );
}

const useStyles = makeStyles(palette => ({
  bubble: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    gap: 5,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 18,
    borderBottomLeftRadius: 4,
    backgroundColor: palette.primaryBackground,
    borderWidth: 1,
    borderColor: palette.iron,
  },
  dot: {
    width: DOT,
    height: DOT,
    borderRadius: DOT / 2,
    backgroundColor: palette.secondaryText,
  },
}));
