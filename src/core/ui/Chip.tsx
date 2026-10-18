import { makeStyles } from '@/core/theme/blackjet';
import { AppSpacing } from '@/core/theme/app-spacing';
import { radius } from '@/core/theme/theme';
import { AppText } from './AppText';
import { PressableScale } from './PressableScale';

type Props = {
  label: string;
  selected: boolean;
  onPress: () => void;
  testID?: string;
};

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
      <AppText
        variant="caption"
        style={selected ? styles.selectedText : undefined}
        muted={!selected}
      >
        {label}
      </AppText>
    </PressableScale>
  );
}

const useStyles = makeStyles(palette => ({
  chip: {
    paddingHorizontal: AppSpacing.lg,
    paddingVertical: AppSpacing.sm,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: palette.iron,
    backgroundColor: palette.secondaryBackground,
  },
  selected: {
    backgroundColor: palette.primaryAction,
    borderColor: palette.primaryAction,
  },
  selectedText: { color: palette.onPrimaryAction },
}));
