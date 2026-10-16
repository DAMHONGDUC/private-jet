import { StyleSheet, View } from 'react-native';
import { colors, radius, spacing } from '@/core/theme/theme';
import { AppText } from '@/core/ui/AppText';
import { Card } from '@/core/ui/Card';
import { formatDate, formatMoney, formatTime } from '@/core/utils/format';
import type { Booking } from '../../domain/entities/booking';

export function TripCard({ booking }: { booking: Booking }) {
  return (
    <Card style={styles.card} testID={`trip-${booking.reference}`}>
      <View style={styles.between}>
        <AppText variant="title">
          {booking.originCode} → {booking.destinationCode}
        </AppText>
        <View style={styles.reference}>
          <AppText variant="caption" gold>
            {booking.reference}
          </AppText>
        </View>
      </View>
      <AppText muted>
        {booking.originCity} to {booking.destinationCity} · {booking.aircraftModel}
      </AppText>
      <View style={styles.between}>
        <AppText variant="caption" muted>
          {formatDate(booking.departureAt)} · {formatTime(booking.departureAt)} ·{' '}
          {booking.passengers.length} pax
        </AppText>
        <AppText variant="subtitle" gold>
          {formatMoney(booking.totalPrice, booking.currency)}
        </AppText>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { gap: spacing.sm },
  between: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  reference: {
    backgroundColor: colors.goldSoft,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
});
