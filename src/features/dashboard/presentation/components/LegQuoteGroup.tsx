import {
  ActivityIndicator,
  StyleSheet,
  View,
  type LayoutChangeEvent,
} from 'react-native';
import { useBlackJetTheme } from '@/core/theme/blackjet';
import { useT } from '@/core/i18n/i18n';
import { AppSpacing } from '@/core/theme/app-spacing';
import { BJText } from '@/core/ui/BJText';
import type { LegQuotes } from '../../domain/entities/charter';
import { formatShortDay } from '../search-labels';
import { plannedSchedule } from '@/features/flights/domain/entities/schedule';
import { useAirportZones } from '@/features/flights/presentation/use-airport-zones';
import { JetCard } from './JetCard';

type Props = {
  group: LegQuotes;
  title: string | null;
  selectedId?: string;
  onOpenQuote?: (quoteId: string) => void;
  /** How many jets to show; all of them when absent. The rest wait behind a spinner. */
  limit?: number;
  /** Where the group sits in its parent, to know when its end scrolls near. */
  onLayout?: (event: LayoutChangeEvent) => void;
  testID?: string;
};

/** One leg's jets in the results, under its title when the trip has several legs. */
export function LegQuoteGroup({
  group,
  title,
  selectedId,
  onOpenQuote,
  limit,
  onLayout,
  testID,
}: Props) {
  const palette = useBlackJetTheme();
  const { leg, quotes } = group;
  const t = useT();
  const zoneOf = useAirportZones();
  const zones = {
    origin: zoneOf(leg.origin),
    destination: zoneOf(leg.destination),
  };
  const shown = limit === undefined ? quotes : quotes.slice(0, limit);
  const hidden = quotes.length - shown.length;
  return (
    <View testID={testID} style={styles.group} onLayout={onLayout}>
      {title ? (
        <BJText size={13} tone="secondary">
          {title} · {leg.origin} → {leg.destination} ·{' '}
          {formatShortDay(leg.date, t)}
        </BJText>
      ) : null}
      {quotes.length === 0 ? (
        <BJText tone="secondary" weight="regular">
          {t('results.noAircraft', { count: leg.passengers })}
        </BJText>
      ) : (
        shown.map(quote => (
          <JetCard
            key={quote.id}
            quote={quote}
            schedule={plannedSchedule(
              leg.date,
              leg.time,
              quote.durationMinutes,
              zones,
            )}
            selected={quote.id === selectedId}
            onPress={onOpenQuote && (() => onOpenQuote(quote.id))}
          />
        ))
      )}
      {hidden > 0 ? (
        <ActivityIndicator
          testID="jet-results-loading"
          color={palette.accent}
          style={styles.spinner}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  group: { gap: AppSpacing.spacing12 },
  spinner: { height: 52 },
});
