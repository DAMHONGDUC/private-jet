import { View } from 'react-native';
import { makeStyles } from '@/core/theme/blackjet';
import { AppSpacing } from '@/core/theme/app-spacing';
import { errorMessage } from '@/core/error/error-message';
import { AppText } from '@/core/ui/AppText';
import { BottomSheet } from '@/core/ui/BottomSheet';
import { Button, ButtonVariant } from '@/core/ui/Button';
import { wallClockIn } from '@/core/utils/date';
import { formatDayKey, formatMoney } from '@/core/utils/format';
import { useAirportZones } from '@/features/flights/presentation/use-airport-zones';
import { firstLeg, lastLeg, type Booking } from '../../domain/entities/booking';

type Props = {
  visible: boolean;
  booking: Booking;
  cancelling: boolean;
  /** The last cancel attempt's failure, if any. */
  error: unknown;
  onConfirm: () => void;
  onClose: () => void;
};

/** Asks before cancelling a trip and says where the refund goes. */
export function CancelTripSheet({
  visible,
  booking,
  cancelling,
  error,
  onConfirm,
  onClose,
}: Props) {
  const styles = useStyles();
  const from = firstLeg(booking);
  const to = lastLeg(booking);
  const zoneOf = useAirportZones();

  return (
    <BottomSheet
      visible={visible}
      title="Cancel this trip?"
      onClose={onClose}
      testID="cancel-sheet"
    >
      <View style={styles.sheet}>
        <AppText muted>
          {from.originCity} → {to.destinationCity} on{' '}
          {formatDayKey(
            wallClockIn(new Date(from.departureAt), zoneOf(from.originCode))
              .day,
          )}
          . The {formatMoney(booking.totalPrice, booking.currency)} goes back to{' '}
          {booking.paymentLabel} within 5 working days.
        </AppText>
        {error ? (
          <AppText testID="cancel-error" style={styles.error}>
            {errorMessage(error)}
          </AppText>
        ) : null}
        <Button
          testID="confirm-cancel"
          title="Cancel trip"
          variant={ButtonVariant.Danger}
          loading={cancelling}
          onPress={onConfirm}
        />
        <Button
          title="Keep trip"
          variant={ButtonVariant.Secondary}
          onPress={onClose}
        />
      </View>
    </BottomSheet>
  );
}

const useStyles = makeStyles(palette => ({
  sheet: { gap: AppSpacing.spacing12, paddingTop: AppSpacing.spacing8 },
  error: { color: palette.error },
}));
