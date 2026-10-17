import { StyleSheet, View } from 'react-native';
import { colors, radius, spacing } from '@/core/theme/theme';
import { AppText } from '@/core/ui/AppText';
import { PressableScale } from '@/core/ui/PressableScale';
import type { Airport } from '../../domain/entities/flight';

type Props = {
  origin: Airport | undefined;
  destination: Airport | undefined;
  onPickOrigin: () => void;
  onPickDestination: () => void;
  onSwap: () => void;
};

/** From and To, stacked, with a swap button on the divider between them. */
export function RouteSelector({ origin, destination, onPickOrigin, onPickDestination, onSwap }: Props) {
  return (
    <View style={styles.card}>
      <AirportRow testID="pick-origin" label="From" airport={origin} placeholder="Any airport" onPress={onPickOrigin} />
      <View style={styles.divider}>
        <View style={styles.line} />
        <PressableScale
          testID="swap-airports"
          accessibilityRole="button"
          accessibilityLabel="Swap origin and destination"
          onPress={onSwap}
          style={styles.swap}
        >
          <AppText gold style={styles.swapIcon}>
            ⇅
          </AppText>
        </PressableScale>
      </View>
      <AirportRow
        testID="pick-destination"
        label="To"
        airport={destination}
        placeholder="Anywhere"
        onPress={onPickDestination}
      />
    </View>
  );
}

type RowProps = {
  label: string;
  airport: Airport | undefined;
  placeholder: string;
  onPress: () => void;
  testID: string;
};

function AirportRow({ label, airport, placeholder, onPress, testID }: RowProps) {
  return (
    <PressableScale testID={testID} accessibilityRole="button" onPress={onPress} style={styles.row}>
      <AppText variant="label" muted>
        {label}
      </AppText>
      <View style={styles.value}>
        <AppText variant="title" style={styles.code} muted={!airport}>
          {airport ? airport.code : '—'}
        </AppText>
        <View style={styles.names}>
          <AppText variant="subtitle" numberOfLines={1}>
            {airport ? airport.city : placeholder}
          </AppText>
          <AppText variant="caption" muted numberOfLines={1}>
            {airport ? airport.name : 'Tap to choose'}
          </AppText>
        </View>
      </View>
    </PressableScale>
  );
}

const SWAP_SIZE = 40;

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    paddingHorizontal: spacing.lg,
  },
  row: { paddingVertical: spacing.lg, gap: spacing.sm },
  value: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  code: { minWidth: 52 },
  names: { flex: 1 },
  divider: { height: SWAP_SIZE, justifyContent: 'center', marginVertical: -SWAP_SIZE / 2 },
  line: { height: StyleSheet.hairlineWidth, backgroundColor: colors.border },
  swap: {
    position: 'absolute',
    right: 0,
    width: SWAP_SIZE,
    height: SWAP_SIZE,
    borderRadius: SWAP_SIZE / 2,
    borderWidth: 1,
    borderColor: colors.gold,
    backgroundColor: colors.surfaceRaised,
    alignItems: 'center',
    justifyContent: 'center',
  },
  swapIcon: { fontSize: 18 },
});
