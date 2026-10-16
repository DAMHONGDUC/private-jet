import { StyleSheet, View } from 'react-native';
import { colors, radius, spacing } from '@/core/theme/theme';
import { AppText } from '@/core/ui/AppText';
import { PressableScale } from '@/core/ui/PressableScale';
import { formatDate, formatTime } from '@/core/utils/format';
import type { Booking } from '@/features/booking/domain/entities/booking';

type Props = { trip: Booking | null; onPress: () => void };

export function NextTripCard({ trip, onPress }: Props) {
  return (
    <PressableScale testID="next-trip" accessibilityRole="button" onPress={onPress} style={styles.card}>
      <AppText variant="label" gold>
        Next trip
      </AppText>
      {trip ? (
        <>
          <View style={styles.route}>
            <AppText variant="display">{trip.originCode}</AppText>
            <AppText variant="title" gold>
              ✈︎
            </AppText>
            <AppText variant="display">{trip.destinationCode}</AppText>
          </View>
          <AppText muted>
            {formatDate(trip.departureAt)} · {formatTime(trip.departureAt)} · {trip.aircraftModel}
          </AppText>
        </>
      ) : (
        <AppText muted>No upcoming trips. Find a jet to get started.</AppText>
      )}
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
    gap: spacing.sm,
  },
  route: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
});
