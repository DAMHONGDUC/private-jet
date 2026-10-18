import { Image, ScrollView, StyleSheet, View } from 'react-native';
import { useT } from '@/core/i18n/i18n';
import { AppSpacing } from '@/core/theme/app-spacing';
import { AppText } from '@/core/ui/AppText';
import { Card } from '@/core/ui/Card';
import { Chip } from '@/core/ui/Chip';
import { imageFor } from '@/core/ui/images';
import { formatDuration, formatMoney } from '@/core/utils/format';
import type { JetQuote, LegQuotes } from '../../domain/entities/charter';
import { formatDay } from '../search-labels';

/** Departure times offered per leg, local to the departure airport. */
export const DEPARTURE_TIMES = [
  '07:00',
  '09:00',
  '11:00',
  '14:00',
  '17:00',
  '20:00',
] as const;

/** The fixed times, plus the one asked for in the search when it is not among them. */
const timeOptions = (searched?: string): string[] =>
  searched && !(DEPARTURE_TIMES as readonly string[]).includes(searched)
    ? [...DEPARTURE_TIMES, searched].sort()
    : [...DEPARTURE_TIMES];

type Props = {
  group: LegQuotes;
  quote: JetQuote;
  index: number;
  legCount: number;
  time: string;
  onTimeChange: (time: string) => void;
};

/** One chosen leg at checkout: the jet, its price and a departure time to pick. */
export function CheckoutLegCard({
  group,
  quote,
  index,
  legCount,
  time,
  onTimeChange,
}: Props) {
  const t = useT();
  return (
    <Card style={styles.leg}>
      <View style={styles.legHead}>
        <Image source={imageFor(quote.photos[0])} style={styles.thumb} />
        <View style={styles.flex}>
          <AppText variant="label" muted>
            {legCount > 1 ? `Leg ${index + 1} · ` : ''}
            {formatDay(group.leg.date, t)}
          </AppText>
          <AppText variant="subtitle">
            {group.leg.origin} → {group.leg.destination}
          </AppText>
          <AppText variant="caption" muted>
            {quote.aircraft.model} · {formatDuration(quote.durationMinutes)}
          </AppText>
        </View>
        <AppText variant="subtitle">
          {formatMoney(quote.price, quote.currency)}
        </AppText>
      </View>
      <AppText variant="caption" muted>
        Departure time
      </AppText>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.times}
      >
        {timeOptions(group.leg.time).map(option => (
          <Chip
            key={option}
            testID={`leg-${index}-time-${option}`}
            label={option}
            selected={time === option}
            onPress={() => onTimeChange(option)}
          />
        ))}
      </ScrollView>
    </Card>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  leg: { gap: AppSpacing.spacing8 },
  legHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: AppSpacing.spacing12,
  },
  thumb: { width: 56, height: 56, borderRadius: 12 },
  times: { gap: AppSpacing.spacing8 },
});
