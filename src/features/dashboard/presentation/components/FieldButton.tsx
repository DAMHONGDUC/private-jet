import { StyleSheet } from 'react-native';
import { useBlackJetTheme } from '@/core/theme/blackjet';
import { AppSpacing } from '@/core/theme/app-spacing';
import { radius } from '@/core/theme/theme';
import { BJText } from '@/core/ui/BJText';
import { Icon, type IconName } from '@/core/ui/Icon';
import { PressableScale } from '@/core/ui/PressableScale';

type Props = {
  icon: IconName;
  iconSize: number;
  text: string;
  /** Muted while the field holds no value yet. */
  filled: boolean;
  /** Outlined in red while the field has a problem; the card prints why below. */
  invalid?: boolean;
  onPress: () => void;
  testID: string;
};

/** A 52 pt row with an icon: dates and passengers. */
export function FieldButton({
  icon,
  iconSize,
  text,
  filled,
  invalid,
  onPress,
  testID,
}: Props) {
  const palette = useBlackJetTheme();
  return (
    <PressableScale
      testID={testID}
      accessibilityRole="button"
      onPress={onPress}
      style={[
        styles.field,
        { backgroundColor: palette.primaryBackground },
        invalid && { borderColor: palette.error },
      ]}
    >
      <Icon
        name={icon}
        size={iconSize}
        color={filled ? palette.accent : palette.secondaryText}
      />
      <BJText
        tone={filled ? 'primary' : 'secondary'}
        weight={filled ? 'medium' : 'regular'}
        numberOfLines={1}
        style={styles.fieldText}
      >
        {text}
      </BJText>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  field: {
    flex: 1,
    height: 44,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: 'transparent',
    flexDirection: 'row',
    alignItems: 'center',
    gap: AppSpacing.spacing8,
    paddingHorizontal: AppSpacing.spacing12,
  },
  fieldText: { flex: 1 },
});
