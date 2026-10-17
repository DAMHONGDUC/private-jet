import { useEffect, useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
  type ImageSourcePropType,
  type TextInputProps,
} from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { blackJetFonts } from '@/core/theme/blackjet';
import { BJText } from '@/core/ui/BJText';
import { FadeUp } from '@/core/ui/FadeUp';
import { PressableScale } from '@/core/ui/PressableScale';
import { errorMessage } from '@/core/ui/StateViews';
import { haptics } from '@/core/ui/haptics';
import { BRAND_ICONS, LOGO, imageFor } from '@/core/ui/images';
import { DEMO_CREDENTIALS, validateCredentials } from '../../domain/entities/user';
import { useSignInMutation } from '../auth-api';

const WHITE = '#FFFFFF';
const MUTED = 'rgba(255, 255, 255, 0.7)';
const FIELD = 'rgba(255, 255, 255, 0.12)';
const BORDER = 'rgba(255, 255, 255, 0.22)';
const ERROR = '#FF6B6B';

/**
 * Sign in over a slowly drifting jet photo. Email and password, a one-tap
 * demo account, and Apple / Google buttons that use the demo account too.
 * A wrong password shakes the form.
 */
export function LoginScreen() {
  const insets = useSafeAreaInsets();
  const [signIn, { isLoading }] = useSignInMutation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [hidden, setHidden] = useState(true);
  const [problem, setProblem] = useState<string | null>(null);

  const drift = useSharedValue(0);
  const shake = useSharedValue(0);

  useEffect(() => {
    drift.value = withRepeat(withTiming(1, { duration: 14000, easing: Easing.inOut(Easing.quad) }), -1, true);
  }, [drift]);

  const photoStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1.05 + drift.value * 0.1 }, { translateX: -12 + drift.value * 24 }],
  }));
  const formStyle = useAnimatedStyle(() => ({ transform: [{ translateX: shake.value }] }));

  const fail = (message: string) => {
    setProblem(message);
    haptics.error();
    shake.value = withSequence(
      withTiming(-10, { duration: 50 }),
      withRepeat(withTiming(10, { duration: 80 }), 4, true),
      withTiming(0, { duration: 50 }),
    );
  };

  const submit = async (credentials?: { email: string; password: string }) => {
    if (credentials) {
      const invalid = validateCredentials(credentials);
      if (invalid) {
        fail(invalid);
        return;
      }
    }
    setProblem(null);
    try {
      await signIn(credentials).unwrap();
      haptics.success();
    } catch (error) {
      fail(errorMessage(error));
    }
  };

  const fillDemo = () => {
    haptics.selection();
    setEmail(DEMO_CREDENTIALS.email);
    setPassword(DEMO_CREDENTIALS.password);
    setProblem(null);
  };

  return (
    <View testID="login-screen" style={styles.root}>
      <Animated.Image source={imageFor('jet-4')} resizeMode="cover" style={[StyleSheet.absoluteFill, photoStyle]} />
      <View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.shade]} />

      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={[styles.content, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 24 }]}
        >
          <Animated.View entering={FadeIn.duration(900)}>
            <Image source={LOGO.dark} resizeMode="cover" style={styles.logo} accessibilityLabel="BlackJet" />
          </Animated.View>

          <View style={styles.spacer} />

          <FadeUp index={0}>
            <BJText size={34} weight="bold" tone="white">
              Welcome back
            </BJText>
            <BJText size={16} weight="regular" style={styles.subtitle}>
              Sign in to plan your next private flight.
            </BJText>
          </FadeUp>

          <FadeUp index={1}>
            <Animated.View style={[styles.form, formStyle]}>
              <Field
                testID="login-email"
                label="Email"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                textContentType="emailAddress"
                placeholder="you@example.com"
              />
              <View>
                <Field
                  testID="login-password"
                  label="Password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={hidden}
                  textContentType="password"
                  placeholder="••••••••"
                  onSubmitEditing={() => submit({ email, password })}
                />
                <PressableScale
                  testID="login-toggle-password"
                  accessibilityRole="button"
                  onPress={() => setHidden(value => !value)}
                  style={styles.toggle}
                >
                  <BJText size={12} style={styles.muted}>
                    {hidden ? 'Show' : 'Hide'}
                  </BJText>
                </PressableScale>
              </View>

              {problem ? (
                <Animated.View entering={FadeIn.duration(200)}>
                  <BJText testID="login-error" size={13} weight="regular" style={styles.error}>
                    {problem}
                  </BJText>
                </Animated.View>
              ) : null}

              <PressableScale
                testID="login-submit"
                accessibilityRole="button"
                accessibilityState={{ busy: isLoading }}
                disabled={isLoading}
                onPress={() => submit({ email, password })}
                style={[styles.primary, isLoading && styles.busy]}
              >
                <BJText size={16} style={styles.primaryText}>
                  {isLoading ? 'Signing in…' : 'Sign In'}
                </BJText>
              </PressableScale>

              <View style={styles.divider}>
                <View style={styles.line} />
                <BJText size={12} style={styles.muted}>
                  or
                </BJText>
                <View style={styles.line} />
              </View>

              <PressableScale
                testID="login-demo"
                accessibilityRole="button"
                disabled={isLoading}
                onPress={() => submit()}
                style={styles.outlined}
              >
                <BJText size={16} tone="white">
                  Continue with Demo Account
                </BJText>
              </PressableScale>

              <View style={styles.socialRow}>
                <SocialButton testID="login-apple" label="Apple" icon={BRAND_ICONS.apple} tint onPress={() => submit()} />
                <SocialButton testID="login-google" label="Google" icon={BRAND_ICONS.google} onPress={() => submit()} />
              </View>
            </Animated.View>
          </FadeUp>

          <FadeUp index={2}>
            <PressableScale testID="login-fill-demo" accessibilityRole="button" onPress={fillDemo} style={styles.hint}>
              <BJText size={12} style={styles.muted}>
                Demo account · tap to fill
              </BJText>
              <BJText size={13} tone="white">
                {DEMO_CREDENTIALS.email} · {DEMO_CREDENTIALS.password}
              </BJText>
            </PressableScale>
          </FadeUp>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

