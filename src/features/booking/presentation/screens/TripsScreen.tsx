import { useMemo, useState } from 'react';
import { FlatList, RefreshControl, View } from 'react-native';
import { makeStyles, useBlackJetTheme } from '@/core/theme/blackjet';
import { spacing } from '@/core/theme/theme';
import { AppText } from '@/core/ui/AppText';
import { Button } from '@/core/ui/Button';
import { Screen } from '@/core/ui/Screen';
import { SegmentedControl } from '@/core/ui/SegmentedControl';
import { EmptyView, ErrorView, LoadingView } from '@/core/ui/StateViews';
import { firstLeg, isUpcoming } from '../../domain/entities/booking';
import { useGetBookingsQuery } from '../booking-api';
import { TripCard } from '../components/TripCard';

type Tab = 'upcoming' | 'past';

const TABS = [
  { value: 'upcoming', label: 'Upcoming' },
  { value: 'past', label: 'Past' },
] as const;

type Props = {
  onOpenTrip: (bookingId: string) => void;
  onPlanTrip: () => void;
  /** Splits upcoming from past; tests pin it. */
  now?: Date;
};

/** Upcoming trips soonest first; past and cancelled ones most recent first. */
export function TripsScreen({ onOpenTrip, onPlanTrip, now: nowProp }: Props) {
  const styles = useStyles();
  const palette = useBlackJetTheme();
  const [now] = useState(() => nowProp ?? new Date());
  const [tab, setTab] = useState<Tab>('upcoming');
  const { data, error, isLoading, isFetching, refetch } = useGetBookingsQuery();

  const trips = useMemo(() => {
    const all = data ?? [];
    return tab === 'upcoming'
      ? all.filter(booking => isUpcoming(booking, now))
      : all
          .filter(booking => !isUpcoming(booking, now))
          .sort((a, b) =>
            firstLeg(b).departureAt.localeCompare(firstLeg(a).departureAt),
          );
  }, [data, now, tab]);

  let body;
  if (isLoading) {
    body = <LoadingView />;
  } else if (error) {
    body = <ErrorView error={error} onRetry={refetch} />;
  } else {
    body = (
      <FlatList
        key={tab}
        testID="trip-list"
        data={trips}
        keyExtractor={booking => booking.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={isFetching && !isLoading}
            onRefresh={() => {
              refetch();
            }}
            tintColor={palette.accent}
          />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <EmptyView
              title={tab === 'upcoming' ? 'No upcoming trips' : 'No past trips'}
              message={
                tab === 'upcoming'
                  ? 'Plan a charter or join a shared flight.'
                  : 'Flown and cancelled trips show up here.'
              }
            />
            {tab === 'upcoming' ? (
              <Button
                testID="plan-trip"
                title="Plan a trip"
                onPress={onPlanTrip}
              />
            ) : null}
          </View>
        }
        renderItem={({ item }) => (
          <TripCard
            booking={item}
            now={now}
            onPress={() => onOpenTrip(item.id)}
          />
        )}
      />
    );
  }

  return (
    <Screen top>
      <View style={styles.header}>
        <AppText variant="label" muted>
          Itinerary
        </AppText>
        <AppText variant="display">My trips</AppText>
        <SegmentedControl
          testID="trips-tab"
          options={TABS}
          value={tab}
          onChange={setTab}
        />
      </View>
      {body}
    </Screen>
  );
}

const useStyles = makeStyles(() => ({
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    gap: spacing.sm,
  },
  list: { padding: spacing.lg, gap: spacing.lg, flexGrow: 1 },
  empty: { flex: 1, gap: spacing.lg, paddingBottom: spacing.xxl },
}));
