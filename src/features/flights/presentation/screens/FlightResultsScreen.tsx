import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { colors, radius, spacing } from '@/core/theme/theme';
import { AppText } from '@/core/ui/AppText';
import { Button } from '@/core/ui/Button';
import { PressableScale } from '@/core/ui/PressableScale';
import { Screen } from '@/core/ui/Screen';
import { EmptyView, ErrorView, LoadingView } from '@/core/ui/StateViews';
import { CategoryChips } from '../components/CategoryChips';
import { FlightCard } from '../components/FlightCard';
import { categorySelected, selectFlightSearch, selectFlightSearchParams } from '../flight-search-slice';
import { useGetAirportsQuery, useSearchFlightsQuery } from '../flights-api';
import { airportsByCode, describeDetails, describeRoute } from '../search-summary';

type Props = { onOpenFlight: (flightId: string) => void; onEditSearch: () => void };

export function FlightResultsScreen({ onOpenFlight, onEditSearch }: Props) {
  const dispatch = useDispatch();
  const criteria = useSelector(selectFlightSearch);
  const params = useSelector(selectFlightSearchParams);
  const { data, error, isLoading, isFetching, refetch } = useSearchFlightsQuery(params);
  const { data: airports } = useGetAirportsQuery();

  const header = (
    <View style={styles.header}>
      <PressableScale
        testID="results-summary"
        accessibilityRole="button"
        accessibilityHint="Change the search"
        onPress={onEditSearch}
        style={styles.summary}
      >
        <View style={styles.summaryText}>
          <AppText variant="subtitle" numberOfLines={1}>
            {describeRoute(criteria, airportsByCode(airports))}
          </AppText>
          <AppText variant="caption" muted numberOfLines={1}>
            {describeDetails(criteria)}
          </AppText>
        </View>
        <AppText variant="caption" gold>
          Edit
        </AppText>
      </PressableScale>
      <CategoryChips inset value={criteria.category} onChange={category => dispatch(categorySelected(category))} />
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
        testID="flight-results"
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
        ListHeaderComponent={
          data && data.length > 0 ? (
            <AppText variant="caption" muted testID="results-count">
              {data.length} flight{data.length > 1 ? 's' : ''} found
            </AppText>
          ) : undefined
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <EmptyView title="No flights" message="Nothing matches this search. Try another date, route or jet." />
            <Button testID="change-search" title="Change search" variant="secondary" onPress={onEditSearch} />
          </View>
        }
        renderItem={({ item }) => <FlightCard flight={item} onPress={() => onOpenFlight(item.id)} />}
      />
    );
  }

  return (
    <Screen>
      {header}
      {body}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { paddingTop: spacing.sm, gap: spacing.md },
  summary: {
    marginHorizontal: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  summaryText: { flex: 1, gap: 2 },
  list: { padding: spacing.lg, gap: spacing.md, flexGrow: 1 },
  empty: { flex: 1, paddingBottom: spacing.xxl },
});
