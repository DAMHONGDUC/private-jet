import { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { useBlackJetTheme } from '@/core/theme/blackjet';
import { spacing } from '@/core/theme/theme';
import { Snackbar } from '@/core/ui/Snackbar';
import { checkDraft, type CharterRequest } from '../../domain/entities/charter';
import type { PopularRoute } from '../../domain/entities/dashboard';
import {
  airportSelected,
  searchSubmitted,
  selectCharterDraft,
  selectSubmittedCharter,
} from '../charter-search-slice';
import { HeroText, HomeAppBar } from '../components/HomeHeader';
import { NewsCarousel } from '../components/NewsCarousel';
import { PopularRoutes } from '../components/PopularRoutes';
import { SearchPanel } from '../components/SearchPanel';
import { SearchSummaryBar } from '../components/SearchSummaryBar';
import { useCollapsibleSearch } from '../use-collapsible-search';

type Props = {
  onOpenMessages?: () => void;
  onOpenNotifications?: () => void;
  /** The form passed its checks and the search is in the store; show its jets. */
  onShowResults?: () => void;
  /** A story in the carousel was tapped. */
  onOpenNews?: (newsId: string) => void;
  /** The first day the calendar allows; tests pin it. */
  today?: Date;
};

/**
 * BlackJet's home: the search form and what to fly next. Searching opens
 * the results on their own screen; the form turns into a floating pill
 * while the suggestions scroll (feature-docs/dashboard §2).
 */
export function DashboardScreen({
  onOpenMessages,
  onOpenNotifications,
  onShowResults,
  onOpenNews,
  today: todayProp,
}: Props) {
  const palette = useBlackJetTheme();
  const insets = useSafeAreaInsets();
  const dispatch = useDispatch();
  const draft = useSelector(selectCharterDraft);
  const submitted = useSelector(selectSubmittedCharter);
  const [today] = useState(() => todayProp ?? new Date());
  const [notice, setNotice] = useState<string | null>(null);
  const hideNotice = useCallback(() => setNotice(null), []);
  const collapsible = useCollapsibleSearch();

  const search = (request: CharterRequest) => {
    if (JSON.stringify(submitted) !== JSON.stringify(request)) {
      dispatch(searchSubmitted(request));
    }
    onShowResults?.();
  };

  /** A suggested route fills the first leg's airports; the rest of the form stays. */
  const pickRoute = (route: PopularRoute) => {
    const target = draft.tripType === 'multiCity' ? 0 : 'outbound';
    dispatch(airportSelected({ target, end: 'origin', code: route.origin }));
    dispatch(
      airportSelected({ target, end: 'destination', code: route.destination }),
    );
    collapsible.expand();
  };

  return (
    <View
      style={[
        styles.screen,
        {
          backgroundColor: palette.secondaryBackground,
          paddingTop: insets.top,
        },
      ]}
    >
      <HomeAppBar
        onOpenMessages={onOpenMessages}
        onOpenNotifications={onOpenNotifications}
      />

      <View style={styles.body}>
        <Animated.ScrollView
          testID="dashboard-scroll"
          ref={collapsible.scrollRef}
          onScroll={collapsible.onScroll}
          scrollEventThrottle={16}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={[
            styles.content,
            { paddingBottom: insets.bottom + TAB_BAR_ROOM },
          ]}
        >
          <HeroText />
          <View
            onLayout={collapsible.onFormLayout}
            pointerEvents={collapsible.collapsed ? 'none' : 'auto'}
          >
            <SearchPanel
              today={today}
              onSearch={search}
              onInvalid={setNotice}
            />
          </View>
          <PopularRoutes onPick={pickRoute} />
          <NewsCarousel onOpenNews={onOpenNews} />
        </Animated.ScrollView>

        <Animated.View
          style={[
            styles.summary,
            { backgroundColor: palette.secondaryBackground },
            collapsible.summaryStyle,
          ]}
          pointerEvents={collapsible.collapsed ? 'box-none' : 'none'}
        >
          <SearchSummaryBar
            request={checkDraft(draft).request ?? null}
            onPress={collapsible.expand}
          />
        </Animated.View>

        <Snackbar
          message={notice}
          onHide={hideNotice}
          bottom={insets.bottom + TAB_BAR_ROOM}
        />
      </View>
    </View>
  );
}

/** Room under the content for the floating tab bar. */
const TAB_BAR_ROOM = 88;

const styles = StyleSheet.create({
  screen: { flex: 1 },
  body: { flex: 1 },
  content: { flexGrow: 1 },
  summary: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
  },
});
