import { StyleSheet, View } from 'react-native';
import { useBlackJetTheme } from '@/core/theme/blackjet';
import { elevation, radius, spacing } from '@/core/theme/theme';
import { BJText } from '@/core/ui/BJText';
import { Icon } from '@/core/ui/Icon';
import { PressableScale } from '@/core/ui/PressableScale';
import type { CharterRequest } from '../../domain/entities/charter';
import { describeDetails, describeRoute } from '../search-labels';

/** Height of the floating search pill. */
export const SUMMARY_HEIGHT = 64;

type Props = {
  /** The search on screen, or the form when it is complete; null shows a prompt. */
  request: CharterRequest | null;
  onPress: () => void;
  /** What tapping does, for screen readers. */
  accessibilityLabel?: string;
  testID?: string;
};

/**
 * The search as one floating pill: route and details, with an accent search
 * button. The dashboard pins it when the form scrolls away; the results
 * screen shows it on top.
 */
export function SearchSummaryBar({
  request,
  onPress,
  accessibilityLabel = 'Edit search',
  testID = 'search-summary',
}: Props) {
  const palette = useBlackJetTheme();
  return (
    <PressableScale
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      style={[
        styles.bar,
        { backgroundColor: palette.raised, borderColor: palette.iron },
        elevation(palette.shadow),
      ]}
    >
      <View style={[styles.mark, { backgroundColor: palette.accentSoft }]}>
        <Icon name="plane" size={16} color={palette.accent} />
      </View>
      <View style={styles.text}>
        <BJText numberOfLines={1}>
          {request ? describeRoute(request) : 'Where to?'}
        </BJText>
        <BJText size={13} tone="secondary" weight="regular" numberOfLines={1}>
          {request ? describeDetails(request) : 'Tap to plan a flight'}
        </BJText>
      </View>
      <View style={[styles.action, { backgroundColor: palette.accent }]}>
        <Icon name="search" size={18} color={palette.onAccent} />
      </View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  bar: {
    height: SUMMARY_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingLeft: spacing.md,
    paddingRight: spacing.sm,
    borderRadius: radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
  },
  mark: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: { flex: 1, gap: 2 },
  action: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
