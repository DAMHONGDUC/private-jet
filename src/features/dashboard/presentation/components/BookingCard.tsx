import { StyleSheet, View } from 'react-native';
import { useBlackJetTheme } from '@/core/theme/blackjet';
import { elevation, radius, spacing } from '@/core/theme/theme';
import { BJText } from '@/core/ui/BJText';
import { Icon } from '@/core/ui/Icon';
import { PressableScale } from '@/core/ui/PressableScale';
import type { Airport } from '@/features/flights/domain/entities/flight';
import {
  MAX_MULTI_CITY_LEGS,
  type CharterDraft,
  type DraftLeg,
  type TripType,
} from '../../domain/entities/charter';
import type { AirportEnd, LegTarget } from '../charter-search-slice';
import { formatDay, passengersLabel } from '../search-labels';
import { FieldButton, RouteRow, TripTypeRadio } from './SearchFields';

export type BookingCardActions = {
  onTripType: (type: TripType) => void;
  onPickAirport: (target: LegTarget, end: AirportEnd) => void;
  onSwap: (target: LegTarget) => void;
  onPickDate: (target: LegTarget) => void;
  onPickReturnDate: () => void;
  onPickPassengers: (target: LegTarget) => void;
  onAddLeg: () => void;
  onRemoveLeg: (index: number) => void;
  onFind: () => void;
};

type Props = BookingCardActions & {
  draft: CharterDraft;
  airports: Record<string, Airport | undefined>;
};

/** The search form (feature-docs/dashboard §2.3); fields change in place, without animation. */
export function BookingCard(props: Props) {
  const palette = useBlackJetTheme();
  const { draft } = props;
  const roundTrip = draft.tripType === 'roundTrip';

  return (
    <View
      testID="booking-card"
      style={[
        styles.card,
        { backgroundColor: palette.raised },
        elevation(palette.shadow),
      ]}
    >
      <TripTypeRadio value={draft.tripType} onChange={props.onTripType} />

      {draft.tripType === 'multiCity' ? (
        <View style={styles.legs}>
          {draft.legs.map((leg, index) => (
            <LegEditor
              key={index}
              {...props}
              leg={leg}
              index={index}
              removable={draft.legs.length > 1}
            />
          ))}
          {draft.legs.length < MAX_MULTI_CITY_LEGS ? (
            <PressableScale
              testID="add-leg"
              accessibilityRole="button"
              onPress={props.onAddLeg}
              style={[styles.addLeg, { borderColor: palette.ashGrey }]}
            >
              <Icon name="add" size={20} color={palette.accent} />
              <BJText>Add flight leg</BJText>
            </PressableScale>
          ) : null}
        </View>
      ) : (
        <View style={styles.section}>
          <RouteRow
            testID="outbound"
            airports={props.airports}
            origin={draft.outbound.origin}
            destination={draft.outbound.destination}
            roundTrip={roundTrip}
            onPickOrigin={() => props.onPickAirport('outbound', 'origin')}
            onPickDestination={() =>
              props.onPickAirport('outbound', 'destination')
            }
            onSwap={() => props.onSwap('outbound')}
          />
          <View style={styles.pair}>
            <FieldButton
              testID="outbound-date"
              icon="calendar"
              iconSize={17}
              text={
                draft.outbound.date
                  ? formatDay(draft.outbound.date)
                  : 'Departure'
              }
              filled={!!draft.outbound.date}
              onPress={() => props.onPickDate('outbound')}
            />
            {roundTrip ? (
              <View style={styles.flex}>
                <FieldButton
                  testID="return-date"
                  icon="calendar"
                  iconSize={17}
                  text={
                    draft.returnDate ? formatDay(draft.returnDate) : 'Return'
                  }
                  filled={!!draft.returnDate}
                  onPress={props.onPickReturnDate}
                />
              </View>
            ) : null}
          </View>
          <FieldButton
            testID="outbound-passengers"
            icon="family"
            iconSize={20}
            text={
              draft.outbound.passengers > 0
                ? passengersLabel(draft.outbound.passengers)
                : 'Passengers'
            }
            filled={draft.outbound.passengers > 0}
            onPress={() => props.onPickPassengers('outbound')}
          />
        </View>
      )}

      <PressableScale
        testID="find-jet"
        accessibilityRole="button"
        onPress={props.onFind}
        style={[styles.find, { backgroundColor: palette.accent }]}
      >
        <Icon name="search" size={20} color={palette.onAccent} />
        <BJText tone="onAccent">Find Your Jet</BJText>
      </PressableScale>
    </View>
  );
}

type LegProps = BookingCardActions & {
  leg: DraftLeg;
  index: number;
  removable: boolean;
  airports: Record<string, Airport | undefined>;
};

/** One multi-city leg: LEG #n, its route, day and party. */
function LegEditor({ leg, index, removable, airports, ...actions }: LegProps) {
  const palette = useBlackJetTheme();
  return (
    <View testID={`leg-${index}`} style={styles.leg}>
      <View style={styles.legHeader}>
        <BJText size={13} tone="secondary">
          LEG {index + 1}
        </BJText>
        {removable ? (
          <PressableScale
            testID={`leg-${index}-remove`}
            accessibilityRole="button"
            accessibilityLabel={`Remove Flight Leg #${index + 1}`}
            onPress={() => actions.onRemoveLeg(index)}
          >
            <Icon name="close" size={18} color={palette.secondaryText} />
          </PressableScale>
        ) : null}
      </View>
      <RouteRow
        testID={`leg-${index}`}
        airports={airports}
        origin={leg.origin}
        destination={leg.destination}
        roundTrip={false}
        onPickOrigin={() => actions.onPickAirport(index, 'origin')}
        onPickDestination={() => actions.onPickAirport(index, 'destination')}
        onSwap={() => actions.onSwap(index)}
      />
      <View style={styles.pair}>
        <FieldButton
          testID={`leg-${index}-date`}
          icon="calendar"
          iconSize={17}
          text={leg.date ? formatDay(leg.date) : 'Departure'}
          filled={!!leg.date}
          onPress={() => actions.onPickDate(index)}
        />
        <FieldButton
          testID={`leg-${index}-passengers`}
          icon="family"
          iconSize={20}
          text={
            leg.passengers > 0 ? passengersLabel(leg.passengers) : 'Passengers'
          }
          filled={leg.passengers > 0}
          onPress={() => actions.onPickPassengers(index)}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: spacing.lg,
    borderRadius: radius.xl,
    padding: spacing.lg,
    gap: spacing.md,
  },
  section: { gap: spacing.sm },
  pair: { flexDirection: 'row', gap: spacing.sm },
  flex: { flex: 1 },
  legs: { gap: spacing.lg },
  leg: { gap: spacing.sm },
  legHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  addLeg: {
    height: 52,
    borderRadius: radius.md,
    borderWidth: 1,
    borderStyle: 'dashed',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  find: {
    height: 52,
    borderRadius: radius.md,
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xs,
  },
});
