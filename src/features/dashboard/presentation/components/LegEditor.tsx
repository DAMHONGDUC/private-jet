import { StyleSheet, View } from 'react-native';
import { useT } from '@/core/i18n/i18n';
import { useBlackJetTheme } from '@/core/theme/blackjet';
import { AppSpacing } from '@/core/theme/app-spacing';
import { BJText } from '@/core/ui/BJText';
import { Icon } from '@/core/ui/Icon';
import { PressableScale } from '@/core/ui/PressableScale';
import type { Airport } from '@/features/flights/domain/entities/flight';
import {
  AirportEnd,
  DraftPart,
  draftField,
  type DraftLeg,
} from '../../domain/entities/charter';
import { formatDayTime, passengersLabel } from '../search-labels';
import type {
  BookingCardActions,
  BookingCardErrors,
} from './booking-card-types';
import { FieldButton } from './FieldButton';
import { RouteRow } from './RouteRow';
import { RowErrors } from './RowErrors';

type Props = BookingCardActions & {
  leg: DraftLeg;
  index: number;
  removable: boolean;
  airports: Record<string, Airport | undefined>;
  errors?: BookingCardErrors;
};

/** One multi-city leg: LEG #n, its route, day and party. */
export function LegEditor({
  leg,
  index,
  removable,
  airports,
  errors = {},
  ...actions
}: Props) {
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
          text={
            leg.date
              ? formatDayTime(leg.date, leg.time, t)
              : t('search.departure')
          }
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

const styles = StyleSheet.create({
  leg: { gap: AppSpacing.spacing8 },
  legHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pair: { flexDirection: 'row', gap: AppSpacing.spacing8 },
});
