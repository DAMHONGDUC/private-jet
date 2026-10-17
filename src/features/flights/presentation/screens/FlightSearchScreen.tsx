import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { colors, radius, spacing } from '@/core/theme/theme';
import { AppText } from '@/core/ui/AppText';
import { BottomSheet, SheetOption } from '@/core/ui/BottomSheet';
import { Button } from '@/core/ui/Button';
import { PressableScale } from '@/core/ui/PressableScale';
import { Screen } from '@/core/ui/Screen';
import { Stepper } from '@/core/ui/Stepper';
import { fromDayKey } from '@/core/utils/date';
import { formatDate } from '@/core/utils/format';
import {
  DEPARTURE_WINDOW_ORDER,
  JET_CATEGORIES,
  MAX_SEARCH_PASSENGERS,
  type Airport,
} from '../../domain/entities/flight';
import { CATEGORY_LABELS } from '../components/CategoryChips';
import { DateSheet } from '../components/DateSheet';
import { SearchField } from '../components/SearchField';
import {
  airportsSwapped,
  categorySelected,
  dateSelected,
  passengersChanged,
  recentSearchApplied,
  searchSubmitted,
  selectFlightSearch,
  timeSelected,
  type SearchCriteria,
} from '../flight-search-slice';
import { useGetAirportsQuery } from '../flights-api';
import {
  DEPARTURE_WINDOW_LABELS,
  airportsByCode,
  describeDetails,
  describeRoute,
  describeWindowHours,
} from '../search-summary';
import type { AirportField } from './AirportPickerScreen';

type Sheet = 'date' | 'time' | 'passengers' | 'jet' | null;

type Props = {
  onPickAirport: (field: AirportField) => void;
  onSearch: () => void;
  /** The first day the calendar allows; tests pin it. */
  today?: Date;
};

const airportLabel = (airport: Airport | undefined, code: string | null) =>
  code ? `${airport?.city ?? code} (${code})` : null;

