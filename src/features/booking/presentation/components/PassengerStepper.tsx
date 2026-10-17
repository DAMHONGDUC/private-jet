import { StyleSheet, View } from 'react-native';
import { colors, radius, spacing } from '@/core/theme/theme';
import { AppText } from '@/core/ui/AppText';
import { PressableScale } from '@/core/ui/PressableScale';

type Props = { value: number; min: number; max: number; onChange: (value: number) => void };

export function PassengerStepper({ value, min, max, onChange }: Props) {
  return (
    <View style={styles.row}>
      <StepButton label="−" testID="passengers-decrement" disabled={value <= min} onPress={() => onChange(value - 1)} />
      <AppText variant="title" testID="passenger-count" style={styles.value}>
        {value}
      </AppText>
      <StepButton label="+" testID="passengers-increment" disabled={value >= max} onPress={() => onChange(value + 1)} />
    </View>
  );
}

function StepButton(props: { label: string; testID: string; disabled: boolean; onPress: () => void }) {
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
      <AppText variant="title" gold>
        {props.label}
      </AppText>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg },
  value: { minWidth: 24, textAlign: 'center' },
  button: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabled: { opacity: 0.35 },
});
