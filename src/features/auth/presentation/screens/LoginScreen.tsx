import { useState } from 'react';
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
  FadeIn,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppColors } from '@/core/theme/app-colors';
import { blackJetFonts } from '@/core/theme/blackjet';
import { AppSpacing } from '@/core/theme/app-spacing';
import { radius } from '@/core/theme/theme';
import { BJText } from '@/core/ui/BJText';
import { PressableScale } from '@/core/ui/PressableScale';
import { errorMessage } from '@/core/ui/StateViews';
import { haptics } from '@/core/ui/haptics';
import { hasErrors } from '@/core/validation/field-errors';
import { BRAND_ICONS, imageFor } from '@/core/ui/images';
import { Wordmark, WordmarkTone } from '@/core/ui/Wordmark';
import { DEMO_CREDENTIALS, credentialErrors } from '../../domain/entities/user';
import { useSignInMutation } from '../auth-api';

const WHITE = AppColors.fixed.white;
const MUTED = AppColors.fixed.onPhotoMuted;
const FIELD = 'rgba(255, 255, 255, 0.12)';
const BORDER = 'rgba(255, 255, 255, 0.22)';
const ERROR = '#FF6B6B';

/**
 * Sign in over a jet photo. Email and password, a one-tap
 * demo account, and Apple / Google buttons that use the demo account too.
 * A wrong password shakes the form.
 */
export function LoginScreen() {
  const insets = useSafeAreaInsets();
  const [signIn, { isLoading }] = useSignInMutation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [hidden, setHidden] = useState(true);
  /** A sign-in failure the fields cannot show, such as a wrong password. */
  const [problem, setProblem] = useState<string | null>(null);
  /** Field errors show once Sign In was tapped, then follow the typing. */
  const [submitted, setSubmitted] = useState(false);
  const errors = submitted ? credentialErrors({ email, password }) : {};

  const shake = useSharedValue(0);
  const formStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shake.value }],
  }));

  const fail = (message: string | null) => {
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
      setSubmitted(true);
      if (hasErrors(credentialErrors(credentials))) {
        fail(null);
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
    setSubmitted(false);
  };

  return (
    <View testID="login-screen" style={styles.root}>
      <Image
        source={imageFor('jet-4')}
        resizeMode="cover"
        style={[StyleSheet.absoluteFill, styles.photo]}
      />
      <View
        pointerEvents="none"
        style={[StyleSheet.absoluteFill, styles.shade]}
      />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={[
            styles.content,
            { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 24 },
          ]}
        >
          <Wordmark tone={WordmarkTone.OnPhoto} />

          <View style={styles.spacer} />

          <View>
            <BJText size={28} tone="white">
              Welcome back
            </BJText>
            <BJText size={16} weight="regular" style={styles.subtitle}>
              Sign in to plan your next private flight.
            </BJText>
          </View>

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
              error={errors.email}
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
                error={errors.password}
              />
              <PressableScale
                testID="login-toggle-password"
                accessibilityRole="button"
                onPress={() => setHidden(value => !value)}
                style={styles.toggle}
              >
                <BJText size={13} style={styles.muted}>
                  {hidden ? 'Show' : 'Hide'}
                </BJText>
              </PressableScale>
            </View>

            {problem ? (
              <Animated.View entering={FadeIn.duration(200)}>
                <BJText
                  testID="login-error"
                  size={13}
                  weight="regular"
                  style={styles.error}
                >
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
              <BJText style={styles.onPrimary}>
                {isLoading ? 'Signing in…' : 'Sign In'}
              </BJText>
            </PressableScale>

            <View style={styles.divider}>
              <View style={styles.line} />
              <BJText size={13} style={styles.muted}>
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
              <SocialButton
                testID="login-apple"
                label="Apple"
                icon={BRAND_ICONS.apple}
                tint
                onPress={() => submit()}
              />
              <SocialButton
                testID="login-google"
                label="Google"
                icon={BRAND_ICONS.google}
                onPress={() => submit()}
              />
            </View>
          </Animated.View>

          <PressableScale
            testID="login-fill-demo"
            accessibilityRole="button"
            onPress={fillDemo}
            style={styles.hint}
          >
            <BJText size={13} style={styles.muted}>
              Demo account · tap to fill
            </BJText>
            <BJText size={13} tone="white">
              {DEMO_CREDENTIALS.email} · {DEMO_CREDENTIALS.password}
            </BJText>
          </PressableScale>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

function Field({
  label,
  testID,
  error,
  ...input
}: TextInputProps & { label: string; testID: string; error?: string }) {
  return (
    <View style={styles.field}>
      <BJText size={13} style={styles.muted}>
        {label}
      </BJText>
      <TextInput
        testID={testID}
        placeholderTextColor="rgba(255, 255, 255, 0.4)"
        accessibilityHint={error}
        {...input}
        style={[styles.input, error ? styles.invalid : null]}
      />
      {error ? (
        <BJText
          testID={`${testID}-error`}
          size={13}
          weight="regular"
          accessibilityRole="alert"
          style={styles.error}
        >
          {error}
        </BJText>
      ) : null}
    </View>
  );
}

type SocialProps = {
  testID: string;
  label: string;
  icon: ImageSourcePropType;
  tint?: boolean;
  onPress: () => void;
};

function SocialButton({ testID, label, icon, tint, onPress }: SocialProps) {
  return (
    <PressableScale
      testID={testID}
      accessibilityRole="button"
      onPress={onPress}
      style={[styles.outlined, styles.social]}
    >
      <Image source={icon} style={[styles.socialIcon, tint && styles.tinted]} />
      <BJText size={16} tone="white">
        {label}
      </BJText>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: AppColors.fixed.black, overflow: 'hidden' },
  flex: { flex: 1 },
  shade: {
    backgroundImage:
      'linear-gradient(180deg, rgba(0, 0, 0, 0.55) 0%, rgba(0, 0, 0, 0.25) 35%, rgba(0, 0, 0, 0.85) 70%, rgba(0, 0, 0, 0.95) 100%)',
  },
  photo: { width: '100%', height: '100%' },
  content: {
    flexGrow: 1,
    paddingHorizontal: AppSpacing.lg,
    gap: AppSpacing.xl,
  },
  spacer: { flex: 1, minHeight: 80 },
  subtitle: { color: MUTED, marginTop: AppSpacing.sm },
  form: {
    gap: AppSpacing.md,
    padding: AppSpacing.lg,
    borderRadius: radius.xl,
    backgroundColor: AppColors.fixed.photoScrim,
    borderWidth: 1,
    borderColor: BORDER,
  },
  field: { gap: 6 },
  input: {
    height: 52,
    borderRadius: radius.md,
    paddingHorizontal: AppSpacing.lg,
    backgroundColor: FIELD,
    color: WHITE,
    fontFamily: blackJetFonts.regular,
    fontSize: 16,
  },
  toggle: { position: 'absolute', right: 12, bottom: 15 },
  muted: { color: MUTED },
  error: { color: ERROR },
  invalid: { borderWidth: 1, borderColor: ERROR },
  primary: {
    height: 52,
    borderRadius: radius.md,
    backgroundColor: AppColors.dark.primaryAction,
    alignItems: 'center',
    justifyContent: 'center',
  },
  busy: { opacity: 0.7 },
  onPrimary: { color: AppColors.dark.onPrimaryAction },
  divider: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  line: { flex: 1, height: StyleSheet.hairlineWidth, backgroundColor: BORDER },
  outlined: {
    height: 52,
    borderRadius: radius.md,
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
