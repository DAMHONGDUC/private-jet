import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { makeStyles } from '@/core/theme/blackjet';
import { spacing } from '@/core/theme/theme';
import { AppText } from '@/core/ui/AppText';
import { Button } from '@/core/ui/Button';
import { Card } from '@/core/ui/Card';
import { Screen } from '@/core/ui/Screen';
import { LoadingView } from '@/core/ui/StateViews';
import { haptics } from '@/core/ui/haptics';
import { formatMoney } from '@/core/utils/format';
import { firstLeg, lastLeg } from '../../domain/entities/booking';
import { useGetBookingQuery } from '../booking-api';
import { SuccessMark } from '../components/SuccessMark';
import { departureLabel, kindLabel, routeCodes } from '../trip-labels';

type Props = { bookingId: string; onViewTrip: () => void; onDone: () => void };

/** The tick, the reference and the trip in one card; then on to the trip or back. */
export function BookingConfirmationScreen({ bookingId, onViewTrip, onDone }: Props) {
  const styles = useStyles();
  const { data: booking } = useGetBookingQuery(bookingId);

  useEffect(() => {
    if (booking) {
      haptics.success();
    }
  }, [booking]);

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
        <Animated.View entering={FadeInDown.duration(500).delay(300)} style={styles.center}>
          <AppText variant="display">You're booked</AppText>
          <AppText muted>Reference</AppText>
          <AppText variant="title" testID="booking-reference" style={styles.code}>
            {booking.reference}
          </AppText>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(500).delay(450)} style={styles.full}>
          <Card style={styles.card}>
            <AppText variant="label" muted>
              {kindLabel(booking)}
            </AppText>
            <AppText variant="title">{routeCodes(booking)}</AppText>
            <AppText muted>
              {firstLeg(booking).originCity} → {lastLeg(booking).destinationCity} · {departureLabel(booking)}
            </AppText>
            <AppText muted>
              {booking.passengers.length} passenger{booking.passengers.length > 1 ? 's' : ''} ·{' '}
              {formatMoney(booking.totalPrice, booking.currency)} · {booking.paymentLabel}
            </AppText>
          </Card>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(500).delay(600)} style={[styles.full, styles.actions]}>
          <Button testID="view-trip" title="View trip" onPress={onViewTrip} />
          <Button testID="booking-done" title="Done" variant="secondary" onPress={onDone} />
        </Animated.View>
      </View>
    </Screen>
  );
}

const useStyles = makeStyles(() => ({
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl, gap: spacing.lg },
  center: { alignItems: 'center', gap: spacing.xs },
  code: { letterSpacing: 4 },
  full: { alignSelf: 'stretch' },
  card: { gap: spacing.xs },
  actions: { gap: spacing.md },
}));
