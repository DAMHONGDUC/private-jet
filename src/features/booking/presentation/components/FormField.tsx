import { StyleSheet, TextInput, View, type TextInputProps } from 'react-native';
import { AppSpacing } from '@/core/theme/app-spacing';
import { radius } from '@/core/theme/theme';
import {
  blackJetFonts,
  makeStyles,
  useBlackJetTheme,
} from '@/core/theme/blackjet';
import { AppText } from '@/core/ui/AppText';
import { FieldError } from '@/core/ui/FieldError';

type Props = TextInputProps & {
  label: string;
  /** What is wrong with the value, shown under the input; the border turns red too. */
  error?: string | null;
};

/** A labelled text input with its problem, if any, right under it. */
export function FormField({ label, error, ...input }: Props) {
  const styles = useStyles();
  const palette = useBlackJetTheme();
  return (
    <View style={styles.field}>
      <AppText variant="caption" muted>
        {label}
      </AppText>
      <TextInput
        placeholderTextColor={palette.secondaryText}
        accessibilityHint={error ?? undefined}
        {...input}
        style={[styles.input, error ? styles.invalid : null]}
      />
      <FieldError
        message={error}
        testID={input.testID && `${input.testID}-error`}
      />
    </View>
  );
}

const useStyles = makeStyles(palette => ({
  field: { gap: AppSpacing.xs },
  input: {
    color: palette.primaryText,
    backgroundColor: palette.primaryBackground,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    fontFamily: blackJetFonts.regular,
    borderColor: palette.iron,
    paddingHorizontal: AppSpacing.md,
    paddingVertical: AppSpacing.md,
    fontSize: 15,
  },
  invalid: { borderColor: palette.error },
}));
