import { StyleSheet, View } from 'react-native';
import { useT } from '@/core/i18n/i18n';
import { useBlackJetTheme } from '@/core/theme/blackjet';
import { AppSpacing } from '@/core/theme/app-spacing';
import { elevation, radius } from '@/core/theme/theme';
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
import { formatDayTime, passengersLabel } from '../search-labels';
import type {
  BookingCardActions,
  BookingCardErrors,
} from './booking-card-types';
import { FieldButton } from './FieldButton';
import { LegEditor } from './LegEditor';
import { RouteRow } from './RouteRow';
import { RowErrors } from './RowErrors';
import { TripTypeRadio } from './TripTypeRadio';

type Props = BookingCardActions & {
  draft: CharterDraft;
  airports: Record<string, Airport | undefined>;
  errors?: BookingCardErrors;
};

/** The search form (feature-docs/dashboard §2.3); fields change in place, without animation. */
export function BookingCard(props: Props) {
  const palette = useBlackJetTheme();
  const t = useT();
  const { draft, errors = {} } = props;
  const roundTrip = draft.tripType === TripType.RoundTrip;
  const outbound = (part: DraftPart) =>
    errors[draftField(LegSlot.Outbound, part)];

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

      {draft.tripType === TripType.MultiCity ? (
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
              <BJText>{t('search.addLeg')}</BJText>
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
            <FieldButton
              testID="outbound-date"
              icon="calendar"
              iconSize={17}
              text={
                draft.outbound.date
                  ? formatDayTime(draft.outbound.date, draft.outbound.time, t)
                  : t('search.departure')
              }
              filled={!!draft.outbound.date}
              invalid={!!outbound(DraftPart.Date)}
              onPress={() => props.onPickDate(LegSlot.Outbound)}
            />
            {roundTrip ? (
              <View style={styles.flex}>
                <FieldButton
                  testID="return-date"
                  icon="calendar"
                  iconSize={17}
                  text={
                    draft.returnDate
                      ? formatDayTime(draft.returnDate, draft.returnTime, t)
                      : t('search.return')
                  }
                  filled={!!draft.returnDate}
                  invalid={!!errors[RETURN_DATE_FIELD]}
                  onPress={props.onPickReturnDate}
                />
              </View>
            ) : null}
          </View>
          <RowErrors
            testID="outbound-date-error"
            messages={[outbound(DraftPart.Date), errors[RETURN_DATE_FIELD]]}
          />
          <FieldButton
            testID="outbound-passengers"
            icon="family"
            iconSize={20}
            text={
              draft.outbound.passengers > 0
                ? passengersLabel(draft.outbound.passengers, t)
                : t('search.passengers')
            }
            filled={draft.outbound.passengers > 0}
            invalid={!!outbound(DraftPart.Passengers)}
            onPress={() => props.onPickPassengers(LegSlot.Outbound)}
          />
          <RowErrors
            testID="outbound-passengers-error"
            messages={[outbound(DraftPart.Passengers)]}
          />
        </View>
      )}

      <PressableScale
        testID="find-jet"
        accessibilityRole="button"
        onPress={props.onFind}
        style={[styles.find, { backgroundColor: palette.primaryAction }]}
      >
        <Icon name="search" size={20} color={palette.onPrimaryAction} />
        <BJText tone="onPrimary">{t('search.find')}</BJText>
      </PressableScale>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: AppSpacing.lg,
    borderRadius: radius.xl,
    padding: AppSpacing.lg,
    gap: AppSpacing.md,
  },
  section: { gap: AppSpacing.sm },
  pair: { flexDirection: 'row', gap: AppSpacing.sm },
  flex: { flex: 1 },
  legs: { gap: AppSpacing.lg },
  addLeg: {
    height: 52,
    borderRadius: radius.md,
    borderWidth: 1,
    borderStyle: 'dashed',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: AppSpacing.sm,
  },
  find: {
    height: 52,
    borderRadius: radius.md,
    flexDirection: 'row',
    gap: AppSpacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: AppSpacing.xs,
  },
});
