import { useEffect } from 'react';
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

/** One dot of the typing indicator, rising after `index` × 150 ms. */
export function TypingDot({ index }: { index: number }) {
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

const useStyles = makeStyles(palette => ({
  dot: {
    width: DOT,
    height: DOT,
    borderRadius: DOT / 2,
    backgroundColor: palette.secondaryText,
  },
}));
