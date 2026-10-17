import { skipToken } from '@reduxjs/toolkit/query';
import { useCallback, useEffect, useState } from 'react';
import { RefreshControl, StyleSheet, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { useBlackJetTheme } from '@/core/theme/blackjet';
import { Snackbar } from '@/core/ui/Snackbar';
import { errorMessage } from '@/core/ui/StateViews';
import { checkDraft, type CharterRequest } from '../../domain/entities/charter';
import { searchSubmitted, selectCharterDraft, selectSubmittedCharter } from '../charter-search-slice';
import { HeroText, HomeAppBar } from '../components/HomeHeader';
import { JetResults } from '../components/JetResults';
import { NewsCarousel } from '../components/NewsCarousel';
import { SearchPanel } from '../components/SearchPanel';
import { SearchSummaryBar } from '../components/SearchSummaryBar';
import { useSearchChartersQuery } from '../dashboard-api';
import { useCollapsibleSearch } from '../use-collapsible-search';

type Props = {
  onOpenMessages?: () => void;
  onOpenNotifications?: () => void;
  /** The first day the calendar allows; tests pin it. */
  today?: Date;
};

const sameRequest = (a: CharterRequest | null, b: CharterRequest) => JSON.stringify(a) === JSON.stringify(b);

/**
 * BlackJet's home: plan a charter and see the jets right below the form,
 * which collapses into a summary bar as the results scroll up
 * (feature-docs/dashboard §2 and §12).
 */
export function DashboardScreen({ onOpenMessages, onOpenNotifications, today: todayProp }: Props) {
  const palette = useBlackJetTheme();
  const insets = useSafeAreaInsets();
  const dispatch = useDispatch();
  const submitted = useSelector(selectSubmittedCharter);
  const draft = useSelector(selectCharterDraft);
  const [today] = useState(() => todayProp ?? new Date());
  const [notice, setNotice] = useState<string | null>(null);
  const hideNotice = useCallback(() => setNotice(null), []);
  const collapsible = useCollapsibleSearch();

  const { currentData: results, error, isFetching, refetch } = useSearchChartersQuery(submitted ?? skipToken);

  useEffect(() => {
    if (error) {
      setNotice(errorMessage(error));
    }
  }, [error]);

  const search = (request: CharterRequest) => {
    if (sameRequest(submitted, request)) {
      refetch();
    } else {
      dispatch(searchSubmitted(request));
    }
    collapsible.collapse();
  };

  return (
    <View style={[styles.screen, { backgroundColor: palette.secondaryBackground, paddingTop: insets.top }]}>
      <HomeAppBar onOpenMessages={onOpenMessages} onOpenNotifications={onOpenNotifications} />

      <View style={styles.body} onLayout={collapsible.onViewportLayout}>
        <Animated.ScrollView
          testID="dashboard-scroll"
          ref={collapsible.scrollRef}
          onScroll={collapsible.onScroll}
          scrollEventThrottle={16}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={[styles.content, { minHeight: collapsible.minContentHeight }]}
          refreshControl={
            submitted ? (
              <RefreshControl
                refreshing={isFetching && results !== undefined}
                onRefresh={() => {
                  refetch();
                }}
                tintColor={palette.jetBlack}
              />
            ) : undefined
          }
        >
          <Animated.View style={collapsible.heroStyle} onLayout={collapsible.onHeroLayout}>
            <HeroText />
          </Animated.View>

          <Animated.View
            style={collapsible.panelStyle}
            pointerEvents={collapsible.collapsed ? 'none' : 'auto'}
            onLayout={collapsible.onPanelLayout}
          >
            <SearchPanel
              today={today}
              finding={isFetching && submitted !== null}
              onSearch={search}
              onInvalid={setNotice}
            />
          </Animated.View>

          {submitted ? (
            <JetResults
              request={submitted}
              results={results}
              error={error}
              onNewRequest={collapsible.expand}
              onRetry={() => {
                refetch();
              }}
            />
          ) : (
            <NewsCarousel />
          )}
        </Animated.ScrollView>

        <Animated.View
          style={[styles.summary, collapsible.summaryStyle]}
          pointerEvents={collapsible.collapsed ? 'auto' : 'none'}
        >
          <SearchSummaryBar request={submitted ?? checkDraft(draft).request ?? null} onPress={collapsible.expand} />
        </Animated.View>

        <Snackbar message={notice} onHide={hideNotice} bottom={16} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  body: { flex: 1 },
  content: { paddingBottom: 32 },
  summary: { position: 'absolute', top: 0, left: 0, right: 0 },
});
