import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { makeStyles } from '@/core/theme/blackjet';
import { AppText } from '@/core/ui/AppText';

const SIZE = 96;

/** A gold disc that eases in with a tick, while a ring pulses out once behind it. */
export function SuccessMark() {
  const styles = useStyles();
  const disc = useSharedValue(0);
  const tick = useSharedValue(0);
  const ring = useSharedValue(0);

  useEffect(() => {
    const easeOut = { duration: 300, easing: Easing.out(Easing.cubic) };
    disc.value = withTiming(1, easeOut);
    tick.value = withDelay(200, withTiming(1, easeOut));
    ring.value = withDelay(150, withSequence(withTiming(1, { duration: 700 }), withTiming(0, { duration: 0 })));
  }, [disc, tick, ring]);

  const discStyle = useAnimatedStyle(() => ({ transform: [{ scale: disc.value }] }));
  const tickStyle = useAnimatedStyle(() => ({
    opacity: tick.value,
    transform: [{ scale: 0.8 + tick.value * 0.2 }],
  }));
  const ringStyle = useAnimatedStyle(() => ({
    opacity: 1 - ring.value,
    transform: [{ scale: 1 + ring.value * 0.8 }],
  }));

  return (
    <View style={styles.wrap} testID="success-mark">
      <Animated.View style={[styles.ring, ringStyle]} />
      <Animated.View style={[styles.disc, discStyle]}>
        <Animated.View style={tickStyle}>
          <AppText style={styles.tick}>✓</AppText>
        </Animated.View>
      </Animated.View>
    </View>
  );
}

const useStyles = makeStyles(palette => ({
  wrap: { width: SIZE * 2, height: SIZE * 2, alignItems: 'center', justifyContent: 'center' },
  ring: {
    position: 'absolute',
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
    borderWidth: 2,
    borderColor: palette.jetBlack,
  },
  disc: {
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
    backgroundColor: palette.jetBlack,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tick: { fontSize: 44, color: palette.secondaryBackground, fontWeight: '700' },
}));
