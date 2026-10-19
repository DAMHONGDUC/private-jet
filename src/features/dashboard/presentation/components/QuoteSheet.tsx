import { View } from 'react-native';
import { useT } from '@/core/i18n/i18n';
import { makeStyles } from '@/core/theme/blackjet';
import { AppSpacing } from '@/core/theme/app-spacing';
import { radius } from '@/core/theme/theme';
import { AppText } from '@/core/ui/AppText';
import type { JetQuote, LegQuotes } from '../../domain/entities/charter';
import { CATEGORY_LABELS, formatDay, passengersLabel } from '../search-labels';
import { plannedSchedule } from '@/features/flights/domain/entities/schedule';
import { ScheduleStrip } from '@/features/flights/presentation/ScheduleStrip';
import { useAirportZones } from '@/features/flights/presentation/use-airport-zones';
import { QuoteFacts } from './QuoteFacts';

type Props = {
  quote: JetQuote;
  group: LegQuotes;
  legIndex: number;
  legs: number;
};

/** The rounded sheet under the quote photos: title, facts, cabin and what is included. */
export function QuoteSheet({ quote, group, legIndex, legs }: Props) {
  const styles = useStyles();
  const t = useT();
  const zoneOf = useAirportZones();
  const { leg } = group;
  const schedule = plannedSchedule(leg.date, leg.time, quote.durationMinutes, {
    origin: zoneOf(leg.origin),
    destination: zoneOf(leg.destination),
  });

  return (
    <View style={styles.sheet}>
      <View style={styles.block}>
        <AppText variant="label" muted>
          {t(CATEGORY_LABELS[quote.aircraft.category])}
          {legs > 1 ? ` · Leg ${legIndex + 1} of ${legs}` : ''}
        </AppText>
        <AppText testID="quote-model" variant="display">
          {quote.aircraft.model}
        </AppText>
        <AppText muted>
          {group.leg.origin} → {group.leg.destination} ·{' '}
          {formatDay(group.leg.date, t)} ·{' '}
          {passengersLabel(group.leg.passengers, t)}
        </AppText>
      </View>

      <ScheduleStrip
        testID="quote-schedule"
        schedule={schedule}
        origin={leg.origin}
        destination={leg.destination}
        durationMinutes={quote.durationMinutes}
      />

      <QuoteFacts quote={quote} />

      <View style={styles.block}>
        <AppText variant="subtitle">Cabin</AppText>
        <AppText muted>{quote.specs.cabin}</AppText>
        <View style={styles.chips}>
          {quote.amenities.map(amenity => (
            <View key={amenity} style={styles.chip}>
              <AppText variant="caption">{amenity}</AppText>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.block}>
        <AppText variant="subtitle">Included</AppText>
        <AppText muted>
          Two pilots and cabin crew, fuel, landing and handling fees, catering
          for every passenger and a private terminal on both ends. Free
          cancellation up to 24 hours before departure.
        </AppText>
      </View>
    </View>
  );
}

const useStyles = makeStyles(palette => ({
  sheet: {
    backgroundColor: palette.secondaryBackground,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    padding: AppSpacing.spacing16,
    gap: AppSpacing.spacing24,
    minHeight: 600,
    marginTop: -24,
  },
  block: { gap: AppSpacing.spacing8 },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: AppSpacing.spacing8,
    marginTop: AppSpacing.spacing4,
  },
  chip: {
    paddingHorizontal: AppSpacing.spacing12,
    paddingVertical: AppSpacing.spacing8,
    borderRadius: radius.pill,
    backgroundColor: palette.accentSoft,
  },
}));
