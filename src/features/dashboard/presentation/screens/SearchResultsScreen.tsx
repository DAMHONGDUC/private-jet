import { skipToken } from '@reduxjs/toolkit/query';
import { useCallback, useEffect, useState } from 'react';
import { RefreshControl, StyleSheet, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { useT } from '@/core/i18n/i18n';
import { useBlackJetTheme } from '@/core/theme/blackjet';
import { AppSpacing } from '@/core/theme/app-spacing';
import { Icon } from '@/core/ui/Icon';
import { PressableScale } from '@/core/ui/PressableScale';
import { Snackbar } from '@/core/ui/Snackbar';
import { errorMessage } from '@/core/error/error-message';
import type { CharterRequest } from '../../domain/entities/charter';
import {
  searchSubmitted,
  selectQuoteSelections,
  selectSubmittedCharter,
} from '../charter-search-slice';
import { HeaderSearchSlot } from '../components/HeaderSearchSlot';
import { JetResults } from '../components/JetResults';
import { SearchPanel } from '../components/SearchPanel';
import { SelectionBar } from '../components/SelectionBar';
import { useSearchChartersQuery } from '../dashboard-api';
import { useCharterSelection } from '../use-charter-selection';
import { useCollapsibleSearch } from '../use-collapsible-search';

type Props = {
  /** Back to the dashboard. */
  onBack: () => void;
  /** A jet card was tapped. */
  onOpenQuote?: (legIndex: number, quoteId: string) => void;
  /** Every leg has a jet; on to checkout. */
  onCheckout?: () => void;
  /** The first day the calendar allows; tests pin it. */
  today?: Date;
};

/**
 * The jets for the search the dashboard ran, one group per leg. The search
 * form sits above them, so it can be changed here, and as the jets scroll
 * it turns into a pill that takes the title's place in the header, beside
 * the back button. Once a jet is chosen a bar
 * at the bottom carries the total to checkout.
 */
export function SearchResultsScreen({
  onBack,
  onOpenQuote,
  onCheckout,
  today: todayProp,
}: Props) {
  const palette = useBlackJetTheme();
  const t = useT();
  const insets = useSafeAreaInsets();
  const dispatch = useDispatch();
  const request = useSelector(selectSubmittedCharter);
  const [today] = useState(() => todayProp ?? new Date());
  const collapsible = useCollapsibleSearch();
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

  /** A changed search replaces the jets; either way the form makes way for them. */
  const search = (next: CharterRequest) => {
    if (JSON.stringify(request) !== JSON.stringify(next)) {
      dispatch(searchSubmitted(next));
    }
    collapsible.collapse();
  };

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
      <View testID="search-results-header" style={styles.header}>
        <PressableScale
          testID="search-results-back"
          accessibilityRole="button"
          accessibilityLabel={t('common.back')}
          onPress={onBack}
          style={[styles.back, { backgroundColor: palette.primaryBackground }]}
        >
          <Icon name="chevronLeft" size={20} color={palette.jetBlack} />
        </PressableScale>
        <HeaderSearchSlot
          progress={collapsible.progress}
          title={t('results.title')}
          request={request}
          onPress={collapsible.expand}
        />
      </View>

      <View style={styles.body}>
        <Animated.ScrollView
          testID="search-results-scroll"
          ref={collapsible.scrollRef}
          onScroll={collapsible.onScroll}
          scrollEventThrottle={16}
          keyboardShouldPersistTaps="handled"
          onLayout={collapsible.onViewportLayout}
          contentContainerStyle={{
            paddingTop: AppSpacing.spacing8,
            paddingBottom:
              insets.bottom + (showBar ? BAR_ROOM : AppSpacing.spacing24),
            minHeight: collapsible.minContentHeight,
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
          <Animated.View
            onLayout={collapsible.onFormLayout}
            style={collapsible.formStyle}
          >
            <SearchPanel today={today} onSearch={search} />
          </Animated.View>
          {request ? (
            <JetResults
              request={request}
              results={results}
              error={error}
              onNewRequest={collapsible.expand}
              onRetry={() => {
                refetch();
              }}
              selections={selections}
              onOpenQuote={onOpenQuote}
            />
          ) : null}
        </Animated.ScrollView>
      </View>

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
        bottom={insets.bottom + (showBar ? BAR_ROOM : AppSpacing.spacing16)}
      />
    </View>
  );
}

/** Room under the list for the selection bar. */
const BAR_ROOM = 112;

const styles = StyleSheet.create({
  body: { flex: 1 },
  screen: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: AppSpacing.spacing8,
    paddingHorizontal: AppSpacing.spacing16,
    paddingTop: AppSpacing.spacing8,
    paddingBottom: AppSpacing.spacing8,
  },
  back: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  barSlot: { position: 'absolute', left: 0, right: 0 },
});
