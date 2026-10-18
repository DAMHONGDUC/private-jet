import { StyleSheet, View } from 'react-native';
import { useT } from '@/core/i18n/i18n';
import { useBlackJetTheme } from '@/core/theme/blackjet';
import { AppSpacing } from '@/core/theme/app-spacing';
import { elevation, radius } from '@/core/theme/theme';
import { BJText } from '@/core/ui/BJText';
import { FieldError } from '@/core/ui/FieldError';
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
  type DraftField,
  type DraftLeg,
  type LegTarget,
} from '../../domain/entities/charter';
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

/** Each field's problem, worded, keyed like `outbound.origin`; printed under the field's row. */
export type BookingCardErrors = Partial<Record<DraftField, string>>;

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
                  ? formatDay(draft.outbound.date, t)
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
                      ? formatDay(draft.returnDate, t)
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

type LegProps = BookingCardActions & {
  leg: DraftLeg;
  index: number;
  removable: boolean;
  airports: Record<string, Airport | undefined>;
  errors?: BookingCardErrors;
};

/** One multi-city leg: LEG #n, its route, day and party. */
function LegEditor({
  leg,
  index,
  removable,
  airports,
  errors = {},
  ...actions
}: LegProps) {
  const palette = useBlackJetTheme();
  const t = useT();
  const at = (part: DraftPart) => errors[draftField(index, part)];
  return (
    <View testID={`leg-${index}`} style={styles.leg}>
      <View style={styles.legHeader}>
        <BJText size={13} tone="secondary">
          {t('search.legLabel', { number: index + 1 })}
        </BJText>
        {removable ? (
          <PressableScale
            testID={`leg-${index}-remove`}
            accessibilityRole="button"
            accessibilityLabel={t('search.removeLeg', { number: index + 1 })}
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
        onPickOrigin={() => actions.onPickAirport(index, AirportEnd.Origin)}
        onPickDestination={() =>
          actions.onPickAirport(index, AirportEnd.Destination)
        }
        onSwap={() => actions.onSwap(index)}
        originInvalid={!!at(DraftPart.Origin)}
        destinationInvalid={!!at(DraftPart.Destination)}
      />
      <RowErrors
        testID={`leg-${index}-route-error`}
        messages={[at(DraftPart.Origin), at(DraftPart.Destination)]}
      />
      <View style={styles.pair}>
        <FieldButton
          testID={`leg-${index}-date`}
          icon="calendar"
          iconSize={17}
          text={leg.date ? formatDay(leg.date, t) : t('search.departure')}
          filled={!!leg.date}
          invalid={!!at(DraftPart.Date)}
          onPress={() => actions.onPickDate(index)}
        />
        <FieldButton
          testID={`leg-${index}-passengers`}
          icon="family"
          iconSize={20}
          text={
            leg.passengers > 0
              ? passengersLabel(leg.passengers, t)
              : t('search.passengers')
          }
          filled={leg.passengers > 0}
          invalid={!!at(DraftPart.Passengers)}
          onPress={() => actions.onPickPassengers(index)}
        />
      </View>
      <RowErrors
        testID={`leg-${index}-date-error`}
        messages={[at(DraftPart.Date), at(DraftPart.Passengers)]}
      />
    </View>
  );
}

/** The problems of one row of fields, one line each, right under the row. */
function RowErrors({
  messages,
  testID,
}: {
  messages: (string | undefined)[];
  testID: string;
}) {
  const shown = messages.filter((message): message is string => !!message);
  if (shown.length === 0) {
    return null;
  }
  return (
    <View testID={testID} style={styles.rowErrors}>
      {shown.map(message => (
        <FieldError key={message} message={message} />
      ))}
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
  rowErrors: { gap: 2, marginTop: -AppSpacing.xs },
  flex: { flex: 1 },
  legs: { gap: AppSpacing.lg },
  leg: { gap: AppSpacing.sm },
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
