import LottieView from 'lottie-react-native';
import { StyleSheet, View } from 'react-native';
import { useBlackJetTheme } from '@/core/theme/blackjet';
import { radius, spacing } from '@/core/theme/theme';
import { BJText } from '@/core/ui/BJText';
import { PressableScale } from '@/core/ui/PressableScale';
import { errorMessage } from '@/core/ui/StateViews';
import type { CharterRequest, LegQuotes } from '../../domain/entities/charter';
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

const legTitle = (request: CharterRequest, index: number) => {
  if (request.tripType === 'roundTrip') {
    return index === 0 ? 'Outbound' : 'Return';
  }
  return request.tripType === 'multiCity' ? `Leg #${index + 1}` : null;
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
            title={legTitle(request, index)}
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
        <BJText size={20}>Available jets</BJText>
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
  return (
    <View style={styles.group}>
      {title ? (
        <BJText size={13} tone="secondary">
          {title} · {leg.origin} → {leg.destination} ·{' '}
          {formatShortDay(leg.date)}
        </BJText>
      ) : null}
      {quotes.length === 0 ? (
        <BJText tone="secondary" weight="regular">
          No aircraft can fly this leg with {leg.passengers} on board.
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
  return (
    <View testID="no-listings" style={styles.empty}>
      <LottieView
        testID="no-listings-animation"
        source={NO_PLANE_FOUND[palette.scheme]}
        autoPlay
        loop
        style={styles.lottie}
      />
      <BJText size={20}>No jets for this trip yet</BJText>
      <BJText tone="secondary" weight="regular" style={styles.centered}>
        Try another day or airport, and we will find the right aircraft for you.
      </BJText>
      <PressableScale
        testID="new-flight-request"
        accessibilityRole="button"
        onPress={onNewRequest}
        style={[styles.button, { backgroundColor: palette.accent }]}
      >
        <BJText tone="onAccent">New Flight Request</BJText>
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
  return (
    <View testID="jet-results-error" style={styles.empty}>
      <BJText tone="secondary" weight="regular" style={styles.centered}>
        Couldn't load jets. {errorMessage(error)}
      </BJText>
      <PressableScale
        testID="jet-results-retry"
        accessibilityRole="button"
        onPress={onRetry}
        style={[styles.button, styles.outlined, { borderColor: palette.iron }]}
      >
        <BJText size={16}>Try again</BJText>
      </PressableScale>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { paddingHorizontal: spacing.lg, gap: spacing.lg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingTop: spacing.lg,
  },
  count: {
    minWidth: 28,
    height: 24,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  group: { gap: spacing.md },
  empty: { alignItems: 'center', gap: spacing.md, paddingVertical: spacing.lg },
  lottie: { width: 180, height: 180 },
  centered: { textAlign: 'center' },
  button: {
    height: 52,
    borderRadius: radius.md,
    alignSelf: 'stretch',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.sm,
  },
  outlined: { borderWidth: 1 },
});
