import { makeStyles } from '@/core/theme/blackjet';
import { radius, spacing } from '@/core/theme/theme';
import { AppText } from './AppText';
import { PressableScale } from './PressableScale';

type Props = { label: string; selected: boolean; onPress: () => void; testID?: string };

export function Chip({ label, selected, onPress, testID }: Props) {
  const styles = useStyles();
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

const useStyles = makeStyles(palette => ({
  chip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: palette.iron,
    backgroundColor: palette.primaryBackground,
  },
  selected: { backgroundColor: palette.jetBlack, borderColor: palette.jetBlack },
  selectedText: { color: palette.ghostWhite },
}));
