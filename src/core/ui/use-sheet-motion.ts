import { useEffect, useState } from 'react';
import { useWindowDimensions, type LayoutChangeEvent } from 'react-native';
import {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

const OPEN = { duration: 320, easing: Easing.out(Easing.cubic) } as const;
const CLOSE = { duration: 240, easing: Easing.in(Easing.cubic) } as const;

/**
 * How a bottom sheet comes and goes: the sheet slides up from below while the
 * scrim behind it fades in where it is, and both reverse on close. The modal
 * stays mounted until the sheet is out of sight, so pass `mounted` as its
 * `visible` and give it `animationType="none"`.
 */
export function useSheetMotion(visible: boolean) {
  const { height: windowHeight } = useWindowDimensions();
  const [mounted, setMounted] = useState(visible);
  // Mounts in the same render that opens it, so the first frame is already the sheet below the screen.
  if (visible && !mounted) {
    setMounted(true);
  }
  const progress = useSharedValue(0);
  // Until the sheet is measured, a screen's height is far enough to hide it.
  const sheetHeight = useSharedValue(windowHeight);

  useEffect(() => {
    if (visible) {
      progress.value = withTiming(1, OPEN);
    } else if (mounted) {
      progress.value = withTiming(0, CLOSE, finished => {
        if (finished) {
          scheduleOnRN(setMounted, false);
        }
      });
    }
  }, [visible, mounted, progress]);

  const backdropStyle = useAnimatedStyle(() => ({ opacity: progress.value }));
  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: (1 - progress.value) * sheetHeight.value }],
  }));
  const onSheetLayout = (event: LayoutChangeEvent) => {
    sheetHeight.value = event.nativeEvent.layout.height;
  };

  return { mounted, backdropStyle, sheetStyle, onSheetLayout };
}
