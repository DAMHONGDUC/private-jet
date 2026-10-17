import { useState } from 'react';
import type { LayoutChangeEvent } from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  scrollTo,
  useAnimatedReaction,
  useAnimatedRef,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import { scheduleOnRN, scheduleOnUI } from 'react-native-worklets';

/** Height of the summary bar the search panel collapses into. */
export const COLLAPSED_HEIGHT = 56;

/**
 * Collapses the search panel as the dashboard scrolls (feature-docs/dashboard §12.4).
 *
 * The hero and the panel stay in the scroll content, so a drag anywhere,
 * the panel included, scrolls the page. Scrolling past the hero fades the
 * form out while the summary bar, pinned above the list, fades in; the
 * panel's last 56 pt sit exactly under the bar when it is fully collapsed.
 * Letting go half way snaps to the nearer end.
 */
export function useCollapsibleSearch() {
  const scrollRef = useAnimatedRef<Animated.ScrollView>();
  const y = useSharedValue(0);
  const heroHeight = useSharedValue(0);
  const panelHeight = useSharedValue(0);
  const [collapsed, setCollapsed] = useState(false);
  // Mirrored in state for the content's minimum height.
  const [sizes, setSizes] = useState({ viewport: 0, hero: 0, panel: 0 });

  const start = () => {
    'worklet';
    return heroHeight.value;
  };
  const end = () => {
    'worklet';
    return heroHeight.value + Math.max(panelHeight.value - COLLAPSED_HEIGHT, 1);
  };
  const progress = () => {
    'worklet';
    return interpolate(y.value, [start(), end()], [0, 1], Extrapolation.CLAMP);
  };

  const snap = () => {
    'worklet';
    if (y.value > start() + 1 && y.value < end() - 1) {
      scrollTo(scrollRef, 0, progress() < 0.5 ? start() : end(), true);
    }
  };

  const onScroll = useAnimatedScrollHandler({
    onScroll: event => {
      y.value = event.contentOffset.y;
    },
    onEndDrag: event => {
      if ((event.velocity?.y ?? 0) === 0) {
        snap();
      }
    },
    onMomentumEnd: () => snap(),
  });

  useAnimatedReaction(
    () => progress() > 0.5,
    (now, before) => {
      if (now !== before) {
        scheduleOnRN(setCollapsed, now);
      }
    },
  );

  const heroStyle = useAnimatedStyle(() => ({
    opacity: interpolate(y.value, [0, Math.max(heroHeight.value, 1)], [1, 0], Extrapolation.CLAMP),
  }));
  const panelStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress(), [0, 0.6], [1, 0], Extrapolation.CLAMP),
  }));
  const summaryStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress(), [0.5, 1], [0, 1], Extrapolation.CLAMP),
    transform: [{ translateY: interpolate(progress(), [0.5, 1], [8, 0], Extrapolation.CLAMP) }],
  }));

  return {
    scrollRef,
    onScroll,
    collapsed,
    /** Taller than the viewport by the collapse distance, so the panel can always collapse. */
    minContentHeight: sizes.viewport + sizes.hero + Math.max(sizes.panel - COLLAPSED_HEIGHT, 0),
    heroStyle,
    panelStyle,
    summaryStyle,
    onViewportLayout: (event: LayoutChangeEvent) => {
      const viewport = event.nativeEvent.layout.height;
      setSizes(current => ({ ...current, viewport }));
    },
    onHeroLayout: (event: LayoutChangeEvent) => {
      const hero = event.nativeEvent.layout.height;
      heroHeight.value = hero;
      setSizes(current => ({ ...current, hero }));
    },
    onPanelLayout: (event: LayoutChangeEvent) => {
      const panel = event.nativeEvent.layout.height;
      panelHeight.value = panel;
      setSizes(current => ({ ...current, panel }));
    },
    /** Scrolls back to the top, which opens the panel. */
    expand: () =>
      scheduleOnUI(() => {
        'worklet';
        scrollTo(scrollRef, 0, 0, true);
      }),
    /** Scrolls until the panel has collapsed into the bar, bringing the results up. */
    collapse: () =>
      scheduleOnUI(() => {
        'worklet';
        scrollTo(scrollRef, 0, end(), true);
      }),
  };
}
