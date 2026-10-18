import { StyleSheet } from 'react-native';
import { makeStyles, useBlackJetTheme } from '@/core/theme/blackjet';
import { AppSpacing } from '@/core/theme/app-spacing';
import { AppText } from './AppText';
import { Icon } from './Icon';
import { PressableScale } from './PressableScale';

type Props = {
  label: string;
  selected: boolean;
  onPress: () => void;
  testID?: string;
};

/** One choice in a sheet: a plain row with a check when selected. */
export function SheetOption({ label, selected, onPress, testID }: Props) {
  const styles = useStyles();
  const palette = useBlackJetTheme();
  return (
    <PressableScale
      testID={testID}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={styles.option}
    >
      <AppText variant={selected ? 'subtitle' : 'body'}>{label}</AppText>
      {selected ? <Icon name="check" size={20} color={palette.accent} /> : null}
    </PressableScale>
  );
}

const useStyles = makeStyles(palette => ({
  option: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: AppSpacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: palette.iron,
  },
}));
