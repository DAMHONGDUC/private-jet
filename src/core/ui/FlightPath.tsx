import { useEffect, useState } from 'react';
import { View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { makeStyles, useBlackJetTheme } from '@/core/theme/blackjet';
import { Icon } from './Icon';

const PLANE = 22;

/** A rail with a plane that flies it once, leaving a solid trail (ease-out over 1.4 s). */
export function FlightPath({ delay = 200 }: { delay?: number }) {
  const styles = useStyles();
  const palette = useBlackJetTheme();
  const [width, setWidth] = useState(0);
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withDelay(
      delay,
      withTiming(1, { duration: 1400, easing: Easing.bezier(0.16, 1, 0.3, 1) }),
    );
  }, [delay, progress]);

  const trailStyle = useAnimatedStyle(() => ({
    width: progress.value * width,
  }));
  const planeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: progress.value * Math.max(0, width - PLANE) }],
  }));

  return (
    <View
      style={styles.track}
      onLayout={event => setWidth(event.nativeEvent.layout.width)}
    >
      <View style={styles.rail} />
      <Animated.View style={[styles.trail, trailStyle]} />
      <Animated.View style={[styles.plane, planeStyle]}>
        <Icon name="plane" size={20} color={palette.accent} />
      </Animated.View>
    </View>
  );
}

const useStyles = makeStyles(palette => ({
  track: { height: PLANE, justifyContent: 'center' },
  rail: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: palette.iron,
  },
  trail: {
    position: 'absolute',
    left: 0,
    height: 2,
    backgroundColor: palette.accent,
  },
  plane: {
    position: 'absolute',
    left: 0,
    width: PLANE,
    alignItems: 'center',
    backgroundColor: palette.primaryBackground,
  },
}));
