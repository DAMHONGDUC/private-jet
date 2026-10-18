import { useT } from '@/core/i18n/i18n';
import { AppColors } from '@/core/theme/app-colors';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useSelector } from 'react-redux';
import { blackJetCurves, makeStyles } from '@/core/theme/blackjet';
import { AppSpacing } from '@/core/theme/app-spacing';
import { AppText } from '@/core/ui/AppText';
import { BJText } from '@/core/ui/BJText';
import { BottomActions } from '@/core/ui/BottomActions';
import { Button } from '@/core/ui/Button';
import { Screen } from '@/core/ui/Screen';
import { errorMessage } from '@/core/error/error-message';
import { haptics } from '@/core/ui/haptics';
import { hasErrors } from '@/core/validation/field-errors';
import { selectUser } from '@/features/auth/presentation/session-slice';
import {
  brandOf,
  newCardErrors,
  PaymentMethodKind,
} from '@/features/booking/domain/entities/payment';
import { useAddCardMutation } from '@/features/booking/presentation/booking-api';
import { FormField } from '@/features/booking/presentation/components/FormField';
import { CARD_RATIO, PaymentCard } from '../components/PaymentCard';

const FLIP_EASING = Easing.bezier(...blackJetCurves.easeInOut);

type Props = {
  onAdded: () => void;
  /** Decides whether an expiry has passed; tests pin it. */
  now?: Date;
};

/** "4242424242424242" → "4242 4242 4242 4242". */
const groupDigits = (text: string) =>
  text
    .replace(/\D/g, '')
    .slice(0, 19)
    .replace(/(\d{4})(?=\d)/g, '$1 ');

/** "1228" → "12/28"; deleting the slash deletes the month's last digit too. */
const formatExpiry = (text: string) => {
  const digits = text.replace(/\D/g, '').slice(0, 4);
  return digits.length > 2
    ? `${digits.slice(0, 2)}/${digits.slice(2)}`
    : digits;
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
  const frontStyle = useAnimatedStyle(() => ({
    transform: [
      { perspective: 1000 },
      { rotateY: `${interpolate(turned.value, [0, 1], [0, 180])}deg` },
    ],
  }));
  const backStyle = useAnimatedStyle(() => ({
    transform: [
      { perspective: 1000 },
      { rotateY: `${interpolate(turned.value, [0, 1], [180, 360])}deg` },
    ],
  }));

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
  const preview = {
    kind: PaymentMethodKind.Card,
    brand: brandOf(number),
    holder: holder.toUpperCase(),
    expiry,
  };

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
          <View style={styles.stage}>
            <Animated.View style={[styles.face, frontStyle]}>
              <PaymentCard
                testID="card-preview"
                method={preview}
                number={number}
              />
            </Animated.View>
            <Animated.View style={[styles.face, styles.back, backStyle]}>
              <View style={styles.stripe} />
              <View style={styles.signature}>
                <View style={styles.signatureLines} />
                <View style={styles.cvcBox}>
                  <BJText size={16} weight="medium" style={styles.cvcText}>
                    {cvc.padEnd(3, '•')}
                  </BJText>
                </View>
              </View>
              <BJText size={13} style={styles.backNote}>
                Issued for the Sovereign demo. Charges are simulated and no
                money moves.
              </BJText>
            </Animated.View>
          </View>

          <View style={styles.form}>
            <FormField
              testID="card-holder"
              label="Name on card"
              autoCapitalize="characters"
              value={holder}
              onChangeText={setHolder}
              error={errors.holder}
            />
            <FormField
              testID="card-number"
              label="Card number"
              keyboardType="number-pad"
              placeholder="4242 4242 4242 4242"
              value={number}
              onChangeText={text => setNumber(groupDigits(text))}
              error={errors.number}
            />
            <View style={styles.row}>
              <View style={styles.flex}>
                <FormField
                  testID="card-expiry"
                  label="Expiry"
                  keyboardType="number-pad"
                  placeholder="MM/YY"
                  value={expiry}
                  onChangeText={text => setExpiry(formatExpiry(text))}
                  error={errors.expiry}
                />
              </View>
              <View style={styles.flex}>
                <FormField
                  testID="card-cvc"
                  label="Security code"
                  keyboardType="number-pad"
                  placeholder="CVC"
                  secureTextEntry
                  maxLength={4}
                  value={cvc}
                  onFocus={() => turn(true)}
                  onBlur={() => turn(false)}
                  onChangeText={text => setCvc(text.replace(/\D/g, ''))}
                  error={errors.cvc}
                />
              </View>
            </View>
            <AppText variant="caption" muted>
              Test numbers: 4242 4242 4242 4242 (Visa), 5555 5555 5555 4444
              (Mastercard), any future expiry and code.
            </AppText>
          </View>

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
  content: { padding: AppSpacing.lg, gap: AppSpacing.xl },
  stage: { width: '100%', aspectRatio: CARD_RATIO },
  face: { ...StyleSheet.absoluteFill, backfaceVisibility: 'hidden' },
  back: {
    borderRadius: 18,
    overflow: 'hidden',
    backgroundImage: 'linear-gradient(135deg, #2A2A2A 0%, #151515 100%)',
    paddingVertical: 22,
    gap: 18,
  },
  stripe: { height: 42, backgroundColor: AppColors.fixed.cardStripe },
  signature: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    gap: 10,
  },
  signatureLines: {
    flex: 1,
    height: 36,
    borderRadius: 4,
    backgroundColor: AppColors.fixed.cardBack,
  },
  cvcBox: {
    width: 64,
    height: 36,
    borderRadius: 4,
    backgroundColor: AppColors.fixed.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cvcText: { color: AppColors.fixed.cardInk, letterSpacing: 2 },
  backNote: { color: 'rgba(255, 255, 255, 0.5)', paddingHorizontal: 20 },
  form: { gap: AppSpacing.md },
  row: { flexDirection: 'row', gap: AppSpacing.md },
  error: { color: palette.error, textAlign: 'center' },
}));
