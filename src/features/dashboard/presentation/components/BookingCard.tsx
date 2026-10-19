import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  LinearTransition,
} from 'react-native-reanimated';
import { useT } from '@/core/i18n/i18n';
import { useBlackJetTheme } from '@/core/theme/blackjet';
import { AppSpacing } from '@/core/theme/app-spacing';
import { elevation, radius, switchTiming } from '@/core/theme/theme';
import { BJText } from '@/core/ui/BJText';
import { Icon } from '@/core/ui/Icon';
import { PressableScale } from '@/core/ui/PressableScale';
import type { Airport } from '@/features/flights/domain/entities/flight';
import {
  AirportEnd,
  DraftPart,
  LegSlot,
  MAX_MULTI_CITY_LEGS,
  RETURN_DATE_FIELD,
  TripType,
  draftField,
  type CharterDraft,
} from '../../domain/entities/charter';
import type {
  BookingCardActions,
  BookingCardErrors,
} from './booking-card-types';
import { DateBox } from './DateBox';
import { Align } from './FieldBox';
import { GuestsRow } from './GuestsRow';
import { LegEditor } from './LegEditor';
import { RouteRow } from './RouteRow';
import { RowErrors } from './RowErrors';
import { TripTypeRadio } from './TripTypeRadio';

type Props = BookingCardActions & {
  draft: CharterDraft;
  airports: Record<string, Airport | undefined>;
  errors?: BookingCardErrors;
};

const EASE = Easing.out(Easing.cubic);
/** Fields that stay slide to their new place and size. */
const MOVE = LinearTransition.duration(switchTiming.duration).easing(EASE);
/** A field arriving fades in once the others have moved. */
const ARRIVE = FadeIn.duration(switchTiming.duration).delay(80);
/** A whole form replacing another fades straight in, so the card never shows empty. */
const SWAP = FadeIn.duration(switchTiming.duration);

/**
 * The search form (feature-docs/dashboard §2.3). Changing the trip type
 * animates in place: the segment slides, the Return date fades in beside
 * Departure as it narrows (and leaves at once as it widens), and the card
 * eases to its new height. A leaving field never fades out: it would linger
 * over the form that replaces it.
 */
export function BookingCard(props: Props) {
  const palette = useBlackJetTheme();
  const t = useT();
  const { draft, errors = {} } = props;
  const roundTrip = draft.tripType === TripType.RoundTrip;
  const outbound = (part: DraftPart) =>
    errors[draftField(LegSlot.Outbound, part)];

  return (
    <Animated.View
      testID="booking-card"
      layout={MOVE}
      style={[
        styles.card,
        { backgroundColor: palette.raised },
        elevation(palette.shadow),
      ]}
    >
      <TripTypeRadio value={draft.tripType} onChange={props.onTripType} />

      {draft.tripType === TripType.MultiCity ? (
        <Animated.View key="legs" entering={SWAP} style={styles.legs}>
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
              <BJText>{t('search.addLeg')}</BJText>
            </PressableScale>
          ) : null}
        </Animated.View>
      ) : (
        <Animated.View key="single" entering={SWAP} style={styles.section}>
          <RouteRow
            testID="outbound"
            airports={props.airports}
            origin={draft.outbound.origin}
            destination={draft.outbound.destination}
            roundTrip={roundTrip}
            onPickOrigin={() =>
              props.onPickAirport(LegSlot.Outbound, AirportEnd.Origin)
            }
            onPickDestination={() =>
              props.onPickAirport(LegSlot.Outbound, AirportEnd.Destination)
            }
            onSwap={() => props.onSwap(LegSlot.Outbound)}
            originInvalid={!!outbound(DraftPart.Origin)}
            destinationInvalid={!!outbound(DraftPart.Destination)}
          />
          <RowErrors
            testID="outbound-route-error"
            messages={[
              outbound(DraftPart.Origin),
              outbound(DraftPart.Destination),
            ]}
          />
          <View style={styles.pair}>
            <Animated.View layout={MOVE} style={styles.slot}>
              <DateBox
                testID="outbound-date"
                label={t('search.departure')}
                day={draft.outbound.date}
                time={draft.outbound.time}
                align={Align.Start}
                invalid={!!outbound(DraftPart.Date)}
                onPress={() => props.onPickDate(LegSlot.Outbound)}
              />
            </Animated.View>
            {roundTrip ? (
              <Animated.View
                entering={ARRIVE}
                layout={MOVE}
                style={styles.slot}
              >
                <DateBox
                  testID="return-date"
                  label={t('search.return')}
                  day={draft.returnDate}
                  time={draft.returnTime}
                  align={Align.End}
                  invalid={!!errors[RETURN_DATE_FIELD]}
                  onPress={props.onPickReturnDate}
                />
              </Animated.View>
            ) : null}
          </View>
          <RowErrors
            testID="outbound-date-error"
            messages={[outbound(DraftPart.Date), errors[RETURN_DATE_FIELD]]}
          />
          <GuestsRow
            testID="outbound-passengers"
            count={draft.outbound.passengers}
            invalid={!!outbound(DraftPart.Passengers)}
            onPress={() => props.onPickPassengers(LegSlot.Outbound)}
          />
          <RowErrors
            testID="outbound-passengers-error"
            messages={[outbound(DraftPart.Passengers)]}
          />
        </Animated.View>
      )}

      <Animated.View layout={MOVE}>
        <PressableScale
          testID="find-jet"
          accessibilityRole="button"
          onPress={props.onFind}
          style={[styles.find, { backgroundColor: palette.primaryAction }]}
        >
          <Icon name="search" size={20} color={palette.onPrimaryAction} />
          <BJText tone="onPrimary">{t('search.find')}</BJText>
        </PressableScale>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: AppSpacing.spacing16,
    borderRadius: radius.xl,
    padding: AppSpacing.spacing12,
    gap: AppSpacing.spacing8,
  },
  section: { gap: AppSpacing.spacing8 },
  pair: { flexDirection: 'row', gap: AppSpacing.spacing8 },
  slot: { flex: 1, flexDirection: 'row' },
  legs: { gap: AppSpacing.spacing12 },
  addLeg: {
    height: 44,
    borderRadius: radius.md,
    borderWidth: 1,
    borderStyle: 'dashed',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: AppSpacing.spacing8,
  },
  find: {
    height: 44,
    borderRadius: radius.md,
    flexDirection: 'row',
    gap: AppSpacing.spacing8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: AppSpacing.spacing4,
  },
});
