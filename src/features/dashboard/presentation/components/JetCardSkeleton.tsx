import { StyleSheet, View } from 'react-native';
import { useBlackJetTheme } from '@/core/theme/blackjet';
import { Shimmer } from '@/core/ui/Shimmer';
import { JET_CARD_HEIGHT } from './JetCard';

/** A jet card while quotes load: two shimmering bars on top, two at the bottom. */
export function JetCardSkeleton() {
  const palette = useBlackJetTheme();
  return (
    <View
      testID="jet-card-skeleton"
      style={[styles.jet, { backgroundColor: palette.primaryBackground }]}
    >
      <View style={styles.bars}>
        <Shimmer width={140} height={10} />
        <Shimmer width={60} height={8} />
      </View>
      <View style={[styles.bars, styles.bottom]}>
        <Shimmer width={80} height={8} />
        <Shimmer width={80} height={25} radius={5} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  jet: {
    height: JET_CARD_HEIGHT,
    borderRadius: 24,
    padding: 16,
    justifyContent: 'space-between',
  },
  bars: { gap: 8 },
  bottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
});
