import { useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { blackJetFonts, useBlackJetTheme } from '@/core/theme/blackjet';
import { BJText } from '@/core/ui/BJText';
import { FadeUp } from '@/core/ui/FadeUp';
import { Icon } from '@/core/ui/Icon';
import { PressableScale } from '@/core/ui/PressableScale';
import type { Airport } from '@/features/flights/domain/entities/flight';
import { BJSheet } from './BJSheet';

type Props = {
  visible: boolean;
  title: string;
  airports: Airport[] | undefined;
  /** IATA codes, most recent first; shown while the search box is empty. */
  recent: string[];
  onPick: (code: string) => void;
  onClose: () => void;
};

const matches = (airport: Airport, needle: string) =>
  [airport.code, airport.city, airport.name].some(text => text.toLowerCase().includes(needle));

/** Search by city, code or name, or pick a recent airport (feature-docs/dashboard §4.1). */
export function AirportSheet({ visible, title, airports, recent, onPick, onClose }: Props) {
  const palette = useBlackJetTheme();
  const [query, setQuery] = useState('');

  const needle = query.trim().toLowerCase();
  const rows = useMemo(() => {
    const all = airports ?? [];
    if (needle) {
      return all.filter(airport => matches(airport, needle));
    }
    const byCode = new Map(all.map(airport => [airport.code, airport]));
    const recentAirports = recent.map(code => byCode.get(code)).filter((item): item is Airport => !!item);
    return recentAirports.length > 0 ? recentAirports : all;
  }, [airports, needle, recent]);

  const close = () => {
    setQuery('');
    onClose();
  };

  return (
    <BJSheet visible={visible} title={title} onClose={close} testID="airport-sheet">
      <FadeUp index={1}>
        <View style={[styles.search, { backgroundColor: palette.primaryBackground }]}>
          <Icon name="search" size={20} color={palette.secondaryText} />
          <TextInput
            testID="airport-search"
            value={query}
            onChangeText={setQuery}
            autoFocus
            autoCorrect={false}
            autoCapitalize="none"
            placeholder="Search for airports by city, code, or name..."
            placeholderTextColor={palette.secondaryText}
            style={[styles.input, { color: palette.primaryText }]}
          />
          {query ? (
            <PressableScale accessibilityRole="button" accessibilityLabel="Clear" onPress={() => setQuery('')}>
              <Icon name="clear" size={20} color={palette.primaryText} />
            </PressableScale>
          ) : null}
        </View>
      </FadeUp>

      <FadeUp index={2} style={styles.listWrap}>
        <BJText size={16} style={styles.heading}>
          {needle ? 'Results' : recent.length > 0 ? 'Recent Airports' : 'All Airports'}
        </BJText>
        {!airports ? (
          <ActivityIndicator color={palette.jetBlack} />
        ) : rows.length === 0 ? (
          <BJText tone="secondary" weight="regular">
            No airport matches “{query.trim()}”.
          </BJText>
        ) : (
          <ScrollView keyboardShouldPersistTaps="handled">
            {rows.map(airport => (
              <PressableScale
                key={airport.code}
                testID={`airport-option-${airport.code}`}
                accessibilityRole="button"
                onPress={() => {
                  setQuery('');
                  onPick(airport.code);
                }}
                style={[styles.row, { borderBottomColor: palette.iron }]}
              >
                <BJText size={18}>{airport.code}</BJText>
                <BJText tone="secondary" numberOfLines={1}>
                  {airport.city} - {airport.name}
                </BJText>
              </PressableScale>
            ))}
          </ScrollView>
        )}
      </FadeUp>
    </BJSheet>
  );
}

const styles = StyleSheet.create({
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 50,
  },
  input: { flex: 1, fontFamily: blackJetFonts.regular, fontSize: 14, paddingVertical: 0 },
  listWrap: { marginTop: 18, minHeight: 240, maxHeight: 420 },
  heading: { marginBottom: 8 },
  row: { paddingVertical: 12, gap: 4, borderBottomWidth: StyleSheet.hairlineWidth },
});
