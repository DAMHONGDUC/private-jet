import { RefreshControl, StyleSheet, View } from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing } from '@/core/theme/theme';
import { AppText } from '@/core/ui/AppText';
import { Button } from '@/core/ui/Button';
import { Screen } from '@/core/ui/Screen';
import { ErrorView, LoadingView } from '@/core/ui/StateViews';
import { formatMoney } from '@/core/utils/format';
import { LoyaltyCard } from '../components/LoyaltyCard';
import { NextTripCard } from '../components/NextTripCard';
import { SpendChart } from '../components/SpendChart';
import { StatTile } from '../components/StatTile';
import { useGetDashboardSummaryQuery } from '../dashboard-api';

const COLLAPSE_AT = 80;
const BAR_HEIGHT = 48;

type Props = { onOpenTrips: () => void; onFindFlights: () => void };

export function DashboardScreen({ onOpenTrips, onFindFlights }: Props) {
  const insets = useSafeAreaInsets();
  const { data: summary, error, isLoading, isFetching, refetch } = useGetDashboardSummaryQuery();
  const scrollY = useSharedValue(0);

  const onScroll = useAnimatedScrollHandler(event => {
    scrollY.value = event.contentOffset.y;
  });

  // The large greeting drifts up and fades as the compact bar fades in.
  const greetingStyle = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, [0, COLLAPSE_AT], [1, 0], Extrapolation.CLAMP),
    transform: [
      { translateY: interpolate(scrollY.value, [0, COLLAPSE_AT], [0, -24], Extrapolation.CLAMP) },
    ],
  }));
  const barStyle = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, [COLLAPSE_AT * 0.6, COLLAPSE_AT], [0, 1], Extrapolation.CLAMP),
  }));

  if (isLoading) {
    return (
      <Screen top>
        <LoadingView />
      </Screen>
    );
  }
  if (error || !summary) {
    return (
      <Screen top>
        <ErrorView error={error} onRetry={refetch} />
      </Screen>
    );
  }

  return (
    <Screen>
      <Animated.ScrollView
        testID="dashboard-scroll"
        onScroll={onScroll}
        scrollEventThrottle={16}
        contentContainerStyle={[styles.content, { paddingTop: insets.top + spacing.lg }]}
        refreshControl={
          <RefreshControl
            refreshing={isFetching}
            onRefresh={() => {
              refetch();
            }}
            tintColor={colors.gold}
            progressViewOffset={insets.top}
          />
        }
      >
        <Animated.View style={greetingStyle}>
          <AppText variant="label" gold>
            Good to see you
          </AppText>
          <AppText variant="display" testID="dashboard-greeting">
            Welcome back, {summary.memberName}
          </AppText>
        </Animated.View>

        <LoyaltyCard summary={summary} />

        <View style={styles.stats}>
          <StatTile testID="stat-upcoming" label="Upcoming trips" value={String(summary.upcomingTrips)} />
          <StatTile label="Flight hours" value={`${summary.flightHoursThisYear}h`} />
          <StatTile
            label="Spent this year"
            value={formatMoney(summary.totalSpentThisYear, summary.currency)}
          />
        </View>

        <NextTripCard trip={summary.nextTrip} onPress={onOpenTrips} />

        <SpendChart data={summary.monthlySpend} currency={summary.currency} />

        <Button testID="find-flights" title="Find a jet" onPress={onFindFlights} />
      </Animated.ScrollView>

      <Animated.View
        pointerEvents="none"
        style={[styles.bar, { paddingTop: insets.top, height: insets.top + BAR_HEIGHT }, barStyle]}
      >
        <AppText variant="subtitle">{summary.memberName}</AppText>
        <AppText variant="caption" gold>
          {summary.tier} · {summary.points.toLocaleString('en-GB')} pts
        </AppText>
      </Animated.View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.lg, gap: spacing.lg, paddingBottom: spacing.xxl },
  stats: { flexDirection: 'row', gap: spacing.md },
  bar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.surface,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
});
