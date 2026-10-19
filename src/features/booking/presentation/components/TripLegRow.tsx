import { View } from 'react-native';
import { makeStyles } from '@/core/theme/blackjet';
import { AppSpacing } from '@/core/theme/app-spacing';
import { AppText } from '@/core/ui/AppText';
import { useT } from '@/core/i18n/i18n';
import { wallClockIn } from '@/core/utils/date';
import { formatDayKey, formatDuration } from '@/core/utils/format';
import { flightSchedule } from '@/features/flights/domain/entities/schedule';
import { formatSchedule } from '@/features/flights/presentation/schedule-labels';
import { useAirportZones } from '@/features/flights/presentation/use-airport-zones';
import type { BookingLeg } from '../../domain/entities/booking';

/**
 * One leg of the itinerary, on a dotted rail that joins it to the next. The
 * landing time is estimated from the flight time; both times are local.
 */
export function TripLegRow({ leg, last }: { leg: BookingLeg; last: boolean }) {
  const styles = useStyles();
  const t = useT();
  const zoneOf = useAirportZones();
  const departureDay = wallClockIn(
    new Date(leg.departureAt),
    zoneOf(leg.originCode),
  ).day;
  const schedule = flightSchedule(
    new Date(leg.departureAt),
    leg.durationMinutes,
    {
      origin: zoneOf(leg.originCode),
      destination: zoneOf(leg.destinationCode),
    },
  );
  return (
    <View style={styles.leg}>
      <View style={styles.rail}>
        <View style={styles.dot} />
        {last ? null : <View style={styles.connector} />}
      </View>
      <View style={styles.legBody}>
        <AppText variant="caption" muted>
          {formatDayKey(departureDay)} · {formatSchedule(schedule)} (
          {t('results.estimatedShort')})
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
