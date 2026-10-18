import { StyleSheet } from 'react-native';
import Animated, { FadeOut } from 'react-native-reanimated';
import { useT } from '@/core/i18n/i18n';
import { AppText } from '@/core/ui/AppText';
import { BottomActions } from '@/core/ui/BottomActions';
import { Button, ButtonVariant } from '@/core/ui/Button';
import { CANCELLATION_WINDOW_HOURS } from '../../domain/entities/booking';

type Props = {
  cancellable: boolean;
  /** Too late to cancel here, so the bar says who to ask. */
  closeToDeparture: boolean;
  onContactConcierge?: () => void;
  onCancel: () => void;
};

/** The trip's pinned actions: message the concierge and cancel, or the late-changes note. */
export function TripActions({
  cancellable,
  closeToDeparture,
  onContactConcierge,
  onCancel,
}: Props) {
  const t = useT();
  if (!onContactConcierge && !cancellable && !closeToDeparture) {
    return null;
  }
  return (
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
            onPress={onCancel}
          />
        </Animated.View>
      ) : closeToDeparture ? (
        <AppText variant="caption" muted style={styles.centered}>
          {t('actions.lateChanges', { hours: CANCELLATION_WINDOW_HOURS })}
        </AppText>
      ) : null}
    </BottomActions>
  );
}

const styles = StyleSheet.create({
  centered: { textAlign: 'center' },
});
