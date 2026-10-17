import { ActivityIndicator, StyleSheet, View } from 'react-native';
import Animated, { Easing, FadeIn, FadeOut, LinearTransition } from 'react-native-reanimated';
import { blackJetCurves, useBlackJetTheme } from '@/core/theme/blackjet';
import { BJText } from '@/core/ui/BJText';
import { Icon } from '@/core/ui/Icon';
import { PressableScale } from '@/core/ui/PressableScale';
import type { Airport } from '@/features/flights/domain/entities/flight';
import { MAX_MULTI_CITY_LEGS, type CharterDraft, type DraftLeg, type TripType } from '../../domain/entities/charter';
import type { AirportEnd, LegTarget } from '../charter-search-slice';
import { formatDay, passengersLabel } from '../search-labels';
import { FieldButton, RouteRow, TripTypeRadio } from './SearchFields';

/** The card grows and shrinks over 2 s when its content changes (feature-docs/dashboard §6.1 A1–A3). */
export const CARD_RESIZE_MS = 2000;
const cardLayout = LinearTransition.duration(CARD_RESIZE_MS).easing(Easing.bezier(...blackJetCurves.easeInOut));
const legsLayout = LinearTransition.duration(CARD_RESIZE_MS).easing(Easing.linear);
const appear = FadeIn.duration(CARD_RESIZE_MS / 2);
const disappear = FadeOut.duration(CARD_RESIZE_MS / 4);

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
  /** "Find Your Jet", or "Update Results" once the form differs from what is shown. */
  findLabel: string;
  finding: boolean;
};

/** The search form (feature-docs/dashboard §2.3). */
export function BookingCard(props: Props) {
  const palette = useBlackJetTheme();
  const { draft } = props;
  const roundTrip = draft.tripType === 'roundTrip';

  return (
    <Animated.View
      layout={cardLayout}
      testID="booking-card"
      style={[styles.card, { backgroundColor: palette.secondaryBackground, borderColor: palette.iron }]}
    >
      <TripTypeRadio value={draft.tripType} onChange={props.onTripType} />

      {draft.tripType === 'multiCity' ? (
        <Animated.View key="legs" layout={legsLayout} entering={appear} exiting={disappear} style={styles.legs}>
          {draft.legs.map((leg, index) => (
            <Animated.View key={index} layout={legsLayout} entering={appear} exiting={disappear}>
              <LegEditor {...props} leg={leg} index={index} removable={draft.legs.length > 1} />
            </Animated.View>
          ))}
          {draft.legs.length < MAX_MULTI_CITY_LEGS ? (
            <PressableScale
              testID="add-leg"
              accessibilityRole="button"
              onPress={props.onAddLeg}
              style={[styles.addLeg, { backgroundColor: palette.primaryBackground }]}
            >
              <View style={styles.addIcon}>
                <Icon name="add" size={24} color={palette.jetBlack} />
              </View>
              <BJText>Add Flight Leg</BJText>
            </PressableScale>
          ) : null}
        </Animated.View>
      ) : (
        <Animated.View key="single" layout={cardLayout} entering={appear} exiting={disappear} style={styles.section}>
          <RouteRow
            testID="outbound"
            airports={props.airports}
            origin={draft.outbound.origin}
            destination={draft.outbound.destination}
            roundTrip={roundTrip}
            onPickOrigin={() => props.onPickAirport('outbound', 'origin')}
            onPickDestination={() => props.onPickAirport('outbound', 'destination')}
            onSwap={() => props.onSwap('outbound')}
          />
          <View style={styles.pair}>
            <FieldButton
              testID="outbound-date"
              icon="calendar"
              iconSize={17}
              text={draft.outbound.date ? formatDay(draft.outbound.date) : 'Departure Date'}
              filled={!!draft.outbound.date}
              onPress={() => props.onPickDate('outbound')}
            />
            {roundTrip ? (
              <Animated.View entering={appear} exiting={disappear} layout={cardLayout} style={styles.flex}>
                <FieldButton
                  testID="return-date"
                  icon="calendar"
                  iconSize={17}
                  text={draft.returnDate ? formatDay(draft.returnDate) : 'Return Date'}
                  filled={!!draft.returnDate}
                  onPress={props.onPickReturnDate}
                />
              </Animated.View>
            ) : null}
          </View>
          <FieldButton
            testID="outbound-passengers"
            icon="family"
            iconSize={20}
            text={draft.outbound.passengers > 0 ? passengersLabel(draft.outbound.passengers) : 'Number of Passengers'}
            filled={draft.outbound.passengers > 0}
            onPress={() => props.onPickPassengers('outbound')}
          />
        </Animated.View>
      )}

      <View style={[styles.divider, { backgroundColor: palette.iron }]} />

      <PressableScale
        testID="find-jet"
        accessibilityRole="button"
        accessibilityState={{ busy: props.finding }}
        disabled={props.finding}
        onPress={props.onFind}
        style={[styles.find, { backgroundColor: palette.jetBlack, borderColor: palette.ghostWhite }]}
      >
        {props.finding ? (
          <ActivityIndicator color={palette.ghostWhite} />
        ) : (
          <BJText size={16} tone="inverse">
            {props.findLabel}
          </BJText>
        )}
      </PressableScale>
    </Animated.View>
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
    <View testID={`leg-${index}`} style={[styles.leg, { borderColor: palette.iron }]}>
      <View style={styles.legHeader}>
        <BJText size={12} weight="bold">
          LEG #{index + 1}
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
          text={leg.date ? formatDay(leg.date) : 'Departure Date'}
          filled={!!leg.date}
          onPress={() => actions.onPickDate(index)}
        />
        <FieldButton
          testID={`leg-${index}-passengers`}
          icon="family"
          iconSize={20}
          text={leg.passengers > 0 ? passengersLabel(leg.passengers) : 'Passengers'}
          filled={leg.passengers > 0}
          onPress={() => actions.onPickPassengers(index)}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 12,
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 12,
    overflow: 'hidden',
  },
  section: { gap: 12 },
  pair: { flexDirection: 'row', gap: 12 },
  flex: { flex: 1 },
  legs: { gap: 12 },
  leg: { gap: 10, paddingBottom: 12, borderBottomWidth: StyleSheet.hairlineWidth },
  legHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  addLeg: { height: 50, borderRadius: 8, flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 12 },
  addIcon: { width: 40, alignItems: 'center' },
  divider: { height: 1, marginVertical: 4 },
  find: { height: 50, borderRadius: 12, borderWidth: 1, alignItems: 'center', justifyContent: 'center', marginHorizontal: 12 },
});
