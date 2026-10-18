import { useState } from 'react';
import { Platform, type LayoutChangeEvent } from 'react-native';
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
  onDragEnd,
  onGlideEnd,
} from './collapsible-search-motion';

const GLIDE_CANCELS_SCROLL = Platform.OS === 'android';
const PILL_EASING = Easing.out(Easing.cubic);

/**
 * Swaps a screen's search form for a floating pill as it scrolls away.
 *
 * The form stays in the scroll content, so it moves with the page and fades
 * as it leaves. Once it has nearly left the screen the pill eases in on top,
 * on its own clock rather than with the finger, so it never stops half drawn.
 * Dragging back up by `EXPAND_DRAG` while the pill shows scrolls to the top,
 * so the whole form returns at once. A scroll is left where it stops,
 * except inside the fade band just before the pill, which settles on its
 * nearer edge. Everything runs on the UI thread: the
 * screen does not re-render while it scrolls.
 *
 * A short page could not scroll the form away, leaving it stuck half faded
 * with no pill; `minContentHeight` makes the content tall enough to.
 */
export function useCollapsibleSearch() {
  const scrollRef = useAnimatedRef<Animated.ScrollView>();
  const y = useSharedValue(0);
  const dragStart = useSharedValue(0);
  /** A drag back up asked for the form while the page was still gliding. */
  const expandPending = useSharedValue(false);
  const form = useSharedValue({ top: 0, bottom: 0 });
  const collapsed = useSharedValue(false);
  /** 0 with the form in view, 1 with the pill in place. */
  const progress = useSharedValue(0);
  const [formBottom, setFormBottom] = useState(0);
  const [viewport, setViewport] = useState(0);

  const scrollToY = (to: number | null) => {
    'worklet';
    if (to !== null) {
      scrollTo(scrollRef, 0, to, true);
    }
  };

  const onScroll = useAnimatedScrollHandler({
    onScroll: event => {
      y.value = event.contentOffset.y;
      collapsed.value = nextCollapsed(y.value, form.value, collapsed.value);
    },
    onBeginDrag: event => {
      dragStart.value = event.contentOffset.y;
      expandPending.value = false;
    },
    onEndDrag: event => {
      const next = onDragEnd({
        from: dragStart.value,
        to: event.contentOffset.y,
        velocity: event.velocity?.y ?? 0,
        form: form.value,
        glideCancelsScroll: GLIDE_CANCELS_SCROLL,
      });
      expandPending.value = next.expandAfterGlide;
      scrollToY(next.scrollTo);
    },
    onMomentumEnd: event => {
      const pending = expandPending.value;
      expandPending.value = false;
      scrollToY(onGlideEnd(event.contentOffset.y, form.value, pending));
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
