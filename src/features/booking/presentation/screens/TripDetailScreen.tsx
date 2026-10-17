import { useState, type ReactNode } from 'react';
import { ScrollView, View } from 'react-native';
import Animated, { FadeIn, FadeInDown, FadeOut, LinearTransition } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { makeStyles } from '@/core/theme/blackjet';
import { spacing } from '@/core/theme/theme';
import { AppText } from '@/core/ui/AppText';
import { BottomSheet } from '@/core/ui/BottomSheet';
import { Button } from '@/core/ui/Button';
import { Card } from '@/core/ui/Card';
import { FlightPath } from '@/core/ui/FlightPath';
import { Screen } from '@/core/ui/Screen';
import { ErrorView, LoadingView, errorMessage } from '@/core/ui/StateViews';
import { StatusPill } from '@/core/ui/StatusPill';
import { haptics } from '@/core/ui/haptics';
import { formatDate, formatDuration, formatMoney, formatTime } from '@/core/utils/format';
import { CANCELLATION_WINDOW_HOURS, canCancel, firstLeg, lastLeg, type BookingLeg } from '../../domain/entities/booking';
import { useCancelBookingMutation, useGetBookingQuery } from '../booking-api';
import { kindLabel, tripState } from '../trip-labels';

/** Sections slide into place when cancelling changes the hero or the actions. */
const LAYOUT = LinearTransition.duration(250);

type Props = {
  bookingId: string;
  onContactConcierge?: () => void;
  /** Decides whether the trip can still be cancelled; tests pin it. */
  now?: Date;
};

/** Everything about one trip: route, legs, party, payment, and cancelling it. */
export function TripDetailScreen({ bookingId, onContactConcierge, now: nowProp }: Props) {
  const styles = useStyles();
  const insets = useSafeAreaInsets();
  const [now] = useState(() => nowProp ?? new Date());
  const [confirming, setConfirming] = useState(false);
  const { data: booking, error, isLoading, refetch } = useGetBookingQuery(bookingId);
  const [cancelBooking, { isLoading: cancelling, error: cancelError }] = useCancelBookingMutation();

  if (isLoading) {
    return (
      <Screen>
        <LoadingView />
      </Screen>
    );
  }
  if (error || !booking) {
    return (
      <Screen>
        <ErrorView error={error} onRetry={refetch} />
      </Screen>
    );
  }

  const from = firstLeg(booking);
  const to = lastLeg(booking);
  const state = tripState(booking, now);
  const cancellable = canCancel(booking, now);

  const cancel = async () => {
    try {
      await cancelBooking(booking.id).unwrap();
      haptics.success();
      setConfirming(false);
    } catch {
      haptics.error();
    }
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xxl }]}>
        <Animated.View entering={FadeIn.duration(350)} layout={LAYOUT}>
          <Card style={styles.hero}>
            <View style={styles.row}>
              <AppText variant="label" muted>
                {kindLabel(booking)}
              </AppText>
              <Animated.View key={state.label} entering={FadeIn.duration(250)}>
                <StatusPill testID="trip-status" label={state.label} tone={state.tone} />
              </Animated.View>
            </View>
            <View style={styles.row}>
              <View>
                <AppText variant="display">{from.originCode}</AppText>
                <AppText muted>{from.originCity}</AppText>
              </View>
              <View style={styles.end}>
                <AppText variant="display">{to.destinationCode}</AppText>
                <AppText muted>{to.destinationCity}</AppText>
              </View>
            </View>
            <FlightPath />
            <View style={styles.reference}>
              <AppText variant="caption" muted>
                Booking reference
              </AppText>
              <AppText testID="trip-reference" variant="title" style={styles.code}>
                {booking.reference}
              </AppText>
            </View>
          </Card>
        </Animated.View>

        <Section title={booking.legs.length > 1 ? 'Itinerary' : 'Flight'} index={1}>
          {booking.legs.map((leg, index) => (
            <LegRow key={`${leg.originCode}-${leg.departureAt}`} leg={leg} last={index === booking.legs.length - 1} />
          ))}
        </Section>

        <Section title={`Passengers · ${booking.passengers.length}`} index={2}>
          {booking.passengers.map((passenger, index) => (
            <View key={`${passenger.fullName}-${index}`} style={styles.line}>
              <AppText>{passenger.fullName}</AppText>
              <AppText variant="caption" muted>
                {index === 0 ? 'Lead passenger' : `Guest ${index}`}
              </AppText>
            </View>
          ))}
          <View style={styles.line}>
            <AppText muted>Contact</AppText>
            <AppText>{booking.contactEmail}</AppText>
          </View>
        </Section>

        <Section title="Payment" index={3}>
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
        </Section>

        <Animated.View entering={FadeInDown.duration(450).delay(4 * 80)} layout={LAYOUT} style={styles.actions}>
          {onContactConcierge ? (
            <Button testID="contact-concierge" title="Message your concierge" variant="secondary" onPress={onContactConcierge} />
          ) : null}
          {cancellable ? (
            <Animated.View exiting={FadeOut.duration(200)}>
              <Button
                testID="cancel-trip"
                title="Cancel trip"
                variant="danger"
                onPress={() => {
                  haptics.selection();
                  setConfirming(true);
                }}
              />
            </Animated.View>
          ) : booking.status === 'confirmed' && state.tone === 'success' ? (
            <AppText variant="caption" muted style={styles.centered}>
              Within {CANCELLATION_WINDOW_HOURS} hours of departure, changes go through your concierge.
            </AppText>
          ) : null}
        </Animated.View>
      </ScrollView>

      <BottomSheet visible={confirming} title="Cancel this trip?" onClose={() => setConfirming(false)} testID="cancel-sheet">
        <View style={styles.sheet}>
          <AppText muted>
            {from.originCity} → {to.destinationCity} on {formatDate(from.departureAt)}. The{' '}
            {formatMoney(booking.totalPrice, booking.currency)} goes back to {booking.paymentLabel} within 5 working days.
          </AppText>
          {cancelError ? (
            <AppText testID="cancel-error" style={styles.error}>
              {errorMessage(cancelError)}
            </AppText>
          ) : null}
          <Button testID="confirm-cancel" title="Cancel trip" variant="danger" loading={cancelling} onPress={cancel} />
          <Button title="Keep trip" variant="secondary" onPress={() => setConfirming(false)} />
        </View>
      </BottomSheet>
    </Screen>
  );
}

