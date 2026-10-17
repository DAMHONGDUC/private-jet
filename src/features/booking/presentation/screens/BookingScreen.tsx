import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing } from '@/core/theme/theme';
import { AppText } from '@/core/ui/AppText';
import { Button } from '@/core/ui/Button';
import { Card } from '@/core/ui/Card';
import { Screen } from '@/core/ui/Screen';
import { Stepper } from '@/core/ui/Stepper';
import { ErrorView, LoadingView, errorMessage } from '@/core/ui/StateViews';
import { formatDate, formatMoney, formatTime } from '@/core/utils/format';
import { useGetFlightQuery } from '@/features/flights/presentation/flights-api';
import { MAX_PASSENGERS, validateBookingRequest } from '../../domain/entities/booking';
import { useBookFlightMutation } from '../booking-api';
import { FormField } from '../components/FormField';

type Props = {
  flightId: string;
  /** Seats asked for in the search; the form starts with this many passengers. */
  initialPassengers?: number;
  onBooked: (bookingId: string) => void;
};

export function BookingScreen({ flightId, initialPassengers = 1, onBooked }: Props) {
  const insets = useSafeAreaInsets();
  const { data: flight, error: flightError, isLoading, refetch } = useGetFlightQuery(flightId);
  const [bookFlight, { isLoading: isBooking, error: bookingError, reset }] = useBookFlightMutation();

  const [names, setNames] = useState<string[]>(() =>
    Array<string>(Math.max(1, Math.min(MAX_PASSENGERS, initialPassengers))).fill(''),
  );
  const [email, setEmail] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  if (isLoading) {
    return (
      <Screen>
        <LoadingView />
      </Screen>
    );
  }
  if (flightError || !flight) {
    return (
      <Screen>
        <ErrorView error={flightError} onRetry={refetch} />
      </Screen>
    );
  }

  const maxPassengers = Math.max(1, Math.min(MAX_PASSENGERS, flight.seatsAvailable));
  const total = flight.pricePerSeat * names.length;

  const setPassengerCount = (count: number) => {
    setNames(current =>
      count > current.length
        ? [...current, ...Array<string>(count - current.length).fill('')]
        : current.slice(0, count),
    );
  };

  const submit = async () => {
    const request = {
      flightId,
      passengers: names.map(fullName => ({ fullName })),
      contactEmail: email,
    };
    // The domain rule, checked before the round trip; the use case checks it again.
    const problem = validateBookingRequest(request);
    setFormError(problem);
    if (problem) {
      return;
    }

    reset();
    try {
      const booking = await bookFlight(request).unwrap();
      onBooked(booking.id);
    } catch {
      // Shown from `bookingError` below.
    }
  };

  const shownError = formError ?? (bookingError ? errorMessage(bookingError) : null);

  return (
    <Screen>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={100}
      >
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Card style={styles.summary}>
            <AppText variant="title">
              {flight.origin.city} → {flight.destination.city}
            </AppText>
            <AppText muted>
              {formatDate(flight.departureAt)} · {formatTime(flight.departureAt)} · {flight.aircraft.model}
            </AppText>
          </Card>

          <Card style={styles.section}>
            <View style={styles.between}>
              <View>
                <AppText variant="subtitle">Passengers</AppText>
                <AppText variant="caption" muted>
                  Up to {maxPassengers} on this flight
                </AppText>
              </View>
              <Stepper testID="passengers" value={names.length} min={1} max={maxPassengers} onChange={setPassengerCount} />
            </View>

            {names.map((name, index) => (
              <FormField
                key={index}
                testID={`passenger-name-${index}`}
                label={`Passenger ${index + 1}`}
                placeholder="Full name as on passport"
                autoCapitalize="words"
                value={name}
                onChangeText={text =>
                  setNames(current => current.map((item, i) => (i === index ? text : item)))
                }
              />
            ))}
          </Card>

          <Card style={styles.section}>
            <FormField
              testID="contact-email"
              label="Contact email"
              placeholder="you@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              value={email}
              onChangeText={setEmail}
            />
          </Card>

          {shownError ? (
            <Animated.View entering={FadeIn}>
              <AppText testID="booking-error" style={styles.error}>
                {shownError}
              </AppText>
            </Animated.View>
          ) : null}
        </ScrollView>

        <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.md }]}>
          <View>
            <AppText variant="caption" muted>
              Total · {names.length} seat{names.length > 1 ? 's' : ''}
            </AppText>
            <AppText variant="title" gold testID="booking-total">
              {formatMoney(total, flight.currency)}
            </AppText>
          </View>
          <Button testID="confirm-booking" title="Confirm booking" loading={isBooking} onPress={submit} />
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { padding: spacing.lg, gap: spacing.lg },
  summary: { gap: spacing.xs },
  section: { gap: spacing.lg },
  between: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  error: { color: colors.danger, textAlign: 'center' },
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
