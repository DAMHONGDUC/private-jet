import LottieView from 'lottie-react-native';
import { StyleSheet, View } from 'react-native';
import { useT, type Translate } from '@/core/i18n/i18n';
import { useBlackJetTheme } from '@/core/theme/blackjet';
import { AppSpacing } from '@/core/theme/app-spacing';
import { radius } from '@/core/theme/theme';
import { BJText } from '@/core/ui/BJText';
import { PressableScale } from '@/core/ui/PressableScale';
import { errorMessage } from '@/core/ui/StateViews';
import {
  TripType,
  type CharterRequest,
  type LegQuotes,
} from '../../domain/entities/charter';
import { NO_PLANE_FOUND } from '@/core/ui/images';
import { formatShortDay } from '../search-labels';
import { JetCard } from './JetCard';
import { JetCardSkeleton } from './Skeletons';

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
          <LegGroup
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
    body = <LoadError error={error} onRetry={onRetry} />;
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

type LegGroupProps = {
  group: LegQuotes;
  title: string | null;
  selectedId?: string;
  onOpenQuote?: (quoteId: string) => void;
};

function LegGroup({ group, title, selectedId, onOpenQuote }: LegGroupProps) {
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

function NoListings({ onNewRequest }: { onNewRequest: () => void }) {
  const palette = useBlackJetTheme();
  const t = useT();
  return (
    <View testID="no-listings" style={styles.empty}>
      <LottieView
        testID="no-listings-animation"
        source={NO_PLANE_FOUND[palette.scheme]}
        autoPlay
        loop
        style={styles.lottie}
      />
      <BJText size={20}>{t('results.noJets')}</BJText>
      <BJText tone="secondary" weight="regular" style={styles.centered}>
        {t('results.noJetsMessage')}
      </BJText>
      <PressableScale
        testID="new-flight-request"
        accessibilityRole="button"
        onPress={onNewRequest}
        style={[styles.button, { backgroundColor: palette.primaryAction }]}
      >
        <BJText tone="onPrimary">{t('results.newRequest')}</BJText>
      </PressableScale>
    </View>
  );
}

function LoadError({
  error,
  onRetry,
}: {
  error: unknown;
  onRetry: () => void;
}) {
  const palette = useBlackJetTheme();
  const t = useT();
  return (
    <View testID="jet-results-error" style={styles.empty}>
      <BJText tone="secondary" weight="regular" style={styles.centered}>
        {t('results.loadError', { error: errorMessage(error) })}
      </BJText>
      <PressableScale
        testID="jet-results-retry"
        accessibilityRole="button"
        onPress={onRetry}
        style={[styles.button, styles.outlined, { borderColor: palette.iron }]}
      >
        <BJText size={16}>{t('common.tryAgain')}</BJText>
      </PressableScale>
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
  group: { gap: AppSpacing.md },
  empty: {
    alignItems: 'center',
    gap: AppSpacing.md,
    paddingVertical: AppSpacing.lg,
  },
  lottie: { width: 180, height: 180 },
  centered: { textAlign: 'center' },
  button: {
    height: 52,
    borderRadius: radius.md,
    alignSelf: 'stretch',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: AppSpacing.sm,
  },
  outlined: { borderWidth: 1 },
});
