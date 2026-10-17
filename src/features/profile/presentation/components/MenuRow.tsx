import type { ReactNode } from 'react';
import { View } from 'react-native';
import { makeStyles } from '@/core/theme/blackjet';
import { spacing } from '@/core/theme/theme';
import { AppText } from '@/core/ui/AppText';
import { PressableScale } from '@/core/ui/PressableScale';

type Props = {
  title: string;
  detail?: string;
  onPress?: () => void;
  /** Replaces the chevron, e.g. a switch. */
  trailing?: ReactNode;
  last?: boolean;
  testID?: string;
};

/** One line of a settings list: a title, an optional detail and a chevron or control. */
export function MenuRow({ title, detail, onPress, trailing, last, testID }: Props) {
  const styles = useStyles();
  const content = (
    <>
      <View style={styles.text}>
        <AppText variant="subtitle">{title}</AppText>
        {detail ? (
          <AppText variant="caption" muted numberOfLines={1}>
            {detail}
          </AppText>
        ) : null}
      </View>
      {trailing ?? (onPress ? <AppText style={styles.chevron}>›</AppText> : null)}
    </>
  );

  return onPress ? (
    <PressableScale
      testID={testID}
      accessibilityRole="button"
      onPress={onPress}
      style={[styles.row, !last && styles.divider]}
    >
      {content}
    </PressableScale>
  ) : (
    <View testID={testID} style={[styles.row, !last && styles.divider]}>
      {content}
    </View>
  );
}

const useStyles = makeStyles(palette => ({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    minHeight: 56,
  },
  divider: { borderBottomWidth: 1, borderBottomColor: palette.iron },
  text: { flex: 1, gap: 2 },
  chevron: { fontSize: 26, lineHeight: 28, color: palette.secondaryText },
}));
