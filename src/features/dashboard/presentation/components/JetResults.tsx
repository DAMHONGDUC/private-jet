import { StyleSheet, View } from 'react-native';
import { useT, type Translate } from '@/core/i18n/i18n';
import { useBlackJetTheme } from '@/core/theme/blackjet';
import { AppSpacing } from '@/core/theme/app-spacing';
import { radius } from '@/core/theme/theme';
import { BJText } from '@/core/ui/BJText';
import {
  TripType,
  type CharterRequest,
  type LegQuotes,
} from '../../domain/entities/charter';
import { JetCardSkeleton } from './JetCardSkeleton';
import { LegQuoteGroup } from './LegQuoteGroup';
import { NoListings } from './NoListings';
import { ResultsLoadError } from './ResultsLoadError';

const SKELETONS = 3;

type Props = {
  request: CharterRequest;
  /** Quotes for `request`; undefined while they load. */
  results: LegQuotes[] | undefined;
  error: unknown;
  onNewRequest: () => void;
  onRetry: () => void;
  /** The quote chosen per leg. */
  selections?: Record<number, string>;
  onOpenQuote?: (legIndex: number, quoteId: string) => void;
};

const legTitle = (request: CharterRequest, index: number, t: Translate) => {
  if (request.tripType === TripType.RoundTrip) {
    return t(index === 0 ? 'results.outbound' : 'results.return');
  }
  return request.tripType === TripType.MultiCity
    ? t('results.leg', { number: index + 1 })
    : null;
};

/** The jets for a search, one group per leg (feature-docs/dashboard §12.2). */
export function JetResults({
  request,
  results,
  error,
  onNewRequest,
  onRetry,
  selections = {},
  onOpenQuote,
}: Props) {
  const palette = useBlackJetTheme();
  const t = useT();
  const total =
    results?.reduce((sum, group) => sum + group.quotes.length, 0) ?? 0;

  let body;
  if (results) {
    body =
      total === 0 ? (
        <NoListings onNewRequest={onNewRequest} />
      ) : (
        results.map((group, index) => (
          <LegQuoteGroup
            key={`${group.leg.origin}-${group.leg.destination}-${index}`}
            group={group}
            title={legTitle(request, index, t)}
            selectedId={selections[index]}
            onOpenQuote={
              onOpenQuote && (quoteId => onOpenQuote(index, quoteId))
            }
          />
        ))
      );
  } else if (error) {
    body = <ResultsLoadError error={error} onRetry={onRetry} />;
  } else {
    body = Array.from({ length: SKELETONS }, (_, index) => (
      <JetCardSkeleton key={index} />
    ));
  }

  return (
    <View testID="jet-results" style={styles.root}>
      <View style={styles.header}>
        <BJText size={20}>{t('results.availableJets')}</BJText>
        {results ? (
          <View style={[styles.count, { backgroundColor: palette.accentSoft }]}>
            <BJText testID="jet-results-count" size={13}>
              {total}
            </BJText>
          </View>
        ) : null}
      </View>
      {body}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { paddingHorizontal: AppSpacing.lg, gap: AppSpacing.lg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: AppSpacing.sm,
    paddingTop: AppSpacing.lg,
  },
  count: {
    minWidth: 28,
    height: 24,
    borderRadius: radius.pill,
    paddingHorizontal: AppSpacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
