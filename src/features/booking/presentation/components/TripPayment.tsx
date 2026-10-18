import { StyleSheet, View } from 'react-native';
import { AppSpacing } from '@/core/theme/app-spacing';
import { AppText } from '@/core/ui/AppText';
import { formatMoney } from '@/core/utils/format';
import type { Booking } from '../../domain/entities/booking';
import { TripSection } from './TripSection';

type Props = { booking: Booking };

/** How the trip was paid, its total and any requests. */
export function TripPayment({ booking }: Props) {
  return (
    <TripSection title="Payment">
      <View style={styles.line}>
        <AppText muted>Paid with</AppText>
        <AppText>{booking.paymentLabel}</AppText>
      </View>
      <View style={styles.line}>
        <AppText muted>Total</AppText>
        <AppText testID="trip-total" variant="subtitle">
          {formatMoney(booking.totalPrice, booking.currency)}
        </AppText>
      </View>
      {booking.notes ? (
        <View style={styles.notes}>
          <AppText variant="caption" muted>
            Requests
          </AppText>
          <AppText>{booking.notes}</AppText>
        </View>
      ) : null}
    </TripSection>
  );
}

const styles = StyleSheet.create({
  line: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: AppSpacing.spacing12,
  },
  notes: { gap: 2 },
});
