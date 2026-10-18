import { skipToken } from '@reduxjs/toolkit/query';
import { useCallback, useEffect, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import { useBlackJetTheme } from '@/core/theme/blackjet';
import { spacing } from '@/core/theme/theme';
import { Icon } from '@/core/ui/Icon';
import { PressableScale } from '@/core/ui/PressableScale';
import { Snackbar } from '@/core/ui/Snackbar';
import { errorMessage } from '@/core/ui/StateViews';
import {
  selectQuoteSelections,
  selectSubmittedCharter,
} from '../charter-search-slice';
import { JetResults } from '../components/JetResults';
import { SearchSummaryBar } from '../components/SearchSummaryBar';
import { SelectionBar } from '../components/SelectionBar';
import { useSearchChartersQuery } from '../dashboard-api';
import { useCharterSelection } from '../use-charter-selection';

type Props = {
  /** Back to the dashboard, where the form can be changed. */
  onBack: () => void;
  /** A jet card was tapped. */
  onOpenQuote?: (legIndex: number, quoteId: string) => void;
  /** Every leg has a jet; on to checkout. */
  onCheckout?: () => void;
};

/**
 * The jets for the search the dashboard ran, one group per leg. The pill
 * on top sums the search up and goes back to edit it; once a jet is chosen
 * a bar at the bottom carries the total to checkout.
 */
export function SearchResultsScreen({
  onBack,
  onOpenQuote,
  onCheckout,
}: Props) {
  const palette = useBlackJetTheme();
  const insets = useSafeAreaInsets();
  const request = useSelector(selectSubmittedCharter);
  const selections = useSelector(selectQuoteSelections);
  const selection = useCharterSelection();
  const [notice, setNotice] = useState<string | null>(null);
  const hideNotice = useCallback(() => setNotice(null), []);
  const showBar = selection.chosenCount > 0 && !!selection.results;

  const {
    currentData: results,
    error,
    isFetching,
    refetch,
  } = useSearchChartersQuery(request ?? skipToken);

  useEffect(() => {
    if (error) {
      setNotice(errorMessage(error));
    }
  }, [error]);

  return (
    <View
      testID="search-results-screen"
      style={[
        styles.screen,
        {
          backgroundColor: palette.secondaryBackground,
          paddingTop: insets.top,
        },
      ]}
    >
      <View style={styles.header}>
        <PressableScale
          testID="search-results-back"
          accessibilityRole="button"
          accessibilityLabel="Back"
          onPress={onBack}
          style={[styles.back, { backgroundColor: palette.primaryBackground }]}
        >
          <Icon name="chevronLeft" size={20} color={palette.jetBlack} />
        </PressableScale>
        <View style={styles.flex}>
          <SearchSummaryBar request={request} onPress={onBack} />
        </View>
      </View>

      <ScrollView
        testID="search-results-scroll"
        contentContainerStyle={{
          paddingBottom: insets.bottom + (showBar ? BAR_ROOM : spacing.xl),
        }}
        refreshControl={
          <RefreshControl
            refreshing={isFetching && results !== undefined}
            onRefresh={() => {
              refetch();
            }}
            tintColor={palette.accent}
          />
        }
      >
        {request ? (
          <JetResults
            request={request}
            results={results}
            error={error}
            onNewRequest={onBack}
            onRetry={() => {
              refetch();
            }}
            selections={selections}
            onOpenQuote={onOpenQuote}
          />
        ) : null}
      </ScrollView>

      {showBar && selection.results ? (
        <View style={[styles.barSlot, { bottom: insets.bottom }]}>
          <SelectionBar
            chosen={selection.chosenCount}
            legs={selection.results.length}
            total={selection.total}
            currency={selection.currency}
            complete={selection.complete}
            onContinue={() => onCheckout?.()}
          />
        </View>
      ) : null}

      <Snackbar
        message={notice}
        onHide={hideNotice}
        bottom={insets.bottom + (showBar ? BAR_ROOM : spacing.lg)}
      />
    </View>
  );
}

/** Room under the list for the selection bar. */
const BAR_ROOM = 112;

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
  },
  back: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flex: { flex: 1 },
  barSlot: { position: 'absolute', left: 0, right: 0 },
});
