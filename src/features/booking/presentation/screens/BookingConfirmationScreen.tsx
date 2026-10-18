import { useEffect } from 'react';
import { View } from 'react-native';
import { useT } from '@/core/i18n/i18n';
import { makeStyles } from '@/core/theme/blackjet';
import { AppSpacing } from '@/core/theme/app-spacing';
import { AppText } from '@/core/ui/AppText';
import { BottomActions } from '@/core/ui/BottomActions';
import { Button, ButtonVariant } from '@/core/ui/Button';
import { Screen } from '@/core/ui/Screen';
import { LoadingView } from '@/core/ui/StateViews';
import { haptics } from '@/core/ui/haptics';
import { useGetBookingQuery } from '../booking-api';
import { BoardingPass } from '../components/BoardingPass';
import { SuccessMark } from '../components/SuccessMark';

type Props = { bookingId: string; onViewTrip: () => void; onDone: () => void };

/** The tick and the trip as a boarding pass; then on to the trip or back. */
export function BookingConfirmationScreen({
  bookingId,
  onViewTrip,
  onDone,
}: Props) {
  const styles = useStyles();
  const t = useT();
  const { data: booking } = useGetBookingQuery(bookingId);

  useEffect(() => {
    if (booking) {
      haptics.success();
    }
  }, [booking]);

  if (!booking) {
    return (
      <Screen>
        <LoadingView />
      </Screen>
    );
  }

  return (
    <Screen top>
      <View style={styles.content}>
        <SuccessMark />
        <View style={styles.center}>
          <AppText variant="display">You're booked</AppText>
          <AppText muted>
            Your concierge will be in touch before you fly.
          </AppText>
        </View>
        <BoardingPass booking={booking} />
      </View>
      <BottomActions style={styles.actions}>
        <Button
          testID="view-trip"
          title={t('actions.viewTrip')}
          onPress={onViewTrip}
        />
        <Button
          testID="booking-done"
          title={t('actions.done')}
          variant={ButtonVariant.Secondary}
          onPress={onDone}
        />
      </BottomActions>
    </Screen>
  );
}

const useStyles = makeStyles(() => ({
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: AppSpacing.xl,
    gap: AppSpacing.lg,
  },
  center: { alignItems: 'center', gap: AppSpacing.xs },
  /** A quiet ending: no rule over the buttons. */
  actions: { borderTopWidth: 0 },
}));
