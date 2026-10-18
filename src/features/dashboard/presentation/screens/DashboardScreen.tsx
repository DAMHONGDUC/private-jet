import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { AppSpacing } from '@/core/theme/app-spacing';
import { useBlackJetTheme } from '@/core/theme/blackjet';
import {
  AirportEnd,
  LegSlot,
  TripType,
  checkDraft,
  type CharterRequest,
} from '../../domain/entities/charter';
import type { PopularRoute } from '../../domain/entities/dashboard';
import {
  airportSelected,
  searchSubmitted,
  selectCharterDraft,
  selectSubmittedCharter,
} from '../charter-search-slice';
import { CollapsedSearchPill } from '../components/CollapsedSearchPill';
import { HeroText } from '../components/HeroText';
import { HomeAppBar } from '../components/HomeAppBar';
import { NewsCarousel } from '../components/NewsCarousel';
import { PopularRoutes } from '../components/PopularRoutes';
import { SearchPanel } from '../components/SearchPanel';
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
 * Sovereign's home: the search form and what to fly next. Searching opens
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
  const collapsible = useCollapsibleSearch();

  const search = (request: CharterRequest) => {
    if (JSON.stringify(submitted) !== JSON.stringify(request)) {
      dispatch(searchSubmitted(request));
    }
    onShowResults?.();
  };

  /** A suggested route fills the first leg's airports; the rest of the form stays. */
  const pickRoute = (route: PopularRoute) => {
    const target = draft.tripType === TripType.MultiCity ? 0 : LegSlot.Outbound;
    dispatch(
      airportSelected({ target, end: AirportEnd.Origin, code: route.origin }),
    );
    dispatch(
      airportSelected({
        target,
        end: AirportEnd.Destination,
        code: route.destination,
      }),
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
          onLayout={collapsible.onViewportLayout}
          contentContainerStyle={[
            styles.content,
            {
              paddingBottom: AppSpacing.tabContentInset(insets.bottom),
              minHeight: collapsible.minContentHeight,
            },
          ]}
        >
          <HeroText />
          <Animated.View
            onLayout={collapsible.onFormLayout}
            style={collapsible.formStyle}
          >
            <SearchPanel today={today} onSearch={search} />
          </Animated.View>
          <PopularRoutes onPick={pickRoute} />
          <NewsCarousel onOpenNews={onOpenNews} />
        </Animated.ScrollView>

        <CollapsedSearchPill
          progress={collapsible.progress}
          request={checkDraft(draft).request ?? null}
          onPress={collapsible.expand}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  body: { flex: 1 },
  content: { flexGrow: 1 },
});
