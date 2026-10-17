import { View } from 'react-native';
import { radius, spacing } from '@/core/theme/theme';
import { makeStyles } from '@/core/theme/blackjet';
import { AppText } from '@/core/ui/AppText';
import { Card } from '@/core/ui/Card';
import { formatDate, formatMoney, formatTime } from '@/core/utils/format';
import { firstLeg, lastLeg, type Booking } from '../../domain/entities/booking';

export function TripCard({ booking }: { booking: Booking }) {
  const styles = useStyles();
  return (
    <Card style={styles.card} testID={`trip-${booking.reference}`}>
      <View style={styles.between}>
        <AppText variant="title">
          {firstLeg(booking).originCode} → {lastLeg(booking).destinationCode}
        </AppText>
        <View style={styles.reference}>
          <AppText variant="caption" accent>
            {booking.reference}
          </AppText>
        </View>
      </View>
      <AppText muted>
        {firstLeg(booking).originCity} to {lastLeg(booking).destinationCity} · {firstLeg(booking).aircraftModel}
      </AppText>
      <View style={styles.between}>
        <AppText variant="caption" muted>
          {formatDate(firstLeg(booking).departureAt)} · {formatTime(firstLeg(booking).departureAt)} ·{' '}
          {booking.passengers.length} pax
        </AppText>
        <AppText variant="subtitle" accent>
          {formatMoney(booking.totalPrice, booking.currency)}
        </AppText>
      </View>
    </Card>
  );
}

const useStyles = makeStyles(palette => ({
  card: { gap: spacing.sm },
  between: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  reference: {
    backgroundColor: palette.iron,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
}));
