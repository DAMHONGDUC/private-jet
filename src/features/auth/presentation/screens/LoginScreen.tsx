import { useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
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
import { AppSpacing } from '@/core/theme/app-spacing';
import { radius } from '@/core/theme/theme';
import { BJText } from '@/core/ui/BJText';
import { PressableScale } from '@/core/ui/PressableScale';
import { errorMessage } from '@/core/error/error-message';
import { haptics } from '@/core/ui/haptics';
import { hasErrors } from '@/core/validation/field-errors';
import { imageFor } from '@/core/ui/images';
import { Wordmark, WordmarkTone } from '@/core/ui/Wordmark';
import { DEMO_CREDENTIALS, credentialErrors } from '../../domain/entities/user';
import { useSignInMutation } from '../auth-api';
import { DemoHint } from '../components/DemoHint';
import { LoginAlternatives } from '../components/LoginAlternatives';
import { LoginField } from '../components/LoginField';
import { PasswordField } from '../components/PasswordField';
import { BORDER, ERROR, MUTED } from '../login-colors';

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
            <LoginField
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
            <PasswordField
              value={password}
              onChangeText={setPassword}
              onSubmitEditing={() => submit({ email, password })}
              error={errors.password}
            />

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

            <LoginAlternatives busy={isLoading} onDemoSignIn={() => submit()} />
          </Animated.View>

          <DemoHint onPress={fillDemo} />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
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
    paddingHorizontal: AppSpacing.spacing16,
    gap: AppSpacing.spacing24,
  },
  spacer: { flex: 1, minHeight: 80 },
  subtitle: { color: MUTED, marginTop: AppSpacing.spacing8 },
  form: {
    gap: AppSpacing.spacing12,
    padding: AppSpacing.spacing16,
    borderRadius: radius.xl,
    backgroundColor: AppColors.fixed.photoScrim,
    borderWidth: 1,
    borderColor: BORDER,
  },
  error: { color: ERROR },
  primary: {
    height: 52,
    borderRadius: radius.md,
    backgroundColor: AppColors.dark.primaryAction,
    alignItems: 'center',
    justifyContent: 'center',
  },
  busy: { opacity: 0.7 },
  onPrimary: { color: AppColors.dark.onPrimaryAction },
});
