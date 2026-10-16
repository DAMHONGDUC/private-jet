import { StyleSheet, View } from 'react-native';
import { colors, radius, spacing } from '@/core/theme/theme';
import { AppText } from '@/core/ui/AppText';
import { PressableScale } from '@/core/ui/PressableScale';
import { formatDate, formatDuration, formatMoney, formatTime } from '@/core/utils/format';
import { isSoldOut, type Flight } from '../../domain/entities/flight';

type Props = { flight: Flight; onPress: () => void };

export function FlightCard({ flight, onPress }: Props) {
  const soldOut = isSoldOut(flight);

  return (
    <PressableScale
      testID={`flight-card-${flight.id}`}
      accessibilityRole="button"
      accessibilityLabel={`${flight.origin.city} to ${flight.destination.city}`}
      onPress={onPress}
      style={styles.card}
    >
      <View style={styles.header}>
        <AppText variant="caption" muted>
          {formatDate(flight.departureAt)} · {flight.operator}
        </AppText>
        <View style={[styles.badge, soldOut && styles.badgeSoldOut]}>
          <AppText variant="caption" style={soldOut ? styles.badgeSoldOutText : styles.badgeText}>
            {soldOut ? 'Sold out' : `${flight.seatsAvailable} seats left`}
          </AppText>
        </View>
      </View>

      <View style={styles.route}>
        <View>
          <AppText variant="title">{flight.origin.code}</AppText>
          <AppText variant="caption" muted>
            {formatTime(flight.departureAt)}
          </AppText>
        </View>
        <View style={styles.path}>
          <AppText variant="caption" muted>
            {formatDuration(flight.durationMinutes)}
          </AppText>
          <View style={styles.line}>
            <View style={styles.dot} />
            <View style={styles.dash} />
            <AppText gold>✈︎</AppText>
          </View>
        </View>
        <View style={styles.end}>
          <AppText variant="title">{flight.destination.code}</AppText>
          <AppText variant="caption" muted>
            {formatTime(flight.arrivalAt)}
          </AppText>
        </View>
      </View>

      <View style={styles.footer}>
        <AppText variant="caption" muted>
          {flight.aircraft.model}
        </AppText>
        <AppText variant="subtitle" gold>
          {formatMoney(flight.pricePerSeat, flight.currency)}
          <AppText variant="caption" muted>
            {' '}
            / seat
          </AppText>
        </AppText>
      </View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.md,
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  badge: {
    backgroundColor: colors.goldSoft,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  badgeText: { color: colors.gold },
  badgeSoldOut: { backgroundColor: 'rgba(248, 113, 113, 0.14)' },
  badgeSoldOutText: { color: colors.danger },
  route: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  path: { flex: 1, alignItems: 'center', gap: spacing.xs },
  line: { flexDirection: 'row', alignItems: 'center', alignSelf: 'stretch', gap: spacing.xs },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.gold },
  dash: { flex: 1, height: 1, backgroundColor: colors.border },
  end: { alignItems: 'flex-end' },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
});
