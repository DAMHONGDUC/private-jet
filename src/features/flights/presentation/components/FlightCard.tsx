import { StyleSheet, View } from 'react-native';
import { radius, spacing } from '@/core/theme/theme';
import { makeStyles } from '@/core/theme/blackjet';
import { AppText } from '@/core/ui/AppText';
import { PressableScale } from '@/core/ui/PressableScale';
import { formatDate, formatDuration, formatMoney, formatTime } from '@/core/utils/format';
import { isSoldOut, type Flight } from '../../domain/entities/flight';

type Props = { flight: Flight; onPress: () => void };

/** Operator on top, then times and price on one line, then date and seats. */
export function FlightCard({ flight, onPress }: Props) {
  const styles = useStyles();
  const soldOut = isSoldOut(flight);

  return (
    <PressableScale
      testID={`flight-card-${flight.id}`}
      accessibilityRole="button"
      accessibilityLabel={`${flight.origin.city} to ${flight.destination.city}`}
      onPress={onPress}
      style={styles.card}
    >
      <AppText variant="caption" muted numberOfLines={1}>
        {flight.operator} · {flight.aircraft.model}
      </AppText>

      <View style={styles.row}>
        <View>
          <AppText variant="subtitle">{formatTime(flight.departureAt)}</AppText>
          <AppText variant="caption" muted>
            {flight.origin.code}
          </AppText>
        </View>
        <View style={styles.path}>
          <AppText variant="caption" muted>
            {formatDuration(flight.durationMinutes)}
          </AppText>
          <View style={styles.line} />
        </View>
        <View>
          <AppText variant="subtitle">{formatTime(flight.arrivalAt)}</AppText>
          <AppText variant="caption" muted>
            {flight.destination.code}
          </AppText>
        </View>
        <View style={styles.price}>
          <AppText variant="subtitle" accent>
            {formatMoney(flight.pricePerSeat, flight.currency)}
          </AppText>
          <AppText variant="caption" muted>
            per seat
          </AppText>
        </View>
      </View>

      <AppText variant="caption" muted={!soldOut} style={soldOut ? styles.soldOut : undefined}>
        {formatDate(flight.departureAt)} · {soldOut ? 'Sold out' : `${flight.seatsAvailable} seats left`}
      </AppText>
    </PressableScale>
  );
}

const useStyles = makeStyles(palette => ({
  card: {
    backgroundColor: palette.primaryBackground,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.md,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  path: { flex: 1, alignItems: 'center', gap: spacing.xs },
  line: { alignSelf: 'stretch', height: StyleSheet.hairlineWidth, backgroundColor: palette.iron },
  price: { alignItems: 'flex-end', marginLeft: spacing.sm },
  soldOut: { color: palette.error },
}));
