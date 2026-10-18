import { useT } from '@/core/i18n/i18n';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useSelector } from 'react-redux';
import { blackJetCurves, makeStyles } from '@/core/theme/blackjet';
import { AppSpacing } from '@/core/theme/app-spacing';
import { AppText } from '@/core/ui/AppText';
import { BottomActions } from '@/core/ui/BottomActions';
import { Button } from '@/core/ui/Button';
import { Screen } from '@/core/ui/Screen';
import { errorMessage } from '@/core/error/error-message';
import { haptics } from '@/core/ui/haptics';
import { hasErrors } from '@/core/validation/field-errors';
import { selectUser } from '@/features/auth/presentation/session-slice';
import { newCardErrors } from '@/features/booking/domain/entities/payment';
import { useAddCardMutation } from '@/features/booking/presentation/booking-api';
import { CardForm } from '../components/CardForm';
import { FlippingCardPreview } from '../components/FlippingCardPreview';

const FLIP_EASING = Easing.bezier(...blackJetCurves.easeInOut);

type Props = {
  onAdded: () => void;
  /** Decides whether an expiry has passed; tests pin it. */
  now?: Date;
};

/**
 * A new card, previewed as it is typed; the card turns over to its back
 * while the security code is being entered.
 */
export function AddCardScreen({ onAdded, now: nowProp }: Props) {
  const styles = useStyles();
  const t = useT();
  const user = useSelector(selectUser);
  const [now] = useState(() => nowProp ?? new Date());
  const [holder, setHolder] = useState(user?.fullName ?? '');
  const [number, setNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  /** Errors show once Save was tapped, then follow the typing until fixed. */
  const [submitted, setSubmitted] = useState(false);
  const [addCard, { isLoading, error, reset }] = useAddCardMutation();
  const card = { holder, number, expiry, cvc };
  const errors = submitted ? newCardErrors(card, now) : {};

  const turned = useSharedValue(0);
  const turn = (back: boolean) => {
    turned.value = withTiming(back ? 1 : 0, {
      duration: 500,
      easing: FLIP_EASING,
    });
  };

  const submit = async () => {
    setSubmitted(true);
    if (hasErrors(newCardErrors(card, now))) {
      haptics.error();
      return;
    }
    reset();
    try {
      await addCard(card).unwrap();
      haptics.success();
      onAdded();
    } catch {
      haptics.error();
    }
  };

  const shownError = error ? errorMessage(error) : null;

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
          <FlippingCardPreview
            holder={holder}
            number={number}
            expiry={expiry}
            cvc={cvc}
            turned={turned}
          />

          <CardForm
            holder={holder}
            number={number}
            expiry={expiry}
            cvc={cvc}
            errors={errors}
            onHolderChange={setHolder}
            onNumberChange={setNumber}
            onExpiryChange={setExpiry}
            onCvcChange={setCvc}
            onCvcFocusChange={turn}
          />

          {shownError ? (
            <Animated.View entering={FadeIn}>
              <AppText testID="card-error" style={styles.error}>
                {shownError}
              </AppText>
            </Animated.View>
          ) : null}
        </ScrollView>
        <BottomActions>
          <Button
            testID="save-card"
            title={t('actions.saveCard')}
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
  content: { padding: AppSpacing.spacing16, gap: AppSpacing.spacing24 },
  error: { color: palette.error, textAlign: 'center' },
}));
