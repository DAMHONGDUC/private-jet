import { StyleSheet, TextInput, View, type TextInputProps } from 'react-native';
import { blackJetFonts } from '@/core/theme/blackjet';
import { AppSpacing } from '@/core/theme/app-spacing';
import { radius } from '@/core/theme/theme';
import { BJText } from '@/core/ui/BJText';
import { ERROR, FIELD, MUTED, WHITE } from '../login-colors';

type Props = TextInputProps & { label: string; testID: string; error?: string };

/** A labelled input on the sign-in photo, with its problem under it. */
export function LoginField({ label, testID, error, ...input }: Props) {
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

const styles = StyleSheet.create({
  field: { gap: 6 },
  muted: { color: MUTED },
  input: {
    height: 52,
    borderRadius: radius.md,
    paddingHorizontal: AppSpacing.lg,
    backgroundColor: FIELD,
    color: WHITE,
    fontFamily: blackJetFonts.regular,
    fontSize: 16,
  },
  invalid: { borderWidth: 1, borderColor: ERROR },
  error: { color: ERROR },
});
