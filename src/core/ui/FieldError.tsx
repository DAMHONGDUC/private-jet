import { makeStyles } from '@/core/theme/blackjet';
import { AppText } from './AppText';

/** The line under a field that says what is wrong with it; nothing when it is fine. */
export function FieldError({
  message,
  testID,
}: {
  message?: string | null;
  testID?: string;
}) {
  const styles = useStyles();
  if (!message) {
    return null;
  }
  return (
    <AppText
      testID={testID}
      variant="caption"
      accessibilityRole="alert"
      style={styles.error}
    >
      {message}
    </AppText>
  );
}

const useStyles = makeStyles(palette => ({
  error: { color: palette.error },
}));
