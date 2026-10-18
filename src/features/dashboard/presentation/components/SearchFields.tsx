import { StyleSheet, View } from 'react-native';
import { useT } from '@/core/i18n/i18n';
import { ColorScheme } from '@/core/theme/app-colors';
import { useBlackJetTheme } from '@/core/theme/blackjet';
import { AppSpacing } from '@/core/theme/app-spacing';
import { elevation, radius } from '@/core/theme/theme';
import { BJText } from '@/core/ui/BJText';
import { Icon, type IconName } from '@/core/ui/Icon';
import { PressableScale } from '@/core/ui/PressableScale';
import type { Airport } from '@/features/flights/domain/entities/flight';
import { TRIP_TYPES, type TripType } from '../../domain/entities/charter';
import { TRIP_TYPE_LABELS } from '../search-labels';

type RadioProps = { value: TripType; onChange: (value: TripType) => void };

/** One Way · Round Trip · Multi City as a segmented control (feature-docs/dashboard §2.3a). */
export function TripTypeRadio({ value, onChange }: RadioProps) {
  const palette = useBlackJetTheme();
  const t = useT();
  return (
    <View
      style={[styles.segments, { backgroundColor: palette.primaryBackground }]}
      accessibilityRole="radiogroup"
    >
      {TRIP_TYPES.map(type => {
        const selected = type === value;
        return (
          <PressableScale
            key={type}
            testID={`trip-type-${type}`}
            accessibilityRole="radio"
            accessibilityState={{ checked: selected }}
            onPress={() => onChange(type)}
            scaleTo={1}
            style={[
              styles.segment,
              selected && {
                backgroundColor:
                  palette.scheme === ColorScheme.Dark
                    ? palette.iron
                    : palette.raised,
                ...elevation(palette.shadow),
              },
            ]}
          >
            <BJText
              size={13}
              tone={selected ? 'primary' : 'secondary'}
              weight={selected ? 'medium' : 'regular'}
            >
              {t(TRIP_TYPE_LABELS[type])}
            </BJText>
          </PressableScale>
        );
      })}
    </View>
  );
}

/** Which side of the route row a box sits on. */
export enum Align {
  Start = 'start',
  End = 'end',
}

type AirportBoxProps = {
  label: string;
  airport: Airport | undefined;
  code: string | null;
  placeholder: string;
  align: Align;
  /** Outlined in red while the field has a problem. */
  invalid?: boolean;
  onPress: () => void;
  testID: string;
};

/** "From / GVA / Geneva", or the placeholder until an airport is chosen. */
export function AirportBox({
  label,
  airport,
  code,
  placeholder,
  align,
  invalid,
  onPress,
  testID,
}: AirportBoxProps) {
  const palette = useBlackJetTheme();
  const t = useT();
  const alignItems = align === Align.Start ? 'flex-start' : 'flex-end';
  return (
    <PressableScale
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={`${label}, ${airport?.city ?? t('search.notChosen')}`}
      onPress={onPress}
      style={[
        styles.airport,
        { backgroundColor: palette.primaryBackground, alignItems },
        invalid && { borderColor: palette.error },
      ]}
    >
      <BJText size={13} tone="secondary" weight="regular">
        {label}
      </BJText>
      <BJText size={28} tone={code ? 'primary' : 'secondary'}>
        {code ?? placeholder}
      </BJText>
      <BJText size={13} tone="secondary" weight="regular" numberOfLines={1}>
        {airport?.city ?? t('search.selectAirport')}
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
  originInvalid?: boolean;
  destinationInvalid?: boolean;
  testID: string;
};

/** From and To side by side with the round swap button between them. */
export function RouteRow(props: RouteProps) {
  const palette = useBlackJetTheme();
  const t = useT();
  const { airports, origin, destination, testID } = props;
  return (
    <View style={styles.route}>
      <AirportBox
        testID={`${testID}-origin`}
        label={t('search.from')}
        code={origin}
        airport={origin ? airports[origin] : undefined}
        placeholder="—"
        align={Align.Start}
        invalid={props.originInvalid}
        onPress={props.onPickOrigin}
      />
      <AirportBox
        testID={`${testID}-destination`}
        label={t('search.to')}
        code={destination}
        airport={destination ? airports[destination] : undefined}
        placeholder="—"
        align={Align.End}
        invalid={props.destinationInvalid}
        onPress={props.onPickDestination}
      />
      <PressableScale
        testID={`${testID}-swap`}
        accessibilityRole="button"
        accessibilityLabel={t('search.swap')}
        onPress={props.onSwap}
        scaleTo={0.92}
        style={[
          styles.swap,
          { backgroundColor: palette.raised, borderColor: palette.iron },
          elevation(palette.shadow),
        ]}
      >
        <Icon
          name={props.roundTrip ? 'swap' : 'plane'}
          size={props.roundTrip ? 20 : 16}
          color={palette.accent}
        />
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
  /** Outlined in red while the field has a problem; the card prints why below. */
  invalid?: boolean;
  onPress: () => void;
  testID: string;
};

/** A 52 pt row with an icon: dates and passengers. */
export function FieldButton({
  icon,
  iconSize,
  text,
  filled,
  invalid,
  onPress,
  testID,
}: FieldProps) {
  const palette = useBlackJetTheme();
  return (
    <PressableScale
      testID={testID}
      accessibilityRole="button"
      onPress={onPress}
      style={[
        styles.field,
        { backgroundColor: palette.primaryBackground },
        invalid && { borderColor: palette.error },
      ]}
    >
      <Icon
        name={icon}
        size={iconSize}
        color={filled ? palette.accent : palette.secondaryText}
      />
      <BJText
        tone={filled ? 'primary' : 'secondary'}
        weight={filled ? 'medium' : 'regular'}
        numberOfLines={1}
        style={styles.fieldText}
      >
        {text}
      </BJText>
    </PressableScale>
  );
}

const SWAP_SIZE = 40;

const styles = StyleSheet.create({
  segments: {
    flexDirection: 'row',
    borderRadius: radius.md,
    padding: AppSpacing.xs,
  },
  segment: {
    flex: 1,
    height: 36,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  route: {
    flexDirection: 'row',
    gap: AppSpacing.sm,
    justifyContent: 'space-between',
  },
  airport: {
    flex: 1,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: 'transparent',
    paddingHorizontal: AppSpacing.lg,
    paddingVertical: AppSpacing.md,
    gap: AppSpacing.xs,
  },
  swap: {
    position: 'absolute',
    left: '50%',
    top: '50%',
    width: SWAP_SIZE,
    height: SWAP_SIZE,
    marginLeft: -SWAP_SIZE / 2,
    marginTop: -SWAP_SIZE / 2,
    borderRadius: SWAP_SIZE / 2,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  field: {
    flex: 1,
    height: 52,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: 'transparent',
    flexDirection: 'row',
    alignItems: 'center',
    gap: AppSpacing.md,
    paddingHorizontal: AppSpacing.lg,
  },
  fieldText: { flex: 1 },
});
