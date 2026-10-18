import { StyleSheet, View } from 'react-native';
import { useT } from '@/core/i18n/i18n';
import { useBlackJetTheme } from '@/core/theme/blackjet';
import { AppSpacing } from '@/core/theme/app-spacing';
import { elevation, radius } from '@/core/theme/theme';
import { BJText } from '@/core/ui/BJText';
import { Icon } from '@/core/ui/Icon';
import { PressableScale } from '@/core/ui/PressableScale';
import type { CharterRequest } from '../../domain/entities/charter';
import { describeDetails, describeRoute } from '../search-labels';

/** Height of the floating search pill. */
export const SUMMARY_HEIGHT = 64;
/** Height of the pill when it sits in a header, beside the back button. */
export const COMPACT_SUMMARY_HEIGHT = 48;

type Props = {
  /** The search on screen, or the form when it is complete; null shows a prompt. */
  request: CharterRequest | null;
  onPress: () => void;
  /** What tapping does, for screen readers. */
  accessibilityLabel?: string;
  /** Header size: shorter, smaller marks, no lift. */
  compact?: boolean;
  testID?: string;
};

/**
 * The search as one floating pill: route and details, with an accent search
 * button. The dashboard pins it under the app bar when the form scrolls
 * away; the results screen moves it, compact, into the header.
 */
export function SearchSummaryBar({
  request,
  onPress,
  accessibilityLabel,
  compact = false,
  testID = 'search-summary',
}: Props) {
  const palette = useBlackJetTheme();
  const t = useT();
  return (
    <PressableScale
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? t('search.editSearch')}
      onPress={onPress}
      style={[
        styles.bar,
        { backgroundColor: palette.raised, borderColor: palette.iron },
        compact ? styles.compactBar : elevation(palette.shadow),
      ]}
    >
      <View
        style={[
          styles.mark,
          compact && styles.compactMark,
          { backgroundColor: palette.accentSoft },
        ]}
      >
        <Icon name="plane" size={compact ? 14 : 16} color={palette.accent} />
      </View>
      <View style={styles.text}>
        <BJText numberOfLines={1}>
          {request ? describeRoute(request) : t('search.whereTo')}
        </BJText>
        <BJText size={13} tone="secondary" weight="regular" numberOfLines={1}>
          {request ? describeDetails(request, t) : t('search.tapToPlan')}
        </BJText>
      </View>
      <View
        style={[
          styles.action,
          compact && styles.compactAction,
          { backgroundColor: palette.primaryAction },
        ]}
      >
        <Icon
          name="search"
          size={compact ? 16 : 18}
          color={palette.onPrimaryAction}
        />
      </View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  bar: {
    height: SUMMARY_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    gap: AppSpacing.spacing12,
    paddingLeft: AppSpacing.spacing12,
    paddingRight: AppSpacing.spacing8,
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
  compactBar: {
    height: COMPACT_SUMMARY_HEIGHT,
    gap: AppSpacing.spacing8,
    paddingLeft: AppSpacing.spacing8,
    paddingRight: 6,
  },
  compactMark: { width: 32, height: 32, borderRadius: 16 },
  compactAction: { width: 36, height: 36, borderRadius: 18 },
  text: { flex: 1, gap: 2 },
  action: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
