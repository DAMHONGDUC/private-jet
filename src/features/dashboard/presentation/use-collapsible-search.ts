import { useState } from 'react';
import type { LayoutChangeEvent } from 'react-native';
import Animated, {
  Easing,
  Extrapolation,
  interpolate,
  scrollTo,
  useAnimatedReaction,
  useAnimatedRef,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { scheduleOnUI } from 'react-native-worklets';
import {
  FADE_BAND,
  PILL_DURATION,
  collapseAt,
  nextCollapsed,
} from './collapsible-search-motion';

const PILL_EASING = Easing.out(Easing.cubic);

/**
 * Swaps a screen's search form for a pill pinned under the app bar as it
 * scrolls away, the way Flutter's `SliverAppBar(pinned: true)` keeps a
 * collapsed bar in place over a tall header.
 *
 * The form stays in the scroll content, so it moves with the page and fades
 * as it leaves. Once it has nearly left the screen the pill eases in at the
 * top of the content area, right under the app bar, on its own clock rather
 * than with the finger, so it never stops half drawn; it stays there for as
 * long as the form is away, whichever way the page scrolls. The page itself
 * is never moved by scrolling: a scroll stays where it stops, and only a tap
 * on the pill goes back to the form. Everything runs on the UI thread: the
 * screen does not re-render while it scrolls.
 *
 * A short page could not scroll the form away, leaving it stuck half faded
 * with no pill; `minContentHeight` makes the content tall enough to.
 */
export function useCollapsibleSearch() {
  const scrollRef = useAnimatedRef<Animated.ScrollView>();
  const y = useSharedValue(0);
  const form = useSharedValue({ top: 0, bottom: 0 });
  const collapsed = useSharedValue(false);
  /** 0 with the form in view, 1 with the pill in place. */
  const progress = useSharedValue(0);
  const [formBottom, setFormBottom] = useState(0);
  const [viewport, setViewport] = useState(0);

  const onScroll = useAnimatedScrollHandler({
    onScroll: event => {
      y.value = event.contentOffset.y;
      collapsed.value = nextCollapsed(y.value, form.value, collapsed.value);
    },
  });

  useAnimatedReaction(
    () => collapsed.value,
    (now, before) => {
      if (now !== before) {
        progress.value = withTiming(now ? 1 : 0, {
          duration: PILL_DURATION,
          easing: PILL_EASING,
        });
      }
    },
  );

  /** The form dims as it slides under the pill. */
  const formStyle = useAnimatedStyle(() => {
    const at = collapseAt(form.value);
    return {
      opacity: interpolate(
        y.value,
        [at - FADE_BAND, at],
        [1, 0.3],
        Extrapolation.CLAMP,
      ),
    };
  });

  return {
    scrollRef,
    onScroll,
    progress,
    /** How far the page has scrolled, on the UI thread. */
    scrollY: y,
    /** The scroll view's own height, once laid out. */
    viewportHeight: viewport,
    formStyle,
    /** For the scroll content: enough to scroll the form out of sight. */
    minContentHeight: viewport > 0 ? formBottom + viewport : undefined,
    /** The scroll view's own size. */
    onViewportLayout: (event: LayoutChangeEvent) =>
      setViewport(event.nativeEvent.layout.height),
    /** Where the form sits in the scroll content. */
    onFormLayout: (event: LayoutChangeEvent) => {
      const { y: top, height } = event.nativeEvent.layout;
      form.value = { top, bottom: top + height };
      setFormBottom(top + height);
    },
    /** Scrolls back to the top, which shows the whole form. */
    expand: () =>
      scheduleOnUI(() => {
        'worklet';
        scrollTo(scrollRef, 0, 0, true);
      }),
    /** Scrolls the form just out of sight, so what is under it shows. */
    collapse: () =>
      scheduleOnUI(() => {
        'worklet';
        scrollTo(scrollRef, 0, form.value.bottom, true);
      }),
  };
}
