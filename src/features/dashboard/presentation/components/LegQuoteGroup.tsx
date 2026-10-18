import { StyleSheet, View } from 'react-native';
import { useT } from '@/core/i18n/i18n';
import { AppSpacing } from '@/core/theme/app-spacing';
import { BJText } from '@/core/ui/BJText';
import type { LegQuotes } from '../../domain/entities/charter';
import { formatShortDay } from '../search-labels';
import { JetCard } from './JetCard';

type Props = {
  group: LegQuotes;
  title: string | null;
  selectedId?: string;
  onOpenQuote?: (quoteId: string) => void;
};

/** One leg's jets in the results, under its title when the trip has several legs. */
export function LegQuoteGroup({
  group,
  title,
  selectedId,
  onOpenQuote,
}: Props) {
  const { leg, quotes } = group;
  const t = useT();
  return (
    <View style={styles.group}>
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
        quotes.map(quote => (
          <JetCard
            key={quote.id}
            quote={quote}
            selected={quote.id === selectedId}
            onPress={onOpenQuote && (() => onOpenQuote(quote.id))}
          />
        ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  group: { gap: AppSpacing.spacing12 },
});