function Field({ label, testID, ...input }: TextInputProps & { label: string; testID: string }) {
  return (
    <View style={styles.field}>
      <BJText size={12} style={styles.muted}>
        {label}
      </BJText>
      <TextInput testID={testID} placeholderTextColor="rgba(255, 255, 255, 0.4)" {...input} style={styles.input} />
    </View>
  );
}

type SocialProps = { testID: string; label: string; icon: ImageSourcePropType; tint?: boolean; onPress: () => void };

function SocialButton({ testID, label, icon, tint, onPress }: SocialProps) {
  return (
    <PressableScale testID={testID} accessibilityRole="button" onPress={onPress} style={[styles.outlined, styles.social]}>
      <Image source={icon} style={[styles.socialIcon, tint && styles.tinted]} />
      <BJText size={15} tone="white">
        {label}
      </BJText>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#000000', overflow: 'hidden' },
  flex: { flex: 1 },
  shade: {
    backgroundImage:
      'linear-gradient(180deg, rgba(0, 0, 0, 0.55) 0%, rgba(0, 0, 0, 0.25) 35%, rgba(0, 0, 0, 0.85) 70%, rgba(0, 0, 0, 0.95) 100%)',
  },
  content: { flexGrow: 1, paddingHorizontal: 20, gap: 20 },
  logo: { width: 150, height: 52, marginLeft: -12 },
  spacer: { flex: 1, minHeight: 80 },
  subtitle: { color: MUTED, marginTop: 6 },
  form: {
    gap: 14,
    padding: 16,
    borderRadius: 24,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    borderWidth: 1,
    borderColor: BORDER,
  },
  field: { gap: 6 },
  input: {
    height: 50,
    borderRadius: 12,
    paddingHorizontal: 14,
    backgroundColor: FIELD,
    color: WHITE,
    fontFamily: blackJetFonts.regular,
    fontSize: 15,
  },
  toggle: { position: 'absolute', right: 12, bottom: 15 },
  muted: { color: MUTED },
  error: { color: ERROR },
  primary: { height: 50, borderRadius: 12, backgroundColor: WHITE, alignItems: 'center', justifyContent: 'center' },
  primaryText: { color: '#000000' },
  busy: { opacity: 0.7 },
  divider: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  line: { flex: 1, height: StyleSheet.hairlineWidth, backgroundColor: BORDER },
  outlined: {
    height: 50,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BORDER,
    alignItems: 'center',
    justifyContent: 'center',
  },
  socialRow: { flexDirection: 'row', gap: 12 },
  social: { flex: 1, flexDirection: 'row', gap: 8 },
  socialIcon: { width: 18, height: 18 },
  tinted: { tintColor: WHITE },
  hint: { alignItems: 'center', gap: 4, paddingVertical: 8 },
});
