import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { colors } from '@/core/theme/theme';
import { AppText } from '@/core/ui/AppText';

const SIZE = 96;

/** A gold disc that pops in with a tick, while a ring pulses out once behind it. */
export function SuccessMark() {
  const disc = useSharedValue(0);
  const tick = useSharedValue(0);
  const ring = useSharedValue(0);

  useEffect(() => {
    disc.value = withSpring(1, { damping: 12, stiffness: 180 });
    tick.value = withDelay(250, withSpring(1, { damping: 10, stiffness: 200 }));
    ring.value = withDelay(150, withSequence(withTiming(1, { duration: 700 }), withTiming(0, { duration: 0 })));
  }, [disc, tick, ring]);

  const discStyle = useAnimatedStyle(() => ({ transform: [{ scale: disc.value }] }));
  const tickStyle = useAnimatedStyle(() => ({
    opacity: tick.value,
    transform: [{ scale: 0.6 + tick.value * 0.4 }],
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

const styles = StyleSheet.create({
  wrap: { width: SIZE * 2, height: SIZE * 2, alignItems: 'center', justifyContent: 'center' },
  ring: {
    position: 'absolute',
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
    borderWidth: 2,
    borderColor: colors.gold,
  },
  disc: {
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
    backgroundColor: colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tick: { fontSize: 44, color: colors.background, fontWeight: '700' },
});
