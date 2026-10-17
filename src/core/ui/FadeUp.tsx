import { useEffect, type ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { blackJetCurves } from '@/core/theme/blackjet';

const EASE_IN_OUT = Easing.bezier(...blackJetCurves.easeInOut);
const RISE = 60;

type Props = {
  /** Position in a staggered group: waits 200 ms more and runs 200 ms longer than the one before. */
  index: number;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
};

/** Fades in while rising 60 pt, the way BlackJet sheets open (feature-docs/dashboard §6.2). */
export function FadeUp({ index, children, style }: Props) {
  const progress = useSharedValue(0);

  useEffect(() => {
    const delay = 200 * (index + 1);
    const duration = 400 + 200 * index;
    progress.value = withDelay(delay, withTiming(1, { duration, easing: EASE_IN_OUT }));
  }, [index, progress]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ translateY: (1 - progress.value) * RISE }],
  }));

  return <Animated.View style={[style, animatedStyle]}>{children}</Animated.View>;
}
