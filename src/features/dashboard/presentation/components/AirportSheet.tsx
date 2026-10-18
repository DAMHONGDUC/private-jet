import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { blackJetFonts, useBlackJetTheme } from '@/core/theme/blackjet';
import { BJText } from '@/core/ui/BJText';
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
  [airport.code, airport.city, airport.name].some(text =>
    text.toLowerCase().includes(needle),
  );

/** Search by city, code or name; recent airports come first (feature-docs/dashboard §4.1). */
export function AirportSheet({
  visible,
  title,
  airports,
  recent,
  onPick,
  onClose,
}: Props) {
  const palette = useBlackJetTheme();
  const [query, setQuery] = useState('');

  const needle = query.trim().toLowerCase();
  const sections = useMemo((): { title: string; rows: Airport[] }[] => {
    const all = airports ?? [];
    if (needle) {
      return [
        {
          title: 'Results',
          rows: all.filter(airport => matches(airport, needle)),
        },
      ];
    }
    const byCode = new Map(all.map(airport => [airport.code, airport]));
    const recentRows = recent
      .map(code => byCode.get(code))
      .filter((item): item is Airport => !!item);
    const others = all.filter(airport => !recent.includes(airport.code));
    return [
      ...(recentRows.length > 0
        ? [{ title: 'Recent Airports', rows: recentRows }]
        : []),
      { title: 'All Airports', rows: others },
    ];
  }, [airports, needle, recent]);

  const close = () => {
    setQuery('');
    onClose();
  };

  return (
    <BJSheet
      visible={visible}
      title={title}
      onClose={close}
      testID="airport-sheet"
    >
      <View>
        <View
          style={[
            styles.search,
            { backgroundColor: palette.primaryBackground },
          ]}
        >
          <Icon name="search" size={20} color={palette.secondaryText} />
          <TextInput
            testID="airport-search"
            value={query}
            onChangeText={setQuery}
            autoFocus
            autoCorrect={false}
            autoCapitalize="none"
            placeholder="City, code or airport name"
            placeholderTextColor={palette.secondaryText}
            style={[styles.input, { color: palette.primaryText }]}
          />
          {query ? (
            <PressableScale
              accessibilityRole="button"
              accessibilityLabel="Clear"
              onPress={() => setQuery('')}
            >
              <Icon name="clear" size={20} color={palette.primaryText} />
            </PressableScale>
          ) : null}
        </View>
      </View>

      <View style={styles.listWrap}>
        {!airports ? (
          <ActivityIndicator color={palette.accent} />
        ) : needle && sections[0].rows.length === 0 ? (
          <BJText tone="secondary" weight="regular">
            No airport matches “{query.trim()}”.
          </BJText>
        ) : (
          <ScrollView keyboardShouldPersistTaps="handled">
            {sections.map(section => (
              <View key={section.title} style={styles.section}>
                <BJText size={13} tone="secondary" style={styles.heading}>
                  {section.title.toUpperCase()}
                </BJText>
                {section.rows.map(airport => (
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
                    <View
                      style={[
                        styles.code,
                        { backgroundColor: palette.primaryBackground },
                      ]}
                    >
                      <BJText>{airport.code}</BJText>
                    </View>
                    <View style={styles.flex}>
                      <BJText numberOfLines={1}>{airport.city}</BJText>
                      <BJText
                        size={13}
                        tone="secondary"
                        weight="regular"
                        numberOfLines={1}
                      >
                        {airport.name}
                      </BJText>
                    </View>
                  </PressableScale>
                ))}
              </View>
            ))}
          </ScrollView>
        )}
      </View>
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
  input: {
    flex: 1,
    fontFamily: blackJetFonts.regular,
    fontSize: 16,
    paddingVertical: 0,
  },
  listWrap: { marginTop: 16, minHeight: 240, maxHeight: 420 },
  section: { marginBottom: 16 },
  heading: { marginBottom: 4, letterSpacing: 0.8 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  code: {
    width: 52,
    height: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flex: { flex: 1, gap: 2 },
});
