import { useEffect, useState } from 'react';
import { View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { spacing } from '@/core/theme/theme';
import { makeStyles, useBlackJetTheme } from '@/core/theme/blackjet';
import { AppText } from '@/core/ui/AppText';
import { Icon } from '@/core/ui/Icon';
import { formatDuration, formatTime } from '@/core/utils/format';
import type { Flight } from '../../domain/entities/flight';

const PLANE_SIZE = 22;

/** Origin and destination with a plane that flies the route once on open. */
export function RouteHero({ flight }: { flight: Flight }) {
  const palette = useBlackJetTheme();
  const styles = useStyles();
  const [trackWidth, setTrackWidth] = useState(0);
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withDelay(
      200,
      withTiming(1, { duration: 1400, easing: Easing.bezier(0.16, 1, 0.3, 1) }),
    );
  }, [progress]);

  const trailStyle = useAnimatedStyle(() => ({ width: progress.value * trackWidth }));
  const planeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: progress.value * Math.max(0, trackWidth - PLANE_SIZE) }],
  }));

  return (
    <View style={styles.hero}>
      <View style={styles.row}>
        <View>
          <AppText variant="display">{flight.origin.code}</AppText>
          <AppText muted>{flight.origin.city}</AppText>
        </View>
        <View style={styles.end}>
          <AppText variant="display">{flight.destination.code}</AppText>
          <AppText muted>{flight.destination.city}</AppText>
        </View>
      </View>

      <View style={styles.track} onLayout={event => setTrackWidth(event.nativeEvent.layout.width)}>
        <View style={styles.rail} />
        <Animated.View style={[styles.trail, trailStyle]} />
        <Animated.View style={[styles.plane, planeStyle]}>
          <Icon name="plane" size={20} color={palette.jetBlack} />
        </Animated.View>
      </View>

      <View style={styles.row}>
        <AppText variant="subtitle">{formatTime(flight.departureAt)}</AppText>
        <AppText variant="caption" muted>
          {formatDuration(flight.durationMinutes)} non-stop
        </AppText>
        <AppText variant="subtitle">{formatTime(flight.arrivalAt)}</AppText>
      </View>
    </View>
  );
}

const useStyles = makeStyles(palette => ({
  hero: { gap: spacing.lg },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  end: { alignItems: 'flex-end' },
  track: { height: PLANE_SIZE, justifyContent: 'center' },
  rail: { position: 'absolute', left: 0, right: 0, height: 1, backgroundColor: palette.iron },
  trail: { position: 'absolute', left: 0, height: 2, backgroundColor: palette.jetBlack },
  plane: { position: 'absolute', left: 0, width: PLANE_SIZE, alignItems: 'center' },
}));
