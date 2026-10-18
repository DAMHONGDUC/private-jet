import { useState } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  interpolate,
  useAnimatedReaction,
  useAnimatedStyle,
  type SharedValue,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import { useBlackJetTheme } from '@/core/theme/blackjet';
import { AppSpacing } from '@/core/theme/app-spacing';
import type { CharterRequest } from '../../domain/entities/charter';
import { SearchSummaryBar } from './SearchSummaryBar';

type Props = {
  /** From `useCollapsibleSearch`: 0 hidden, 1 in place. */
  progress: SharedValue<number>;
  request: CharterRequest | null;
  onPress: () => void;
  testID?: string;
};

/**
 * The search pill pinned over the top of a scroll view, right under the app
 * bar, once its form has scrolled away. It slides and fades in with
 * `progress` and takes touches only while it is mostly in; only this view
 * re-renders when that flips.
 */
export function CollapsedSearchPill({
  progress,
  request,
  onPress,
  testID = 'search-summary',
}: Props) {
  const palette = useBlackJetTheme();
  const [shown, setShown] = useState(false);

  useAnimatedReaction(
    () => progress.value > 0.5,
    (now, before) => {
      if (now !== before) {
        scheduleOnRN(setShown, now);
      }
    },
  );

  const style = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ translateY: interpolate(progress.value, [0, 1], [-12, 0]) }],
  }));

  return (
    <Animated.View
      testID={`${testID}-slot`}
      style={[
        styles.slot,
        { backgroundColor: palette.secondaryBackground },
        style,
      ]}
      pointerEvents={shown ? 'box-none' : 'none'}
    >
      <SearchSummaryBar request={request} onPress={onPress} testID={testID} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  slot: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: AppSpacing.spacing16,
    paddingTop: AppSpacing.spacing8,
    paddingBottom: AppSpacing.spacing12,
  },
});
