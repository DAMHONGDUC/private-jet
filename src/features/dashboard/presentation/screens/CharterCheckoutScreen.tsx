import { useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { makeStyles } from '@/core/theme/blackjet';
import { spacing } from '@/core/theme/theme';
import { AppText } from '@/core/ui/AppText';
import { Button } from '@/core/ui/Button';
import { Card } from '@/core/ui/Card';
import { Chip } from '@/core/ui/Chip';
import { CountUp } from '@/core/ui/CountUp';
import { Screen } from '@/core/ui/Screen';
import { EmptyView, errorMessage } from '@/core/ui/StateViews';
import { haptics } from '@/core/ui/haptics';
import { imageFor } from '@/core/ui/images';
import { formatDuration, formatMoney } from '@/core/utils/format';
import { selectUser } from '@/features/auth/presentation/session-slice';
import { validateTravellers } from '@/features/booking/domain/entities/booking';
import { useBookCharterMutation, useGetPaymentMethodsQuery } from '@/features/booking/presentation/booking-api';
import { FormField } from '@/features/booking/presentation/components/FormField';
import { PaymentMethodPicker } from '@/features/booking/presentation/components/PaymentMethodPicker';
import { selectionsCleared } from '../charter-search-slice';
import { formatDay } from '../search-labels';
import { useCharterSelection } from '../use-charter-selection';

/** Departure times offered per leg, local to the departure airport. */
export const DEPARTURE_TIMES = ['07:00', '09:00', '11:00', '14:00', '17:00', '20:00'] as const;
const DEFAULT_TIME = '09:00';

type Props = { onBooked: (bookingId: string) => void; onBack: () => void };

/**
 * The jets chosen, a departure time per leg, the party (the member first),
 * requests and payment; then pay and book.
 */
export function CharterCheckoutScreen({ onBooked, onBack }: Props) {
  const styles = useStyles();
  const insets = useSafeAreaInsets();
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const { request, results, chosen, complete, total, currency } = useCharterSelection();
  const { data: methods } = useGetPaymentMethodsQuery();
  const [bookCharter, { isLoading, error, reset }] = useBookCharterMutation();

  const party = Math.max(1, ...(request?.legs.map(leg => leg.passengers) ?? [1]));
  const [names, setNames] = useState<string[]>(() =>
    Array.from({ length: party }, (_, index) => (index === 0 ? user?.fullName ?? '' : '')),
  );
  const [email, setEmail] = useState(user?.email ?? '');
  const [notes, setNotes] = useState('');
  const [times, setTimes] = useState<string[]>(() => (request?.legs ?? []).map(() => DEFAULT_TIME));
  const [paymentMethodId, setPaymentMethodId] = useState<string | null>(null);
  const [problem, setProblem] = useState<string | null>(null);

  if (!request || !results || !complete) {
    return (
      <Screen>
        <EmptyView title="Choose a jet for every leg" message="Go back to the results and pick one jet per leg." />
        <View style={styles.padded}>
          <Button title="Back to results" variant="secondary" onPress={onBack} />
        </View>
      </Screen>
    );
  }

  const seats = Math.min(...chosen.map(quote => quote?.aircraft.totalSeats ?? 0));

  const submit = async () => {
    const passengers = names.map(fullName => ({ fullName }));
    const invalid = validateTravellers(passengers, email, seats);
    setProblem(invalid);
    if (invalid) {
      haptics.error();
      return;
    }
    reset();
    try {
      const booking = await bookCharter({
        selections: results.map((group, index) => ({
          leg: group.leg,
          quote: chosen[index]!,
          departureTime: times[index],
        })),
        passengers,
        contactEmail: email,
        notes,
        ...(paymentMethodId ? { paymentMethodId } : {}),
      }).unwrap();
      onBooked(booking.id);
      // After navigating away, so this screen never shows its empty state.
      dispatch(selectionsCleared());
    } catch {
      haptics.error();
    }
  };

  const shownError = problem ?? (error ? errorMessage(error) : null);

  return (
    <Screen>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={100}
      >
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          {results.map((group, index) => {
            const quote = chosen[index]!;
            return (
              <Animated.View key={`${group.leg.origin}-${index}`} entering={FadeInDown.duration(450).delay(index * 80)}>
                <Card style={styles.leg}>
                  <View style={styles.legHead}>
                    <Image source={imageFor(quote.photos[0])} style={styles.thumb} />
                    <View style={styles.flex}>
                      <AppText variant="label" muted>
                        {results.length > 1 ? `Leg ${index + 1} · ` : ''}
                        {formatDay(group.leg.date)}
                      </AppText>
                      <AppText variant="subtitle">
                        {group.leg.origin} → {group.leg.destination}
                      </AppText>
                      <AppText variant="caption" muted>
                        {quote.aircraft.model} · {formatDuration(quote.durationMinutes)}
                      </AppText>
                    </View>
                    <AppText variant="subtitle">{formatMoney(quote.price, quote.currency)}</AppText>
                  </View>
                  <AppText variant="caption" muted>
                    Departure time
                  </AppText>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.times}>
                    {DEPARTURE_TIMES.map(time => (
                      <Chip
                        key={time}
                        testID={`leg-${index}-time-${time}`}
                        label={time}
                        selected={times[index] === time}
                        onPress={() => setTimes(current => current.map((item, i) => (i === index ? time : item)))}
                      />
                    ))}
                  </ScrollView>
                </Card>
              </Animated.View>
            );
          })}

          <Animated.View entering={FadeInDown.duration(450).delay(results.length * 80)}>
            <Card style={styles.section}>
              <AppText variant="subtitle">
                Passengers · {party}
              </AppText>
              {names.map((name, index) => (
                <FormField
                  key={index}
                  testID={`charter-passenger-${index}`}
                  label={index === 0 ? 'Lead passenger' : `Passenger ${index + 1}`}
                  placeholder="Full name as on passport"
                  autoCapitalize="words"
                  value={name}
                  onChangeText={text => setNames(current => current.map((item, i) => (i === index ? text : item)))}
                />
              ))}
              <FormField
                testID="charter-email"
                label="Contact email"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                value={email}
                onChangeText={setEmail}
              />
              <FormField
                testID="charter-notes"
                label="Special requests (optional)"
                placeholder="Catering, pets, ground transport…"
                multiline
                value={notes}
                onChangeText={setNotes}
              />
            </Card>
          </Animated.View>

          <Animated.View entering={FadeInDown.duration(450).delay((results.length + 1) * 80)}>
            <Card style={styles.section}>
              <AppText variant="subtitle">Payment</AppText>
              <PaymentMethodPicker
                methods={methods}
                value={paymentMethodId}
                onChange={setPaymentMethodId}
                amount={total}
                currency={currency}
              />
              <AppText variant="caption" muted>
                Taxes, fuel, crew and landing fees included. Free cancellation until 24 hours before departure.
              </AppText>
            </Card>
          </Animated.View>

          {shownError ? (
            <Animated.View entering={FadeIn}>
              <AppText testID="charter-error" style={styles.error}>
                {shownError}
              </AppText>
            </Animated.View>
          ) : null}
        </ScrollView>

        <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.md }]}>
          <View style={styles.flex}>
            <AppText variant="caption" muted>
              Total · {results.length} {results.length === 1 ? 'leg' : 'legs'}
            </AppText>
            <CountUp testID="charter-total" value={total} format={amount => formatMoney(amount, currency)} />
          </View>
          <Button
            testID="charter-pay"
            title={isLoading ? 'Processing…' : 'Confirm & Pay'}
            loading={isLoading}
            onPress={submit}
          />
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const useStyles = makeStyles(palette => ({
  flex: { flex: 1 },
  padded: { padding: spacing.lg },
  content: { padding: spacing.lg, gap: spacing.lg },
  leg: { gap: spacing.sm },
  legHead: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  thumb: { width: 56, height: 56, borderRadius: 12 },
  times: { gap: spacing.sm },
  section: { gap: spacing.md },
  error: { color: palette.error, textAlign: 'center' },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: palette.iron,
    backgroundColor: palette.secondaryBackground,
  },
}));
