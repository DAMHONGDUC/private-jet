import { StyleSheet, TextInput, View, type TextInputProps } from 'react-native';
import { radius, spacing } from '@/core/theme/theme';
import { blackJetFonts, makeStyles, useBlackJetTheme } from '@/core/theme/blackjet';
import { AppText } from '@/core/ui/AppText';

export function FormField({ label, ...input }: TextInputProps & { label: string }) {
  const styles = useStyles();
  const palette = useBlackJetTheme();
  return (
    <View style={styles.field}>
      <AppText variant="caption" muted>
        {label}
      </AppText>
      <TextInput placeholderTextColor={palette.secondaryText} {...input} style={styles.input} />
    </View>
  );
}

const useStyles = makeStyles(palette => ({
  field: { gap: spacing.xs },
  input: {
    color: palette.primaryText,
    backgroundColor: palette.primaryBackground,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    fontFamily: blackJetFonts.regular,
    borderColor: palette.iron,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: 15,
  },
}));
