import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSelector } from 'react-redux';
import { colors, spacing } from '@/core/theme/theme';
import { AppText } from '@/core/ui/AppText';
import { Screen } from '@/core/ui/Screen';
import { EmptyView, ErrorView, LoadingView } from '@/core/ui/StateViews';
import { FlightCard } from '../components/FlightCard';
import { FlightFilters } from '../components/FlightFilters';
import { useSearchFlightsQuery } from '../flights-api';
import { selectFlightSearchParams } from '../flights-filter-slice';

type Props = { onOpenFlight: (flightId: string) => void };

export function FlightListScreen({ onOpenFlight }: Props) {
  const params = useSelector(selectFlightSearchParams);
  const { data, error, isLoading, isFetching, refetch } = useSearchFlightsQuery(params);

  const header = (
    <View style={styles.header}>
      <View style={styles.title}>
        <AppText variant="label" gold>
          Empty legs & scheduled
        </AppText>
        <AppText variant="display">Find your jet</AppText>
      </View>
      <FlightFilters />
    </View>
  );

  let body;
  if (isLoading) {
    body = <LoadingView />;
  } else if (error) {
    body = <ErrorView error={error} onRetry={refetch} />;
  } else {
    body = (
      <FlatList
        testID="flight-list"
        data={data}
        keyExtractor={flight => flight.id}
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
        ListEmptyComponent={
          <EmptyView title="No flights" message="Nothing matches these filters. Try another one." />
        }
        renderItem={({ item, index }) => (
          <Animated.View entering={FadeInDown.delay(index * 70).springify().damping(16)}>
            <FlightCard flight={item} onPress={() => onOpenFlight(item.id)} />
          </Animated.View>
        )}
      />
    );
  }

  return (
    <Screen top>
      {header}
      {body}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { gap: spacing.md, paddingTop: spacing.lg, paddingBottom: spacing.md },
  title: { paddingHorizontal: spacing.lg, gap: spacing.xs },
  list: { padding: spacing.lg, gap: spacing.md, flexGrow: 1 },
});
