import { ActivityIndicator } from 'react-native';
import { makeStyles, useBlackJetTheme } from '@/core/theme/blackjet';
import { radius, spacing } from '@/core/theme/theme';
import { AppText } from './AppText';
import { PressableScale } from './PressableScale';

type Props = {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'danger';
  testID?: string;
};

/** 52 pt, the main button: solid accent, or outlined. */
export function Button({
  title,
  onPress,
  loading,
  disabled,
  variant = 'primary',
  testID,
}: Props) {
  const palette = useBlackJetTheme();
  const styles = useStyles();
  const inactive = disabled || loading;
  const textColor =
    variant === 'primary'
      ? palette.onAccent
      : variant === 'danger'
      ? palette.error
      : palette.primaryText;

  return (
    <PressableScale
      testID={testID}
      accessibilityRole="button"
      accessibilityState={{ disabled: inactive, busy: loading }}
      disabled={inactive}
      onPress={onPress}
      style={[styles.base, styles[variant], inactive && styles.inactive]}
    >
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <AppText variant="subtitle" style={{ color: textColor }}>
          {title}
        </AppText>
      )}
    </PressableScale>
  );
}

const useStyles = makeStyles(palette => ({
  base: {
    minHeight: 52,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  primary: { backgroundColor: palette.accent },
  secondary: { borderWidth: 1, borderColor: palette.iron },
  danger: { borderWidth: 1, borderColor: palette.error },
  inactive: { opacity: 0.45 },
}));
