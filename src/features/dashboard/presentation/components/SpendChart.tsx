import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { colors, radius, spacing } from '@/core/theme/theme';
import { AppText } from '@/core/ui/AppText';
import { Card } from '@/core/ui/Card';
import { formatMoney } from '@/core/utils/format';
import type { MonthlySpend } from '../../domain/entities/dashboard';

const CHART_HEIGHT = 140;

type Props = { data: MonthlySpend[]; currency: string };

/** Six months of spend; bars ease up to their height and follow value changes. */
export function SpendChart({ data, currency }: Props) {
  const max = Math.max(1, ...data.map(entry => entry.amount));
  const current = data[data.length - 1];

  return (
    <Card style={styles.card}>
      <View style={styles.between}>
        <AppText variant="subtitle">Monthly spend</AppText>
        {current ? (
          <AppText variant="caption" gold>
            {current.month}: {formatMoney(current.amount, currency)}
          </AppText>
        ) : null}
      </View>
      <View style={styles.chart}>
        {data.map((entry, index) => (
          <Bar
            key={entry.month}
            ratio={entry.amount / max}
            label={entry.month}
            highlighted={index === data.length - 1}
          />
        ))}
      </View>
    </Card>
  );
}

type BarProps = { ratio: number; label: string; highlighted: boolean };

function Bar({ ratio, label, highlighted }: BarProps) {
  const height = useSharedValue(0);

  useEffect(() => {
    height.value = withTiming(ratio * CHART_HEIGHT, { duration: 500, easing: Easing.out(Easing.cubic) });
  }, [height, ratio]);

  const barStyle = useAnimatedStyle(() => ({ height: height.value }));

  return (
    <View style={styles.column}>
      <View style={styles.slot}>
        <Animated.View style={[styles.bar, highlighted ? styles.barCurrent : styles.barPast, barStyle]} />
      </View>
      <AppText variant="caption" muted={!highlighted} gold={highlighted}>
        {label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { gap: spacing.lg },
  between: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  chart: { flexDirection: 'row', alignItems: 'flex-end', gap: spacing.md },
  column: { flex: 1, alignItems: 'center', gap: spacing.sm },
  slot: { height: CHART_HEIGHT, justifyContent: 'flex-end', alignSelf: 'stretch' },
  bar: { borderRadius: radius.sm, alignSelf: 'stretch' },
  barPast: { backgroundColor: colors.surfaceRaised },
  barCurrent: { backgroundColor: colors.gold },
});
