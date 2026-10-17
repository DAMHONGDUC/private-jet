import { StyleSheet, View } from 'react-native';
import { useBlackJetTheme } from '@/core/theme/blackjet';
import { BJText } from '@/core/ui/BJText';
import { Icon, type IconName } from '@/core/ui/Icon';
import { PressableScale } from '@/core/ui/PressableScale';
import type { Airport } from '@/features/flights/domain/entities/flight';
import { TRIP_TYPES, type TripType } from '../../domain/entities/charter';
import { TRIP_TYPE_LABELS } from '../search-labels';

type RadioProps = { value: TripType; onChange: (value: TripType) => void };

/** One Way · Round Trip · Multi City (feature-docs/dashboard §2.3a). */
export function TripTypeRadio({ value, onChange }: RadioProps) {
  const palette = useBlackJetTheme();
  return (
    <View style={styles.radioRow} accessibilityRole="radiogroup">
      {TRIP_TYPES.map(type => {
        const selected = type === value;
        const color = selected ? palette.jetBlack : palette.ashGrey;
        return (
          <PressableScale
            key={type}
            testID={`trip-type-${type}`}
            accessibilityRole="radio"
            accessibilityState={{ checked: selected }}
            onPress={() => onChange(type)}
            style={styles.radio}
          >
            <View style={[styles.ring, { borderColor: color }]}>
              {selected ? <View style={[styles.dot, { backgroundColor: color }]} /> : null}
            </View>
            <BJText weight={selected ? 'bold' : 'medium'} style={{ color }}>
              {TRIP_TYPE_LABELS[type]}
            </BJText>
          </PressableScale>
        );
      })}
    </View>
  );
}

type AirportBoxProps = {
  label: string;
  airport: Airport | undefined;
  code: string | null;
  placeholder: string;
  align: 'start' | 'end';
  onPress: () => void;
  testID: string;
};

/** "From / GVA / Geneva", or the placeholder until an airport is chosen. */
export function AirportBox({ label, airport, code, placeholder, align, onPress, testID }: AirportBoxProps) {
  const palette = useBlackJetTheme();
  const alignItems = align === 'start' ? 'flex-start' : 'flex-end';
  return (
    <PressableScale
      testID={testID}
      accessibilityRole="button"
      onPress={onPress}
      style={[styles.airport, { backgroundColor: palette.primaryBackground, alignItems }]}
    >
      <BJText size={10}>{label}</BJText>
      <BJText size={16}>{code ?? placeholder}</BJText>
      <BJText size={12} tone="secondary" numberOfLines={1}>
        {airport?.city ?? 'Select Airport'}
      </BJText>
    </PressableScale>
  );
}

type RouteProps = {
  airports: Record<string, Airport | undefined>;
  origin: string | null;
  destination: string | null;
  /** Round Trip shows ⇄; everything else a plane. */
  roundTrip: boolean;
  onPickOrigin: () => void;
  onPickDestination: () => void;
  onSwap: () => void;
  testID: string;
};

/** From and To side by side with the round swap button between them. */
export function RouteRow(props: RouteProps) {
  const palette = useBlackJetTheme();
  const { airports, origin, destination, testID } = props;
  return (
    <View style={styles.route}>
      <AirportBox
        testID={`${testID}-origin`}
        label="From"
        code={origin}
        airport={origin ? airports[origin] : undefined}
        placeholder="Departure"
        align="start"
        onPress={props.onPickOrigin}
      />
      <AirportBox
        testID={`${testID}-destination`}
        label="To"
        code={destination}
        airport={destination ? airports[destination] : undefined}
        placeholder="Arrival"
        align="end"
        onPress={props.onPickDestination}
      />
      <PressableScale
        testID={`${testID}-swap`}
        accessibilityRole="button"
        accessibilityLabel="Swap departure and arrival"
        onPress={props.onSwap}
        style={[styles.swap, { backgroundColor: palette.jetBlack }]}
      >
        <Icon name={props.roundTrip ? 'swap' : 'plane'} size={props.roundTrip ? 24 : 18} color={palette.ghostWhite} />
      </PressableScale>
    </View>
  );
}

type FieldProps = {
  icon: IconName;
  iconSize: number;
  text: string;
  /** Muted while the field holds no value yet. */
  filled: boolean;
  onPress: () => void;
  testID: string;
};

/** A 50 pt row with an icon: dates and passengers. */
export function FieldButton({ icon, iconSize, text, filled, onPress, testID }: FieldProps) {
  const palette = useBlackJetTheme();
  return (
    <PressableScale
      testID={testID}
      accessibilityRole="button"
      onPress={onPress}
      style={[styles.field, { backgroundColor: palette.primaryBackground }]}
    >
      <View style={styles.fieldIcon}>
        <Icon name={icon} size={iconSize} color={palette.primaryText} />
      </View>
      <BJText size={filled ? 14 : 12} tone={filled ? 'primary' : 'secondary'} numberOfLines={1} style={styles.fieldText}>
        {text}
      </BJText>
    </PressableScale>
  );
}

const SWAP_SIZE = 38;

const styles = StyleSheet.create({
  radioRow: { flexDirection: 'row', justifyContent: 'space-between', height: 30, alignItems: 'center' },
  radio: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  ring: { width: 18, height: 18, borderRadius: 9, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  dot: { width: 9, height: 9, borderRadius: 4.5 },
  route: { flexDirection: 'row', gap: 12, justifyContent: 'space-between' },
  airport: { flex: 1, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 10, gap: 5 },
  swap: {
    position: 'absolute',
    left: '50%',
    top: '50%',
    width: SWAP_SIZE,
    height: SWAP_SIZE,
    marginLeft: -SWAP_SIZE / 2,
    marginTop: -SWAP_SIZE / 2,
    borderRadius: SWAP_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  field: { flex: 1, height: 50, borderRadius: 12, flexDirection: 'row', alignItems: 'center', paddingRight: 12 },
  fieldIcon: { width: 40, alignItems: 'center' },
  fieldText: { flex: 1 },
});
