import { useState } from 'react';
import { ScrollView } from 'react-native';
import { makeStyles } from '@/core/theme/blackjet';
import { AppSpacing } from '@/core/theme/app-spacing';
import { Screen } from '@/core/ui/Screen';
import { ErrorView } from '@/core/ui/ErrorView';
import { LoadingView } from '@/core/ui/LoadingView';
import { StatusTone } from '@/core/ui/StatusPill';
import { haptics } from '@/core/ui/haptics';
import { BookingStatus, canCancel } from '../../domain/entities/booking';
import { useCancelBookingMutation, useGetBookingQuery } from '../booking-api';
import { CancelTripSheet } from '../components/CancelTripSheet';
import { TripActions } from '../components/TripActions';
import { TripGuests } from '../components/TripGuests';
import { TripHero } from '../components/TripHero';
import { TripLegRow } from '../components/TripLegRow';
import { TripPayment } from '../components/TripPayment';
import { TripSection } from '../components/TripSection';
import { tripState } from '../trip-labels';

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
        <TripHero booking={booking} state={state} />

        <TripSection title={booking.legs.length > 1 ? 'Itinerary' : 'Flight'}>
          {booking.legs.map((leg, index) => (
            <TripLegRow
              key={`${leg.originCode}-${leg.departureAt}`}
              leg={leg}
              last={index === booking.legs.length - 1}
            />
          ))}
        </TripSection>

        <TripGuests booking={booking} />

        <TripPayment booking={booking} />
      </ScrollView>

      <TripActions
        cancellable={cancellable}
        closeToDeparture={closeToDeparture}
        onContactConcierge={onContactConcierge}
        onCancel={() => {
          haptics.selection();
          setConfirming(true);
        }}
      />

      <CancelTripSheet
        visible={confirming}
        booking={booking}
        cancelling={cancelling}
        error={cancelError}
        onConfirm={cancel}
        onClose={() => setConfirming(false)}
      />
    </Screen>
  );
}

const useStyles = makeStyles(() => ({
  content: { padding: AppSpacing.lg, gap: AppSpacing.lg },
}));
