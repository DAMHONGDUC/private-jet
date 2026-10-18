import { View } from 'react-native';
import { makeStyles } from '@/core/theme/blackjet';
import { AppSpacing } from '@/core/theme/app-spacing';
import { AppText } from '@/core/ui/AppText';
import { formatDate, formatDuration, formatTime } from '@/core/utils/format';
import type { BookingLeg } from '../../domain/entities/booking';

/** One leg of the itinerary, on a dotted rail that joins it to the next. */
export function TripLegRow({ leg, last }: { leg: BookingLeg; last: boolean }) {
  const styles = useStyles();
  return (
    <View style={styles.leg}>
      <View style={styles.rail}>
        <View style={styles.dot} />
        {last ? null : <View style={styles.connector} />}
      </View>
      <View style={styles.legBody}>
        <AppText variant="caption" muted>
          {formatDate(leg.departureAt)} · {formatTime(leg.departureAt)}
        </AppText>
        <AppText variant="subtitle">
          {leg.originCity} ({leg.originCode}) → {leg.destinationCity} (
          {leg.destinationCode})
        </AppText>
        <AppText variant="caption" muted>
          {leg.aircraftModel} · {formatDuration(leg.durationMinutes)}
        </AppText>
      </View>
    </View>
  );
}

const useStyles = makeStyles(palette => ({
  leg: { flexDirection: 'row', gap: AppSpacing.spacing12 },
  rail: { width: 12, alignItems: 'center', paddingTop: 4 },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: palette.accent,
  },
  connector: { flex: 1, width: 2, backgroundColor: palette.iron, marginTop: 4 },
  legBody: { flex: 1, gap: 2, paddingBottom: AppSpacing.spacing12 },
}));
