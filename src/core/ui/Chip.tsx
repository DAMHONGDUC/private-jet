import { StyleSheet } from 'react-native';
import { colors, radius, spacing } from '@/core/theme/theme';
import { AppText } from './AppText';
import { PressableScale } from './PressableScale';

type Props = { label: string; selected: boolean; onPress: () => void; testID?: string };

export function Chip({ label, selected, onPress, testID }: Props) {
  return (
    <PressableScale
      testID={testID}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={[styles.chip, selected && styles.selected]}
    >
      <AppText variant="caption" style={selected ? styles.selectedText : undefined} muted={!selected}>
        {label}
      </AppText>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  selected: { backgroundColor: colors.gold, borderColor: colors.gold },
  selectedText: { color: colors.background, fontWeight: '600' },
});