export function FlightSearchScreen({ onPickAirport, onSearch, today: todayProp }: Props) {
  const dispatch = useDispatch();
  const search = useSelector(selectFlightSearch);
  const { data: airports } = useGetAirportsQuery();
  const [today] = useState(() => todayProp ?? new Date());
  const [sheet, setSheet] = useState<Sheet>(null);
  const closeSheet = () => setSheet(null);

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
      <ScrollView contentContainerStyle={styles.content}>
        <AppText variant="display">Where to?</AppText>

        <View style={styles.card}>
          <View>
            <SearchField
              testID="pick-origin"
              label="From"
              value={airportLabel(search.origin ? byCode[search.origin] : undefined, search.origin)}
              placeholder="Any airport"
              onPress={() => onPickAirport('origin')}
              style={styles.routeField}
            />
            <View style={styles.divider} />
            <SearchField
              testID="pick-destination"
              label="To"
              value={airportLabel(search.destination ? byCode[search.destination] : undefined, search.destination)}
              placeholder="Anywhere"
              onPress={() => onPickAirport('destination')}
              style={styles.routeField}
            />
            <PressableScale
              testID="swap-airports"
              accessibilityRole="button"
              accessibilityLabel="Swap origin and destination"
              onPress={() => dispatch(airportsSwapped())}
              style={styles.swap}
            >
              <AppText gold>⇅</AppText>
            </PressableScale>
          </View>
          <View style={styles.divider} />
          <View style={styles.pair}>
            <SearchField
              testID="pick-date"
              label="Departure date"
              value={search.date ? formatDate(fromDayKey(search.date).toISOString()) : null}
              placeholder="Any date"
              onPress={() => setSheet('date')}
            />
            <View style={styles.vertical} />
            <SearchField
              testID="pick-time"
              label="Time"
              value={search.time ? DEPARTURE_WINDOW_LABELS[search.time] : null}
              placeholder="Any time"
              onPress={() => setSheet('time')}
            />
          </View>
          <View style={styles.divider} />
          <View style={styles.pair}>
            <SearchField
              testID="pick-passengers"
              label="Passengers"
              value={`${search.passengers} passenger${search.passengers > 1 ? 's' : ''}`}
              placeholder=""
              onPress={() => setSheet('passengers')}
            />
            <View style={styles.vertical} />
            <SearchField
              testID="pick-jet"
              label="Jet type"
              value={search.category ? CATEGORY_LABELS[search.category] : null}
              placeholder="Any jet"
              onPress={() => setSheet('jet')}
            />
          </View>
          <View style={styles.action}>
            <Button testID="search-flights" title="Search flights" onPress={submit} />
          </View>
        </View>

        {search.recent.length > 0 ? (
          <View style={styles.recent}>
            <AppText variant="caption" muted>
              Recent searches
            </AppText>
            {search.recent.map((criteria, index) => (
              <PressableScale
                key={`${describeRoute(criteria, byCode)}-${describeDetails(criteria)}`}
                testID={`recent-search-${index}`}
                accessibilityRole="button"
                onPress={() => repeat(criteria)}
                style={styles.recentRow}
              >
                <AppText numberOfLines={1}>{describeRoute(criteria, byCode)}</AppText>
                <AppText variant="caption" muted numberOfLines={1}>
                  {describeDetails(criteria)}
                </AppText>
              </PressableScale>
            ))}
          </View>
        ) : null}
      </ScrollView>

      <DateSheet
        visible={sheet === 'date'}
        today={today}
        value={search.date}
        onChange={day => dispatch(dateSelected(day))}
        onClose={closeSheet}
      />

      <BottomSheet visible={sheet === 'time'} title="Departure time" onClose={closeSheet} testID="time-sheet">
        {[null, ...DEPARTURE_WINDOW_ORDER].map(window => (
          <SheetOption
            key={window ?? 'any'}
            testID={`time-option-${window ?? 'any'}`}
            label={window ? `${DEPARTURE_WINDOW_LABELS[window]} · ${describeWindowHours(window)}` : 'Any time'}
            selected={search.time === window}
            onPress={() => {
              dispatch(timeSelected(window));
              closeSheet();
            }}
          />
        ))}
      </BottomSheet>

      <BottomSheet visible={sheet === 'passengers'} title="Passengers" onClose={closeSheet} testID="passengers-sheet">
        <View style={styles.stepperRow}>
          <AppText muted>Up to {MAX_SEARCH_PASSENGERS} per booking</AppText>
          <Stepper
            testID="search-passengers"
            value={search.passengers}
            min={1}
            max={MAX_SEARCH_PASSENGERS}
            onChange={count => dispatch(passengersChanged(count))}
          />
        </View>
        <Button testID="passengers-done" title="Done" onPress={closeSheet} />
      </BottomSheet>

      <BottomSheet visible={sheet === 'jet'} title="Jet type" onClose={closeSheet} testID="jet-sheet">
        {[null, ...JET_CATEGORIES].map(category => (
          <SheetOption
            key={category ?? 'any'}
            testID={`jet-option-${category ?? 'any'}`}
            label={category ? CATEGORY_LABELS[category] : 'Any jet'}
            selected={search.category === category}
            onPress={() => {
              dispatch(categorySelected(category));
              closeSheet();
            }}
          />
        ))}
      </BottomSheet>
    </Screen>
  );
}

const SWAP_SIZE = 36;

const styles = StyleSheet.create({
  content: { padding: spacing.lg, gap: spacing.xl, paddingBottom: spacing.xxl },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.lg,
  },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: colors.border },
  // Keeps long city names clear of the swap button.
  routeField: { paddingRight: SWAP_SIZE + spacing.sm },
  swap: {
    position: 'absolute',
    right: 0,
    top: '50%',
    marginTop: -SWAP_SIZE / 2,
    width: SWAP_SIZE,
    height: SWAP_SIZE,
    borderRadius: SWAP_SIZE / 2,
    backgroundColor: colors.surfaceRaised,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pair: { flexDirection: 'row', gap: spacing.lg },
  vertical: { width: StyleSheet.hairlineWidth, backgroundColor: colors.border },
  action: { paddingVertical: spacing.lg },
  recent: { gap: spacing.xs },
  recentRow: {
    paddingVertical: spacing.md,
    gap: 2,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.lg,
  },
});
