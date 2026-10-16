import { ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, radius, spacing } from '@/core/theme/theme';
import { AppText } from '@/core/ui/AppText';
import { Button } from '@/core/ui/Button';
import { Card } from '@/core/ui/Card';
import { Screen } from '@/core/ui/Screen';
import { ErrorView, LoadingView } from '@/core/ui/StateViews';
import { formatDate, formatMoney } from '@/core/utils/format';
import { isSoldOut } from '../../domain/entities/flight';
import { RouteHero } from '../components/RouteHero';
import { useGetFlightQuery } from '../flights-api';

type Props = { flightId: string; onBook: (flightId: string) => void };

export function FlightDetailScreen({ flightId, onBook }: Props) {
  const insets = useSafeAreaInsets();
  const { data: flight, error, isLoading, refetch } = useGetFlightQuery(flightId);

  if (isLoading) {
    return (
      <Screen>
        <LoadingView />
      </Screen>
    );
  }
  if (error || !flight) {
    return (
      <Screen>
        <ErrorView error={error} onRetry={refetch} />
      </Screen>
    );
  }

  const soldOut = isSoldOut(flight);
  const rows: [string, string][] = [
    ['Date', formatDate(flight.departureAt)],
    ['Operator', flight.operator],
    ['Aircraft', flight.aircraft.model],
    ['Cabin', `${flight.aircraft.totalSeats} seats · ${flight.aircraft.category}`],
    ['From', flight.origin.name],
    ['To', flight.destination.name],
  ];

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content}>
        <Animated.View entering={FadeInUp.springify().damping(16)}>
          <Card>
            <RouteHero flight={flight} />
          </Card>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(120).springify().damping(16)}>
          <Card style={styles.rows}>
            {rows.map(([label, value]) => (
              <View key={label} style={styles.row}>
                <AppText muted>{label}</AppText>
                <AppText style={styles.value}>{value}</AppText>
              </View>
            ))}
          </Card>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(240).springify().damping(16)} style={styles.amenities}>
          {flight.amenities.map(amenity => (
            <View key={amenity} style={styles.amenity}>
              <AppText variant="caption" gold>
                {amenity}
              </AppText>
            </View>
          ))}
        </Animated.View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.md }]}>
        <View>
          <AppText variant="title" gold>
            {formatMoney(flight.pricePerSeat, flight.currency)}
          </AppText>
          <AppText variant="caption" muted>
            per seat · {soldOut ? 'sold out' : `${flight.seatsAvailable} left`}
          </AppText>
        </View>
        <Button
          testID="book-button"
          title={soldOut ? 'Sold out' : 'Book seats'}
          disabled={soldOut}
          onPress={() => onBook(flight.id)}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.lg, gap: spacing.lg },
  rows: { gap: spacing.md },
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.lg },
  value: { flexShrink: 1, textAlign: 'right' },
  amenities: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  amenity: {
    backgroundColor: colors.goldSoft,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
});
