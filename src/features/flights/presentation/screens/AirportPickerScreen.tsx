import { useMemo, useState } from 'react';
import { FlatList, StyleSheet, TextInput, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { colors, radius, spacing } from '@/core/theme/theme';
import { AppText } from '@/core/ui/AppText';
import { PressableScale } from '@/core/ui/PressableScale';
import { Screen } from '@/core/ui/Screen';
import { EmptyView, ErrorView, LoadingView } from '@/core/ui/StateViews';
import type { Airport } from '../../domain/entities/flight';
import { destinationSelected, originSelected, selectFlightSearch } from '../flight-search-slice';
import { useGetAirportsQuery } from '../flights-api';

export type AirportField = 'origin' | 'destination';

type Props = { field: AirportField; onDone: () => void };

const matches = (airport: Airport, query: string) =>
  [airport.code, airport.city, airport.name].some(text => text.toLowerCase().includes(query));

export function AirportPickerScreen({ field, onDone }: Props) {
  const dispatch = useDispatch();
  const search = useSelector(selectFlightSearch);
  const { data: airports, error, isLoading, refetch } = useGetAirportsQuery();
  const [query, setQuery] = useState('');

  const selected = search[field];
  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return needle ? (airports ?? []).filter(airport => matches(airport, needle)) : (airports ?? []);
  }, [airports, query]);

  const choose = (code: string | null) => {
    dispatch(field === 'origin' ? originSelected(code) : destinationSelected(code));
    onDone();
  };

  let body;
  if (isLoading) {
    body = <LoadingView />;
  } else if (error) {
    body = <ErrorView error={error} onRetry={refetch} />;
  } else {
    body = (
      <FlatList
        testID="airport-list"
        data={filtered}
        keyExtractor={airport => airport.code}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          query.trim() ? undefined : (
            <Option
              testID="airport-option-any"
              code="—"
              title={field === 'origin' ? 'Any airport' : 'Anywhere'}
              subtitle="Show every route"
              selected={selected === null}
              onPress={() => choose(null)}
            />
          )
        }
        ListEmptyComponent={<EmptyView title="No airports" message={`Nothing matches “${query.trim()}”.`} />}
        renderItem={({ item }) => (
          <Option
            testID={`airport-option-${item.code}`}
            code={item.code}
            title={item.city}
            subtitle={item.name}
            selected={selected === item.code}
            onPress={() => choose(item.code)}
          />
        )}
      />
    );
  }

  return (
    <Screen>
      <View style={styles.searchWrap}>
        <TextInput
          testID="airport-search"
          value={query}
          onChangeText={setQuery}
          placeholder="City, airport or code"
          placeholderTextColor={colors.textMuted}
          autoFocus
          autoCorrect={false}
          autoCapitalize="none"
          returnKeyType="search"
          style={styles.search}
        />
      </View>
      {body}
    </Screen>
  );
}

type OptionProps = {
  code: string;
  title: string;
  subtitle: string;
  selected: boolean;
  onPress: () => void;
  testID: string;
};

function Option({ code, title, subtitle, selected, onPress, testID }: OptionProps) {
  return (
    <PressableScale
      testID={testID}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={[styles.option, selected && styles.optionSelected]}
    >
      <View style={styles.codeBadge}>
        <AppText variant="subtitle" gold>
          {code}
        </AppText>
      </View>
      <View style={styles.optionText}>
        <AppText variant="subtitle">{title}</AppText>
        <AppText variant="caption" muted numberOfLines={1}>
          {subtitle}
        </AppText>
      </View>
      {selected ? <AppText gold>✓</AppText> : null}
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  searchWrap: { padding: spacing.lg, paddingBottom: spacing.sm },
  search: {
    color: colors.text,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    fontSize: 16,
  },
  list: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl, gap: spacing.sm, flexGrow: 1 },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  optionSelected: { borderColor: colors.gold },
  codeBadge: {
    width: 52,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderRadius: radius.sm,
    backgroundColor: colors.goldSoft,
  },
  optionText: { flex: 1, gap: 2 },
});
