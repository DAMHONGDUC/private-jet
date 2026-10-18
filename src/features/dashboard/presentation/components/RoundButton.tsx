import { StyleSheet } from 'react-native';
import { useBlackJetTheme } from '@/core/theme/blackjet';
import { Icon, type IconName } from '@/core/ui/Icon';
import { PressableScale } from '@/core/ui/PressableScale';

type Props = {
  icon: IconName;
  testID: string;
  disabled: boolean;
  onPress: () => void;
};

/** The round − and + of the count sheet. */
export function RoundButton({ icon, testID, disabled, onPress }: Props) {
  const palette = useBlackJetTheme();
  return (
    <PressableScale
      testID={testID}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      scaleTo={0.94}
      style={[
        styles.round,
        { backgroundColor: palette.primaryBackground },
        disabled && styles.disabled,
      ]}
    >
      <Icon name={icon} size={18} color={palette.primaryText} />
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  round: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabled: { opacity: 0.4 },
});
