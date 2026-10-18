import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  interpolate,
  useAnimatedReaction,
  useAnimatedStyle,
  type SharedValue,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import { BJText } from '@/core/ui/BJText';
import type { CharterRequest } from '../../domain/entities/charter';
import { COMPACT_SUMMARY_HEIGHT, SearchSummaryBar } from './SearchSummaryBar';

type Props = {
  /** From `useCollapsibleSearch`: 0 with the form in view, 1 once it is away. */
  progress: SharedValue<number>;
  title: string;
  request: CharterRequest | null;
  onPress: () => void;
};

/**
 * The header beside the back button: the screen's title while the form is
 * in view, then the search pill in its place once the form scrolls away.
 * The two cross-fade with `progress`; the pill takes touches only while it
 * is mostly in, and only this view re-renders when that flips.
 */
export function HeaderSearchSlot({ progress, title, request, onPress }: Props) {
  const [shown, setShown] = useState(false);

  useAnimatedReaction(
    () => progress.value > 0.5,
    (now, before) => {
      if (now !== before) {
        scheduleOnRN(setShown, now);
      }
    },
  );

  const titleStyle = useAnimatedStyle(() => ({
    opacity: 1 - progress.value,
    transform: [{ translateY: interpolate(progress.value, [0, 1], [0, -8]) }],
  }));
  const pillStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ translateY: interpolate(progress.value, [0, 1], [8, 0]) }],
  }));

  return (
    <View style={styles.slot}>
      <Animated.View
        style={[styles.layer, titleStyle]}
        pointerEvents="none"
        accessibilityElementsHidden={shown}
        importantForAccessibility={shown ? 'no-hide-descendants' : 'auto'}
      >
        <BJText size={20} numberOfLines={1}>
          {title}
        </BJText>
      </Animated.View>
      <Animated.View
        testID="search-summary-slot"
        style={[styles.layer, pillStyle]}
        pointerEvents={shown ? 'box-none' : 'none'}
      >
        <SearchSummaryBar request={request} onPress={onPress} compact />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  slot: { flex: 1, height: COMPACT_SUMMARY_HEIGHT },
  layer: { ...StyleSheet.absoluteFill, justifyContent: 'center' },
});
