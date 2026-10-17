import { useState, type ReactNode } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { colors, radius, spacing } from '@/core/theme/theme';
import { AppText } from '@/core/ui/AppText';
import { Button } from '@/core/ui/Button';
import { Card } from '@/core/ui/Card';
import { PressableScale } from '@/core/ui/PressableScale';
import { Screen } from '@/core/ui/Screen';
import { Stepper } from '@/core/ui/Stepper';
import { MAX_SEARCH_PASSENGERS } from '../../domain/entities/flight';
import { CategoryChips } from '../components/CategoryChips';
import { DateStrip } from '../components/DateStrip';
import { FlightCard } from '../components/FlightCard';
import { RouteSelector } from '../components/RouteSelector';
import {
  airportsSwapped,
  categorySelected,
  dateSelected,
  passengersChanged,
  recentSearchApplied,
  searchSubmitted,
  selectFlightSearch,
  type SearchCriteria,
} from '../flight-search-slice';
import { useGetAirportsQuery, useSearchFlightsQuery } from '../flights-api';
import { airportsByCode, describeDetails, describeRoute } from '../search-summary';
import type { AirportField } from './AirportPickerScreen';

const DEPARTING_SOON = 3;

type Props = {
  onPickAirport: (field: AirportField) => void;
  onSearch: () => void;
  onOpenFlight: (flightId: string) => void;
  /** The first day in the date strip; tests pin it. */
  today?: Date;
};

export function FlightSearchScreen({ onPickAirport, onSearch, onOpenFlight, today: todayProp }: Props) {
  const dispatch = useDispatch();
  const search = useSelector(selectFlightSearch);
  const { data: airports } = useGetAirportsQuery();
  const { data: upcoming, isLoading: upcomingLoading } = useSearchFlightsQuery({});
  const [today] = useState(() => todayProp ?? new Date());

  const byCode = airportsByCode(airports);

  const submit = () => {
    dispatch(searchSubmitted());
    onSearch();
  };

  const repeat = (criteria: SearchCriteria) => {
    dispatch(recentSearchApplied(criteria));
    submit();
  };

  return (
    <Screen top>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.title}>
          <AppText variant="label" gold>
            Private charter
          </AppText>
          <AppText variant="display">Where to?</AppText>
        </View>

        <RouteSelector
          origin={search.origin ? byCode[search.origin] : undefined}
          destination={search.destination ? byCode[search.destination] : undefined}
          onPickOrigin={() => onPickAirport('origin')}
          onPickDestination={() => onPickAirport('destination')}
          onSwap={() => dispatch(airportsSwapped())}
        />

        <Section title="When">
          <DateStrip today={today} value={search.date} onChange={day => dispatch(dateSelected(day))} />
        </Section>

        <Card style={styles.passengers}>
          <View>
            <AppText variant="subtitle">Passengers</AppText>
            <AppText variant="caption" muted>
              Up to {MAX_SEARCH_PASSENGERS} per booking
            </AppText>
          </View>
          <Stepper
            testID="search-passengers"
            value={search.passengers}
            min={1}
            max={MAX_SEARCH_PASSENGERS}
            onChange={count => dispatch(passengersChanged(count))}
          />
        </Card>

        <Section title="Jet">
          <CategoryChips value={search.category} onChange={category => dispatch(categorySelected(category))} />
        </Section>

        <Button testID="search-flights" title="Search flights" onPress={submit} />

        {search.recent.length > 0 ? (
          <Section title="Recent searches">
            {search.recent.map((criteria, index) => (
              <PressableScale
                key={`${describeRoute(criteria, byCode)}-${describeDetails(criteria)}`}
                testID={`recent-search-${index}`}
                accessibilityRole="button"
                onPress={() => repeat(criteria)}
                style={styles.recent}
              >
                <AppText gold>↺</AppText>
                <View style={styles.recentText}>
                  <AppText variant="subtitle" numberOfLines={1}>
                    {describeRoute(criteria, byCode)}
                  </AppText>
                  <AppText variant="caption" muted numberOfLines={1}>
                    {describeDetails(criteria)}
                  </AppText>
                </View>
              </PressableScale>
            ))}
          </Section>
        ) : null}

        <Section title="Departing soon">
          {upcomingLoading ? <ActivityIndicator color={colors.gold} /> : null}
          {(upcoming ?? []).slice(0, DEPARTING_SOON).map(flight => (
            <FlightCard key={flight.id} flight={flight} onPress={() => onOpenFlight(flight.id)} />
          ))}
        </Section>
      </ScrollView>
    </Screen>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={styles.section}>
      <AppText variant="label" muted>
        {title}
      </AppText>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.lg, gap: spacing.xl, paddingBottom: spacing.xxl },
  title: { gap: spacing.xs },
  section: { gap: spacing.md },
  passengers: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  recent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  recentText: { flex: 1, gap: 2 },
});
