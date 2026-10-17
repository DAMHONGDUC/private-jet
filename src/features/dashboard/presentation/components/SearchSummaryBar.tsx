import { StyleSheet, View } from 'react-native';
import { useBlackJetTheme } from '@/core/theme/blackjet';
import { BJText } from '@/core/ui/BJText';
import { Icon } from '@/core/ui/Icon';
import { PressableScale } from '@/core/ui/PressableScale';
import type { CharterRequest } from '../../domain/entities/charter';
import { describeDetails, describeRoute } from '../search-labels';
import { COLLAPSED_HEIGHT } from '../use-collapsible-search';

type Props = {
  /** The search on screen, or the form when it is complete; null shows a prompt. */
  request: CharterRequest | null;
  onPress: () => void;
};

/** What the search panel collapses into: route and details, tap to open (feature-docs/dashboard §12.4). */
export function SearchSummaryBar({ request, onPress }: Props) {
  const palette = useBlackJetTheme();
  return (
    <PressableScale
      testID="search-summary"
      accessibilityRole="button"
      accessibilityLabel="Edit search"
      onPress={onPress}
      scaleTo={1}
      style={[
        styles.bar,
        { backgroundColor: palette.secondaryBackground, borderBottomColor: palette.iron },
      ]}
    >
      <View style={styles.text}>
        <BJText size={16} numberOfLines={1}>
          {request ? describeRoute(request) : 'Where to?'}
        </BJText>
        <BJText size={12} tone="secondary" numberOfLines={1}>
          {request ? describeDetails(request) : 'Tap to plan a flight'}
        </BJText>
      </View>
      <View style={[styles.edit, { backgroundColor: palette.primaryBackground }]}>
        <Icon name="search" size={18} color={palette.primaryText} />
      </View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  bar: {
    height: COLLAPSED_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    gap: 12,
  },
  text: { flex: 1, gap: 2 },
  edit: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
});
