import LottieView from 'lottie-react-native';
import { StyleSheet, View } from 'react-native';
import { useBlackJetTheme } from '@/core/theme/blackjet';
import { BJText } from '@/core/ui/BJText';
import { PressableScale } from '@/core/ui/PressableScale';
import { errorMessage } from '@/core/ui/StateViews';
import type { CharterRequest, LegQuotes } from '../../domain/entities/charter';
import { NO_PLANE_FOUND } from '../images';
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
};

const legTitle = (request: CharterRequest, index: number) => {
  if (request.tripType === 'roundTrip') {
    return index === 0 ? 'Outbound' : 'Return';
  }
  return request.tripType === 'multiCity' ? `Leg #${index + 1}` : null;
};

/** "Available Jets" under the search, with one group per leg (feature-docs/dashboard §12.2). */
export function JetResults({ request, results, error, onNewRequest, onRetry }: Props) {
  const total = results?.reduce((sum, group) => sum + group.quotes.length, 0) ?? 0;

  let body;
  if (results) {
    body =
      total === 0 ? (
        <NoListings onNewRequest={onNewRequest} />
      ) : (
        results.map((group, index) => (
          <LegGroup key={`${group.leg.origin}-${group.leg.destination}-${index}`} group={group} title={legTitle(request, index)} />
        ))
      );
  } else if (error) {
    body = <LoadError error={error} onRetry={onRetry} />;
  } else {
    body = Array.from({ length: SKELETONS }, (_, index) => <JetCardSkeleton key={index} />);
  }

  return (
    <View testID="jet-results" style={styles.root}>
      <View style={styles.header}>
        <BJText size={18}>Available Jets</BJText>
        {results ? (
          <BJText testID="jet-results-count" tone="secondary">
            {total}
          </BJText>
        ) : null}
      </View>
      {body}
    </View>
  );
}

function LegGroup({ group, title }: { group: LegQuotes; title: string | null }) {
  const { leg, quotes } = group;
  return (
    <View style={styles.group}>
      {title ? (
        <BJText tone="secondary">
          {title} · {leg.origin} → {leg.destination} · {formatShortDay(leg.date)}
        </BJText>
      ) : null}
      {quotes.length === 0 ? (
        <BJText tone="secondary" weight="regular">
          No aircraft can fly this leg with {leg.passengers} on board.
        </BJText>
      ) : (
        quotes.map((quote, index) => <JetCard key={quote.id} quote={quote} index={index} />)
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
      <BJText size={18}>No Listings Available</BJText>
      <BJText tone="secondary" weight="regular" style={styles.centered}>
        Sorry, no aircraft listings are available now. Submit a new flight request to find the right aircraft and
        start the process!
      </BJText>
      <PressableScale
        testID="new-flight-request"
        accessibilityRole="button"
        onPress={onNewRequest}
        style={[styles.button, { backgroundColor: palette.jetBlack }]}
      >
        <BJText size={16} tone="inverse">
          New Flight Request
        </BJText>
      </PressableScale>
    </View>
  );
}

function LoadError({ error, onRetry }: { error: unknown; onRetry: () => void }) {
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
  root: { paddingHorizontal: 12, gap: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', paddingTop: 16 },
  group: { gap: 16 },
  empty: { alignItems: 'center', gap: 12, paddingVertical: 16 },
  lottie: { width: 200, height: 200 },
  centered: { textAlign: 'center' },
  button: { height: 50, borderRadius: 12, alignSelf: 'stretch', alignItems: 'center', justifyContent: 'center' },
  outlined: { borderWidth: 1 },
});
