import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { colors, radius, spacing } from '@/core/theme/theme';
import { AppText } from '@/core/ui/AppText';
import { formatCompactNumber } from '@/core/utils/format';
import type { DashboardSummary } from '../../domain/entities/dashboard';

/** Tier, points and a bar that fills towards the next tier; refills on change. */
export function LoyaltyCard({ summary }: { summary: DashboardSummary }) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withDelay(
      250,
      withTiming(summary.tierProgress, { duration: 1100, easing: Easing.bezier(0.16, 1, 0.3, 1) }),
    );
  }, [progress, summary.tierProgress]);

  const fillStyle = useAnimatedStyle(() => ({ width: `${progress.value * 100}%` }));
  const toGo = Math.max(0, summary.nextTierPoints - summary.points);

  return (
    <View style={styles.card} testID="loyalty-card">
      <View style={styles.between}>
        <AppText variant="label" style={styles.dark}>
          {summary.tier} member
        </AppText>
        <AppText variant="caption" style={styles.dark}>
          BackJet Club
        </AppText>
      </View>
      <View>
        <AppText variant="display" style={styles.dark} testID="loyalty-points">
          {formatCompactNumber(summary.points)}
        </AppText>
        <AppText variant="caption" style={styles.dark}>
          points
        </AppText>
      </View>
      <View style={styles.track}>
        <Animated.View style={[styles.fill, fillStyle]} />
      </View>
      <AppText variant="caption" style={styles.dark}>
        {toGo === 0
          ? `${summary.nextTier} unlocked`
          : `${formatCompactNumber(toGo)} points to ${summary.nextTier}`}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.gold,
    borderRadius: radius.lg,
    padding: spacing.xl,
    gap: spacing.md,
  },
  between: { flexDirection: 'row', justifyContent: 'space-between' },
  dark: { color: colors.background },
  track: {
    height: 8,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(11, 17, 32, 0.18)',
    overflow: 'hidden',
  },
  fill: { height: '100%', borderRadius: radius.pill, backgroundColor: colors.background },
});
