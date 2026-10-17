import { View } from 'react-native';
import { makeStyles, useBlackJetTheme } from '@/core/theme/blackjet';
import { radius, spacing } from '@/core/theme/theme';
import { Icon } from './Icon';
import { AppText } from './AppText';
import { PressableScale } from './PressableScale';

type Props = {
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
  /** Prefix for `<testID>-decrement`, `<testID>-increment` and `<testID>-count`. */
  testID: string;
};

export function Stepper({ value, min, max, onChange, testID }: Props) {
  const styles = useStyles();
  return (
    <View style={styles.row}>
      <StepButton icon="minus" testID={`${testID}-decrement`} disabled={value <= min} onPress={() => onChange(value - 1)} />
      <AppText variant="title" testID={`${testID}-count`} style={styles.value}>
        {value}
      </AppText>
      <StepButton icon="plus" testID={`${testID}-increment`} disabled={value >= max} onPress={() => onChange(value + 1)} />
    </View>
  );
}

function StepButton(props: { icon: 'minus' | 'plus'; testID: string; disabled: boolean; onPress: () => void }) {
  const styles = useStyles();
  const palette = useBlackJetTheme();
  return (
    <PressableScale
      testID={props.testID}
      accessibilityRole="button"
      accessibilityState={{ disabled: props.disabled }}
      disabled={props.disabled}
      onPress={props.onPress}
      scaleTo={0.94}
      style={[styles.button, props.disabled && styles.disabled]}
    >
      <Icon name={props.icon} size={16} color={palette.primaryText} />
    </PressableScale>
  );
}

const useStyles = makeStyles(palette => ({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg },
  value: { minWidth: 24, textAlign: 'center' },
  button: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    backgroundColor: palette.iron,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabled: { opacity: 0.35 },
}));
