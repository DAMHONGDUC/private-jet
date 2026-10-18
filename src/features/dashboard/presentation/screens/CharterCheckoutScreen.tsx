import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useDispatch, useSelector } from 'react-redux';
import { AppErrorCode, type AppError } from '@/core/error/app-error';
import { makeStyles } from '@/core/theme/blackjet';
import { AppSpacing } from '@/core/theme/app-spacing';
import { AppText } from '@/core/ui/AppText';
import { Button, ButtonVariant } from '@/core/ui/Button';
import { Screen } from '@/core/ui/Screen';
import { errorMessage } from '@/core/error/error-message';
import { EmptyView } from '@/core/ui/EmptyView';
import { haptics } from '@/core/ui/haptics';
import { newIdempotencyKey } from '@/core/utils/idempotency-key';
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
import { selectionsCleared } from '../charter-search-slice';
import { CheckoutFooter } from '../components/CheckoutFooter';
import { CheckoutGuestsCard } from '../components/CheckoutGuestsCard';
import { CheckoutLegCard } from '../components/CheckoutLegCard';
import { CheckoutPaymentCard } from '../components/CheckoutPaymentCard';
import { useCharterSelection } from '../use-charter-selection';

const DEFAULT_TIME = '09:00';

type Props = { onBooked: (bookingId: string) => void; onBack: () => void };

/**
 * The jets chosen, a departure time per leg, the party (the member first),
 * requests and payment; then pay and book.
 */
export function CharterCheckoutScreen({ onBooked, onBack }: Props) {
  const styles = useStyles();
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
    (request?.legs ?? []).map(leg => leg.time ?? DEFAULT_TIME),
  );
  const [paymentMethodId, setPaymentMethodId] = useState<string | null>(null);
  /** Errors show once Pay was tapped, then follow the typing until fixed. */
  const [submitted, setSubmitted] = useState(false);
  /** Kept across a retry after a lost connection, so the charter cannot be booked twice. */
  const [idempotencyKey, setIdempotencyKey] = useState(() =>
    newIdempotencyKey(),
  );

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
        idempotencyKey,
        ...(paymentMethodId ? { paymentMethodId } : {}),
      }).unwrap();
      onBooked(booking.id);
      // After navigating away, so this screen never shows its empty state.
      dispatch(selectionsCleared());
    } catch (failure) {
      haptics.error();
      // A refusal is final for this attempt; only a lost connection leaves
      // the outcome unknown, and its retry must reuse the key.
      if ((failure as Partial<AppError>).code !== AppErrorCode.Network) {
        setIdempotencyKey(newIdempotencyKey());
      }
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
          {results.map((group, index) => (
            <CheckoutLegCard
              key={`${group.leg.origin}-${index}`}
              group={group}
              quote={chosen[index]!}
              index={index}
              legCount={results.length}
              time={times[index]}
              onTimeChange={time =>
                setTimes(current =>
                  current.map((item, i) => (i === index ? time : item)),
                )
              }
            />
          ))}

          <CheckoutGuestsCard
            party={party}
            names={names}
            email={email}
            notes={notes}
            errors={errors}
            onNameChange={(index, text) =>
              setNames(current =>
                current.map((item, i) => (i === index ? text : item)),
              )
            }
            onEmailChange={setEmail}
            onNotesChange={setNotes}
          />

          <CheckoutPaymentCard
            methods={methods}
            value={paymentMethodId}
            onChange={setPaymentMethodId}
            amount={total}
            currency={currency}
          />

          {shownError ? (
            <Animated.View entering={FadeIn}>
              <AppText testID="charter-error" style={styles.error}>
                {shownError}
              </AppText>
            </Animated.View>
          ) : null}
        </ScrollView>

        <CheckoutFooter
          legCount={results.length}
          total={total}
          currency={currency}
          loading={isLoading}
          onPay={submit}
        />
      </KeyboardAvoidingView>
    </Screen>
  );
}

const useStyles = makeStyles(palette => ({
  flex: { flex: 1 },
  padded: { padding: AppSpacing.lg },
  content: { padding: AppSpacing.lg, gap: AppSpacing.lg },
  error: { color: palette.error, textAlign: 'center' },
}));
