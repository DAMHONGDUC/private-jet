import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { colors, spacing } from '@/core/theme/theme';
import { AppText } from '@/core/ui/AppText';
import { Screen } from '@/core/ui/Screen';
import { EmptyView, ErrorView, LoadingView } from '@/core/ui/StateViews';
import { useGetBookingsQuery } from '../booking-api';
import { TripCard } from '../components/TripCard';

export function TripsScreen() {
  const { data, error, isLoading, isFetching, refetch } = useGetBookingsQuery();

  let body;
  if (isLoading) {
    body = <LoadingView />;
  } else if (error) {
    body = <ErrorView error={error} onRetry={refetch} />;
  } else {
    body = (
      <FlatList
        testID="trip-list"
        data={data}
        keyExtractor={booking => booking.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={isFetching}
            onRefresh={() => {
              refetch();
            }}
            tintColor={colors.gold}
          />
        }
        ListEmptyComponent={<EmptyView title="No trips yet" message="Booked flights show up here." />}
        renderItem={({ item }) => <TripCard booking={item} />}
      />
    );
  }

  return (
    <Screen top>
      <View style={styles.header}>
        <AppText variant="label" gold>
          Itinerary
        </AppText>
        <AppText variant="display">My trips</AppText>
      </View>
      {body}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: spacing.lg, paddingTop: spacing.lg, gap: spacing.xs },
  list: { padding: spacing.lg, gap: spacing.md, flexGrow: 1 },
});
