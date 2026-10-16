import { StyleSheet, View } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { spacing } from '@/core/theme/theme';
import { AppText } from '@/core/ui/AppText';
import { Button } from '@/core/ui/Button';
import { Card } from '@/core/ui/Card';
import { Screen } from '@/core/ui/Screen';
import { LoadingView } from '@/core/ui/StateViews';
import { formatDate, formatMoney, formatTime } from '@/core/utils/format';
import { useGetBookingsQuery } from '../booking-api';
import { SuccessMark } from '../components/SuccessMark';

type Props = { bookingId: string; onViewTrips: () => void; onDone: () => void };

export function BookingConfirmationScreen({ bookingId, onViewTrips, onDone }: Props) {
  // Read from the bookings cache, which the mutation just invalidated.
  const { booking } = useGetBookingsQuery(undefined, {
    selectFromResult: ({ data }) => ({ booking: data?.find(item => item.id === bookingId) }),
  });

  if (!booking) {
    return (
      <Screen>
        <LoadingView />
      </Screen>
    );
  }

  return (
    <Screen top>
      <View style={styles.content}>
        <SuccessMark />
        <Animated.View entering={FadeInUp.delay(300).springify()} style={styles.center}>
          <AppText variant="display">You're booked</AppText>
          <AppText muted>Reference</AppText>
          <AppText variant="title" gold testID="booking-reference">
            {booking.reference}
          </AppText>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(450).springify()} style={styles.full}>
          <Card style={styles.card}>
            <AppText variant="subtitle">
              {booking.originCity} → {booking.destinationCity}
            </AppText>
            <AppText muted>
              {formatDate(booking.departureAt)} · {formatTime(booking.departureAt)}
            </AppText>
            <AppText muted>
              {booking.passengers.length} passenger{booking.passengers.length > 1 ? 's' : ''} ·{' '}
              {formatMoney(booking.totalPrice, booking.currency)}
            </AppText>
          </Card>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(600).springify()} style={[styles.full, styles.actions]}>
          <Button testID="view-trips" title="View my trips" onPress={onViewTrips} />
          <Button title="Back to flights" variant="secondary" onPress={onDone} />
        </Animated.View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl, gap: spacing.lg },
  center: { alignItems: 'center', gap: spacing.xs },
  full: { alignSelf: 'stretch' },
  card: { gap: spacing.xs },
  actions: { gap: spacing.md },
});
