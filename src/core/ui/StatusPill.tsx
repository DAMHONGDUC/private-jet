import { StyleSheet, View } from 'react-native';
import { makeStyles } from '@/core/theme/blackjet';
import { AppText } from './AppText';

export enum StatusTone {
  Neutral = 'neutral',
  Success = 'success',
  Danger = 'danger',
  Inverse = 'inverse',
}

/** A small rounded label: CHARTER, CANCELLED, COMPLETED… */
export function StatusPill({
  label,
  tone = StatusTone.Neutral,
  testID,
}: {
  label: string;
  tone?: StatusTone;
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
  // A hairline outline and tinted text: quieter than a filled chip.
  pill: {
    alignSelf: 'flex-start',
    borderRadius: 100,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: StyleSheet.hairlineWidth,
  },
  neutral: { borderColor: palette.ashGrey },
  neutralText: { color: palette.secondaryText },
  success: { borderColor: palette.success },
  successText: { color: palette.success },
  danger: { borderColor: palette.error },
  dangerText: { color: palette.error },
  inverse: { borderColor: palette.accent, backgroundColor: palette.accentSoft },
  inverseText: { color: palette.accent },
}));
