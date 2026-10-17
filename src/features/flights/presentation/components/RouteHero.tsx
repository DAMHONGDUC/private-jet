import { StyleSheet, View } from 'react-native';
import { spacing } from '@/core/theme/theme';
import { AppText } from '@/core/ui/AppText';
import { FlightPath } from '@/core/ui/FlightPath';
import { formatDuration, formatTime } from '@/core/utils/format';
import type { Flight } from '../../domain/entities/flight';

/** Origin and destination with a plane that flies the route once on open. */
export function RouteHero({ flight }: { flight: Flight }) {
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

      <FlightPath />

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

const styles = StyleSheet.create({
  hero: { gap: spacing.lg },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  end: { alignItems: 'flex-end' },
});
