import { useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
} from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useDispatch, useSelector } from 'react-redux';
import { useT } from '@/core/i18n/i18n';
import { makeStyles } from '@/core/theme/blackjet';
import { AppSpacing } from '@/core/theme/app-spacing';
import { AppText } from '@/core/ui/AppText';
import { ActionsDirection, BottomActions } from '@/core/ui/BottomActions';
import { Button, ButtonVariant } from '@/core/ui/Button';
import { Card } from '@/core/ui/Card';
import { Chip } from '@/core/ui/Chip';
import { Screen } from '@/core/ui/Screen';
import { EmptyView, errorMessage } from '@/core/ui/StateViews';
import { haptics } from '@/core/ui/haptics';
import { imageFor } from '@/core/ui/images';
import { formatDuration, formatMoney } from '@/core/utils/format';
import { selectUser } from '@/features/auth/presentation/session-slice';
import {
  hasTravellerErrors,
  travellerErrors,
  type TravellerErrors,
} from '@/features/booking/domain/entities/booking';
import {
  useBookCharterMutation,
  useGetPaymentMethodsQuery,
} from '@/features/booking/presentation/booking-api';
import { FormField } from '@/features/booking/presentation/components/FormField';
import { PaymentMethodPicker } from '@/features/booking/presentation/components/PaymentMethodPicker';
import { selectionsCleared } from '../charter-search-slice';
import { formatDay } from '../search-labels';
import { useCharterSelection } from '../use-charter-selection';

/** Departure times offered per leg, local to the departure airport. */
export const DEPARTURE_TIMES = [
  '07:00',
  '09:00',
  '11:00',
  '14:00',
  '17:00',
  '20:00',
] as const;
const DEFAULT_TIME = '09:00';

type Props = { onBooked: (bookingId: string) => void; onBack: () => void };

/**
 * The jets chosen, a departure time per leg, the party (the member first),
 * requests and payment; then pay and book.
 */
export function CharterCheckoutScreen({ onBooked, onBack }: Props) {
  const styles = useStyles();
  const t = useT();
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const { request, results, chosen, complete, total, currency } =
    useCharterSelection();
  const { data: methods } = useGetPaymentMethodsQuery();
  const [bookCharter, { isLoading, error, reset }] = useBookCharterMutation();

  const party = Math.max(
    1,
    ...(request?.legs.map(leg => leg.passengers) ?? [1]),
  );
  const [names, setNames] = useState<string[]>(() =>
    Array.from({ length: party }, (_, index) =>
      index === 0 ? user?.fullName ?? '' : '',
    ),
  );
  const [email, setEmail] = useState(user?.email ?? '');
  const [notes, setNotes] = useState('');
  const [times, setTimes] = useState<string[]>(() =>
    (request?.legs ?? []).map(() => DEFAULT_TIME),
  );
  const [paymentMethodId, setPaymentMethodId] = useState<string | null>(null);
  /** Errors show once Pay was tapped, then follow the typing until fixed. */
  const [submitted, setSubmitted] = useState(false);

  if (!request || !results || !complete) {
    return (
      <Screen>
        <EmptyView
          title="Choose a jet for every leg"
          message="Go back to the results and pick one jet per leg."
        />
        <View style={styles.padded}>
          <Button
            title="Back to results"
            variant={ButtonVariant.Secondary}
            onPress={onBack}
          />
        </View>
      </Screen>
    );
  }

  const seats = Math.min(
    ...chosen.map(quote => quote?.aircraft.totalSeats ?? 0),
  );

  const passengers = names.map(fullName => ({ fullName }));
  const travellers = travellerErrors(passengers, email, seats);
  const errors: TravellerErrors = submitted ? travellers : { names: [] };

  const submit = async () => {
    setSubmitted(true);
    if (hasTravellerErrors(travellers)) {
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

  // Field problems sit under their fields; this line is for the rest.
  const shownError = errors.party ?? (error ? errorMessage(error) : null);

  return (
    <Screen>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={100}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          {results.map((group, index) => {
            const quote = chosen[index]!;
            return (
              <Card key={`${group.leg.origin}-${index}`} style={styles.leg}>
                <View style={styles.legHead}>
                  <Image
                    source={imageFor(quote.photos[0])}
                    style={styles.thumb}
                  />
                  <View style={styles.flex}>
                    <AppText variant="label" muted>
                      {results.length > 1 ? `Leg ${index + 1} · ` : ''}
                      {formatDay(group.leg.date, t)}
                    </AppText>
                    <AppText variant="subtitle">
                      {group.leg.origin} → {group.leg.destination}
                    </AppText>
                    <AppText variant="caption" muted>
                      {quote.aircraft.model} ·{' '}
                      {formatDuration(quote.durationMinutes)}
                    </AppText>
                  </View>
                  <AppText variant="subtitle">
                    {formatMoney(quote.price, quote.currency)}
                  </AppText>
                </View>
                <AppText variant="caption" muted>
                  Departure time
                </AppText>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.times}
                >
                  {DEPARTURE_TIMES.map(time => (
                    <Chip
                      key={time}
                      testID={`leg-${index}-time-${time}`}
                      label={time}
                      selected={times[index] === time}
                      onPress={() =>
                        setTimes(current =>
                          current.map((item, i) => (i === index ? time : item)),
                        )
                      }
                    />
                  ))}
                </ScrollView>
              </Card>
            );
          })}

          <Card style={styles.section}>
            <AppText variant="subtitle">Guests · {party}</AppText>
            {names.map((name, index) => (
              <FormField
                key={index}
                testID={`charter-passenger-${index}`}
                label={index === 0 ? 'Lead guest' : `Guest ${index + 1}`}
                placeholder="Full name as on passport"
                autoCapitalize="words"
                value={name}
                error={errors.names[index]}
                onChangeText={text =>
                  setNames(current =>
                    current.map((item, i) => (i === index ? text : item)),
                  )
                }
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
              error={errors.contactEmail}
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
              Taxes, fuel, crew and landing fees included. Free cancellation
              until 24 hours before departure.
            </AppText>
          </Card>

          {shownError ? (
            <Animated.View entering={FadeIn}>
              <AppText testID="charter-error" style={styles.error}>
                {shownError}
              </AppText>
            </Animated.View>
          ) : null}
        </ScrollView>

        <BottomActions direction={ActionsDirection.Row}>
          <View style={styles.flex}>
            <AppText variant="caption" muted>
              {results.length === 1
                ? t('actions.totalOne')
                : t('actions.total', { count: results.length })}
            </AppText>
            <AppText testID="charter-total" variant="title">
              {formatMoney(total, currency)}
            </AppText>
          </View>
          <Button
            testID="charter-pay"
            title={t(
              isLoading ? 'actions.processing' : 'actions.confirmAndPay',
            )}
            loading={isLoading}
            onPress={submit}
          />
        </BottomActions>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const useStyles = makeStyles(palette => ({
  flex: { flex: 1 },
  padded: { padding: AppSpacing.lg },
  content: { padding: AppSpacing.lg, gap: AppSpacing.lg },
  leg: { gap: AppSpacing.sm },
  legHead: { flexDirection: 'row', alignItems: 'center', gap: AppSpacing.md },
  thumb: { width: 56, height: 56, borderRadius: 12 },
  times: { gap: AppSpacing.sm },
  section: { gap: AppSpacing.md },
  error: { color: palette.error, textAlign: 'center' },
}));
