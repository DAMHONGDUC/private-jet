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

/** How far a drag back up must go before the full form comes back. */
export const EXPAND_DRAG = 24;
/** The pill fades in over this last stretch of the form leaving the screen. */
const FADE_BAND = 48;

/**
 * Swaps the dashboard's search form for a floating pill as it scrolls away.
 *
 * The form stays in the scroll content, so it moves with the page. Once it
 * has nearly left the screen the pill takes its place on top. Dragging back
 * up by `EXPAND_DRAG` while the pill shows scrolls to the top, so the whole
 * form returns at once instead of only when the page reaches the top.
 * Letting go while the form is half hidden settles on the nearer end.
 */
export function useCollapsibleSearch() {
  const scrollRef = useAnimatedRef<Animated.ScrollView>();
  const y = useSharedValue(0);
  const dragStart = useSharedValue(0);
  /** A drag back up asked for the form while the page was still gliding. */
  const expandPending = useSharedValue(false);
  const formTop = useSharedValue(0);
  const formBottom = useSharedValue(0);
  const [collapsed, setCollapsed] = useState(false);

  /** Scrolled far enough that the form is out of sight. */
  const threshold = () => {
    'worklet';
    return Math.max(formBottom.value - FADE_BAND, 1);
  };
  const isCollapsed = () => {
    'worklet';
    return formBottom.value > 0 && y.value >= threshold();
  };

  const settle = () => {
    'worklet';
    const top = formTop.value;
    const end = threshold() + FADE_BAND;
    if (y.value > top + 1 && y.value < end - 1) {
      scrollTo(scrollRef, 0, y.value - top < (end - top) / 2 ? top : end, true);
    }
  };

  const onScroll = useAnimatedScrollHandler({
    onScroll: event => {
      y.value = event.contentOffset.y;
    },
    onBeginDrag: event => {
      dragStart.value = event.contentOffset.y;
      expandPending.value = false;
    },
    onEndDrag: event => {
      const wentUp = dragStart.value - event.contentOffset.y >= EXPAND_DRAG;
      const gliding = (event.velocity?.y ?? 0) !== 0;
      if (wentUp && dragStart.value >= threshold()) {
        // A glide would cancel the scroll, so it waits for the glide to end.
        if (gliding) {
          expandPending.value = true;
        } else {
          scrollTo(scrollRef, 0, 0, true);
        }
      } else if (!gliding) {
        settle();
      }
    },
    onMomentumEnd: () => {
      if (expandPending.value) {
        expandPending.value = false;
        scrollTo(scrollRef, 0, 0, true);
      } else {
        settle();
      }
    },
  });

  useAnimatedReaction(isCollapsed, (now, before) => {
    if (now !== before) {
      scheduleOnRN(setCollapsed, now);
    }
  });

  const summaryStyle = useAnimatedStyle(() => {
    const start = threshold() - FADE_BAND;
    return {
      opacity: interpolate(
        y.value,
        [start, threshold()],
        [0, 1],
        Extrapolation.CLAMP,
      ),
      transform: [
        {
          translateY: interpolate(
            y.value,
            [start, threshold()],
            [-8, 0],
            Extrapolation.CLAMP,
          ),
        },
      ],
    };
  });

  return {
    scrollRef,
    onScroll,
    /** The pill is showing and takes touches. */
    collapsed,
    summaryStyle,
    /** Where the form sits in the scroll content. */
    onFormLayout: (event: LayoutChangeEvent) => {
      const { y: top, height } = event.nativeEvent.layout;
      formTop.value = top;
      formBottom.value = top + height;
    },
    /** Scrolls back to the top, which shows the whole form. */
    expand: () =>
      scheduleOnUI(() => {
        'worklet';
        scrollTo(scrollRef, 0, 0, true);
      }),
  };
}
