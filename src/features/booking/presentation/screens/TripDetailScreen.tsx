import { useState, type ReactNode } from 'react';
import { ScrollView, View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { useT } from '@/core/i18n/i18n';
import { makeStyles } from '@/core/theme/blackjet';
import { AppSpacing } from '@/core/theme/app-spacing';
import { AppText } from '@/core/ui/AppText';
import { BottomSheet } from '@/core/ui/BottomSheet';
import { BottomActions } from '@/core/ui/BottomActions';
import { Button, ButtonVariant } from '@/core/ui/Button';
import { Card } from '@/core/ui/Card';
import { FlightPath } from '@/core/ui/FlightPath';
import { Screen } from '@/core/ui/Screen';
import { ErrorView, LoadingView, errorMessage } from '@/core/ui/StateViews';
import { StatusPill, StatusTone } from '@/core/ui/StatusPill';
import { haptics } from '@/core/ui/haptics';
import {
  formatDate,
  formatDuration,
  formatMoney,
  formatTime,
} from '@/core/utils/format';
import {
  BookingStatus,
  canCancel,
  CANCELLATION_WINDOW_HOURS,
  firstLeg,
  lastLeg,
  type BookingLeg,
} from '../../domain/entities/booking';
import { useCancelBookingMutation, useGetBookingQuery } from '../booking-api';
import { kindLabel, tripState } from '../trip-labels';

type Props = {
  bookingId: string;
  onContactConcierge?: () => void;
  /** Decides whether the trip can still be cancelled; tests pin it. */
  now?: Date;
};

/** Everything about one trip: route, legs, party, payment, and cancelling it. */
export function TripDetailScreen({
  bookingId,
  onContactConcierge,
  now: nowProp,
}: Props) {
  const styles = useStyles();
  const t = useT();
  const [now] = useState(() => nowProp ?? new Date());
  const [confirming, setConfirming] = useState(false);
  const {
    data: booking,
    error,
    isLoading,
    refetch,
  } = useGetBookingQuery(bookingId);
  const [cancelBooking, { isLoading: cancelling, error: cancelError }] =
    useCancelBookingMutation();

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

  /** Too late to cancel here, so the bar says who to ask. */
  const closeToDeparture =
    !cancellable &&
    booking.status === BookingStatus.Confirmed &&
    state.tone === StatusTone.Success;

  return (
    <Screen>
      <ScrollView
        testID="trip-scroll"
        contentContainerStyle={[
          styles.content,
          { paddingBottom: AppSpacing.xl },
        ]}
      >
        <View>
          <Card style={styles.hero}>
            <View style={styles.row}>
              <AppText variant="label" muted>
                {kindLabel(booking)}
              </AppText>
              <Animated.View key={state.label} entering={FadeIn.duration(250)}>
                <StatusPill
                  testID="trip-status"
                  label={state.label}
                  tone={state.tone}
                />
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
              <AppText
                testID="trip-reference"
                variant="title"
                style={styles.code}
              >
                {booking.reference}
              </AppText>
            </View>
          </Card>
        </View>

        <Section title={booking.legs.length > 1 ? 'Itinerary' : 'Flight'}>
          {booking.legs.map((leg, index) => (
            <LegRow
              key={`${leg.originCode}-${leg.departureAt}`}
              leg={leg}
              last={index === booking.legs.length - 1}
            />
          ))}
        </Section>

        <Section title={`Guests · ${booking.passengers.length}`}>
          {booking.passengers.map((passenger, index) => (
            <View key={`${passenger.fullName}-${index}`} style={styles.line}>
              <AppText>{passenger.fullName}</AppText>
              <AppText variant="caption" muted>
                {index === 0 ? 'Lead guest' : `Guest ${index}`}
              </AppText>
            </View>
          ))}
          <View style={styles.line}>
            <AppText muted>Contact</AppText>
            <AppText>{booking.contactEmail}</AppText>
          </View>
        </Section>

        <Section title="Payment">
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
      </ScrollView>

      {onContactConcierge || cancellable || closeToDeparture ? (
        <BottomActions>
          {onContactConcierge ? (
            <Button
              testID="contact-concierge"
              title={t('actions.messageConcierge')}
              variant={ButtonVariant.Secondary}
              onPress={onContactConcierge}
            />
          ) : null}
          {cancellable ? (
            <Animated.View exiting={FadeOut.duration(200)}>
              <Button
                testID="cancel-trip"
                title={t('actions.cancelTrip')}
                variant={ButtonVariant.Danger}
                onPress={() => {
                  haptics.selection();
                  setConfirming(true);
                }}
              />
            </Animated.View>
          ) : closeToDeparture ? (
            <AppText variant="caption" muted style={styles.centered}>
              {t('actions.lateChanges', { hours: CANCELLATION_WINDOW_HOURS })}
            </AppText>
          ) : null}
        </BottomActions>
      ) : null}

      <BottomSheet
        visible={confirming}
        title="Cancel this trip?"
        onClose={() => setConfirming(false)}
        testID="cancel-sheet"
      >
        <View style={styles.sheet}>
          <AppText muted>
            {from.originCity} → {to.destinationCity} on{' '}
            {formatDate(from.departureAt)}. The{' '}
            {formatMoney(booking.totalPrice, booking.currency)} goes back to{' '}
            {booking.paymentLabel} within 5 working days.
          </AppText>
          {cancelError ? (
            <AppText testID="cancel-error" style={styles.error}>
              {errorMessage(cancelError)}
            </AppText>
          ) : null}
          <Button
            testID="confirm-cancel"
            title="Cancel trip"
            variant={ButtonVariant.Danger}
            loading={cancelling}
            onPress={cancel}
          />
          <Button
            title="Keep trip"
            variant={ButtonVariant.Secondary}
            onPress={() => setConfirming(false)}
          />
        </View>
      </BottomSheet>
    </Screen>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  const styles = useStyles();
  return (
    <View>
      <Card style={styles.section}>
        <AppText variant="subtitle">{title}</AppText>
        {children}
      </Card>
    </View>
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
          {leg.originCity} ({leg.originCode}) → {leg.destinationCity} (
          {leg.destinationCode})
        </AppText>
        <AppText variant="caption" muted>
          {leg.aircraftModel} · {formatDuration(leg.durationMinutes)}
        </AppText>
      </View>
    </View>
  );
}

const useStyles = makeStyles(palette => ({
  content: { padding: AppSpacing.lg, gap: AppSpacing.lg },
  hero: { gap: AppSpacing.lg },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  end: { alignItems: 'flex-end' },
  reference: {
    alignItems: 'center',
    paddingVertical: AppSpacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: palette.ashGrey,
    gap: 2,
  },
  code: { letterSpacing: 4 },
  section: { gap: AppSpacing.md },
  line: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: AppSpacing.md,
  },
  notes: { gap: 2 },
  leg: { flexDirection: 'row', gap: AppSpacing.md },
  rail: { width: 12, alignItems: 'center', paddingTop: 4 },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: palette.accent,
  },
  connector: { flex: 1, width: 2, backgroundColor: palette.iron, marginTop: 4 },
  legBody: { flex: 1, gap: 2, paddingBottom: AppSpacing.md },
  centered: { textAlign: 'center' },
  sheet: { gap: AppSpacing.md, paddingTop: AppSpacing.sm },
  error: { color: palette.error },
}));
