import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { makeStyles, useBlackJetTheme } from '@/core/theme/blackjet';
import { AppSpacing } from '@/core/theme/app-spacing';
import { AppText } from '@/core/ui/AppText';
import { Icon } from '@/core/ui/Icon';
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
export function MenuRow({
  title,
  detail,
  onPress,
  trailing,
  last,
  testID,
}: Props) {
  const styles = useStyles();
  const palette = useBlackJetTheme();
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
      {trailing ??
        (onPress ? (
          <Icon name="chevronRight" size={20} color={palette.secondaryText} />
        ) : null)}
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
    gap: AppSpacing.spacing12,
    paddingVertical: AppSpacing.spacing12,
    minHeight: 56,
  },
  divider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: palette.iron,
  },
  text: { flex: 1, gap: 2 },
}));
