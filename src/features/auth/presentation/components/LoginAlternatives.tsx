import { StyleSheet, View } from 'react-native';
import { radius } from '@/core/theme/theme';
import { BJText } from '@/core/ui/BJText';
import { PressableScale } from '@/core/ui/PressableScale';
import { BRAND_ICONS } from '@/core/ui/images';
import { BORDER, MUTED } from '../login-colors';
import { SocialButton } from './SocialButton';

type Props = {
  /** A sign-in is in flight. */
  busy: boolean;
  /** Apple, Google and the demo button all sign in with the demo account. */
  onDemoSignIn: () => void;
};

/** Below Sign In: an "or" divider, the demo account button and Apple / Google. */
export function LoginAlternatives({ busy, onDemoSignIn }: Props) {
  return (
    <>
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
        disabled={busy}
        onPress={onDemoSignIn}
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
          onPress={onDemoSignIn}
        />
        <SocialButton
          testID="login-google"
          label="Google"
          icon={BRAND_ICONS.google}
          onPress={onDemoSignIn}
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  muted: { color: MUTED },
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
});
