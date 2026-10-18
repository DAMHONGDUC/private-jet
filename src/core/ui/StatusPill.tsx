import { View } from 'react-native';
import { makeStyles } from '@/core/theme/blackjet';
import { AppText } from './AppText';

type Tone = 'neutral' | 'success' | 'danger' | 'inverse';

/** A small rounded label: CHARTER, CANCELLED, COMPLETED… */
export function StatusPill({
  label,
  tone = 'neutral',
  testID,
}: {
  label: string;
  tone?: Tone;
  testID?: string;
}) {
  const styles = useStyles();
  return (
    <View testID={testID} style={[styles.pill, styles[tone]]}>
      <AppText variant="label" style={styles[`${tone}Text`]}>
        {label}
      </AppText>
    </View>
  );
}

const useStyles = makeStyles(palette => ({
  pill: {
    alignSelf: 'flex-start',
    borderRadius: 100,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  neutral: { backgroundColor: palette.iron },
  neutralText: { color: palette.primaryText },
  success: { backgroundColor: `${palette.success}22` },
  successText: { color: palette.success },
  danger: { backgroundColor: `${palette.error}22` },
  dangerText: { color: palette.error },
  inverse: { backgroundColor: palette.accentSoft },
  inverseText: { color: palette.primaryText },
}));