function Section({ title, index, children }: { title: string; index: number; children: ReactNode }) {
  const styles = useStyles();
  return (
    <Animated.View entering={FadeInDown.duration(450).delay(index * 80)} layout={LAYOUT}>
      <Card style={styles.section}>
        <AppText variant="subtitle">{title}</AppText>
        {children}
      </Card>
    </Animated.View>
  );
}

function LegRow({ leg, last }: { leg: BookingLeg; last: boolean }) {
  const styles = useStyles();
  return (
    <View style={styles.leg}>
      <View style={styles.rail}>
        <View style={styles.dot} />
        {last ? null : <View style={styles.connector} />}
      </View>
      <View style={styles.legBody}>
        <AppText variant="caption" muted>
          {formatDate(leg.departureAt)} · {formatTime(leg.departureAt)}
        </AppText>
        <AppText variant="subtitle">
          {leg.originCity} ({leg.originCode}) → {leg.destinationCity} ({leg.destinationCode})
        </AppText>
        <AppText variant="caption" muted>
          {leg.aircraftModel} · {formatDuration(leg.durationMinutes)}
        </AppText>
      </View>
    </View>
  );
}

const useStyles = makeStyles(palette => ({
  content: { padding: spacing.lg, gap: spacing.lg },
  hero: { gap: spacing.lg },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  end: { alignItems: 'flex-end' },
  reference: {
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: palette.ashGrey,
    gap: 2,
  },
  code: { letterSpacing: 4 },
  section: { gap: spacing.md },
  line: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: spacing.md },
  notes: { gap: 2 },
  leg: { flexDirection: 'row', gap: spacing.md },
  rail: { width: 12, alignItems: 'center', paddingTop: 4 },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: palette.jetBlack },
  connector: { flex: 1, width: 2, backgroundColor: palette.iron, marginTop: 4 },
  legBody: { flex: 1, gap: 2, paddingBottom: spacing.md },
  actions: { gap: spacing.md },
  centered: { textAlign: 'center' },
  sheet: { gap: spacing.md, paddingTop: spacing.sm },
  error: { color: palette.error },
}));
