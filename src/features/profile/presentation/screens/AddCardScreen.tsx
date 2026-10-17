import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  FadeInDown,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useSelector } from 'react-redux';
import { blackJetCurves, makeStyles } from '@/core/theme/blackjet';
import { spacing } from '@/core/theme/theme';
import { AppText } from '@/core/ui/AppText';
import { BJText } from '@/core/ui/BJText';
import { Button } from '@/core/ui/Button';
import { Screen } from '@/core/ui/Screen';
import { errorMessage } from '@/core/ui/StateViews';
import { haptics } from '@/core/ui/haptics';
import { selectUser } from '@/features/auth/presentation/session-slice';
import { brandOf, validateNewCard } from '@/features/booking/domain/entities/payment';
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
  return digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
};

/**
 * A new card, previewed as it is typed; the card turns over to its back
 * while the security code is being entered.
 */
export function AddCardScreen({ onAdded, now: nowProp }: Props) {
  const styles = useStyles();
  const user = useSelector(selectUser);
  const [now] = useState(() => nowProp ?? new Date());
  const [holder, setHolder] = useState(user?.fullName ?? '');
  const [number, setNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [problem, setProblem] = useState<string | null>(null);
  const [addCard, { isLoading, error, reset }] = useAddCardMutation();

  const turned = useSharedValue(0);
  const turn = (back: boolean) => {
    turned.value = withTiming(back ? 1 : 0, { duration: 500, easing: FLIP_EASING });
  };
  const frontStyle = useAnimatedStyle(() => ({
    transform: [{ perspective: 1000 }, { rotateY: `${interpolate(turned.value, [0, 1], [0, 180])}deg` }],
  }));
  const backStyle = useAnimatedStyle(() => ({
    transform: [{ perspective: 1000 }, { rotateY: `${interpolate(turned.value, [0, 1], [180, 360])}deg` }],
  }));

  const submit = async () => {
    const card = { holder, number, expiry, cvc };
    const invalid = validateNewCard(card, now);
    setProblem(invalid);
    if (invalid) {
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

  const shownError = problem ?? (error ? errorMessage(error) : null);
  const preview = {
    kind: 'card' as const,
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
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Animated.View entering={FadeInDown.duration(500)} style={styles.stage}>
            <Animated.View style={[styles.face, frontStyle]}>
              <PaymentCard testID="card-preview" method={preview} number={number} />
            </Animated.View>
            <Animated.View style={[styles.face, styles.back, backStyle]}>
              <View style={styles.stripe} />
              <View style={styles.signature}>
                <View style={styles.signatureLines} />
                <View style={styles.cvcBox}>
                  <BJText size={15} weight="bold" style={styles.cvcText}>
                    {cvc.padEnd(3, '•')}
                  </BJText>
                </View>
              </View>
              <BJText size={10} style={styles.backNote}>
                Issued for the BlackJet demo. Charges are simulated and no money moves.
              </BJText>
            </Animated.View>
          </Animated.View>

          <Animated.View entering={FadeInDown.duration(450).delay(120)} style={styles.form}>
            <FormField
              testID="card-holder"
              label="Name on card"
              autoCapitalize="characters"
              value={holder}
              onChangeText={setHolder}
            />
            <FormField
              testID="card-number"
              label="Card number"
              keyboardType="number-pad"
              placeholder="4242 4242 4242 4242"
              value={number}
              onChangeText={text => setNumber(groupDigits(text))}
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
                />
              </View>
            </View>
            <AppText variant="caption" muted>
              Test numbers: 4242 4242 4242 4242 (Visa), 5555 5555 5555 4444 (Mastercard), any future expiry and code.
            </AppText>
          </Animated.View>

          {shownError ? (
            <Animated.View entering={FadeIn}>
              <AppText testID="card-error" style={styles.error}>
                {shownError}
              </AppText>
            </Animated.View>
          ) : null}

          <Button testID="save-card" title="Save card" loading={isLoading} onPress={submit} />
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const useStyles = makeStyles(palette => ({
  flex: { flex: 1 },
  content: { padding: spacing.lg, gap: spacing.xl },
  stage: { width: '100%', aspectRatio: CARD_RATIO },
  face: { ...StyleSheet.absoluteFill, backfaceVisibility: 'hidden' },
  back: {
    borderRadius: 18,
    overflow: 'hidden',
    backgroundImage: 'linear-gradient(135deg, #2A2A2A 0%, #151515 100%)',
    paddingVertical: 22,
    gap: 18,
  },
  stripe: { height: 42, backgroundColor: '#0A0A0A' },
  signature: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, gap: 10 },
  signatureLines: {
    flex: 1,
    height: 36,
    borderRadius: 4,
    backgroundColor: '#E9E6DF',
  },
  cvcBox: {
    width: 64,
    height: 36,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cvcText: { color: '#111111', letterSpacing: 2 },
  backNote: { color: 'rgba(255, 255, 255, 0.5)', paddingHorizontal: 20 },
  form: { gap: spacing.md },
  row: { flexDirection: 'row', gap: spacing.md },
  error: { color: palette.error, textAlign: 'center' },
}));
