import { Pressable, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { pressTiming } from '@/core/theme/theme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type Props = Omit<PressableProps, 'style'> & { style?: StyleProp<ViewStyle>; scaleTo?: number };

/** A pressable that sinks slightly under the finger and eases back. */
export function PressableScale({ style, scaleTo = 0.98, onPressIn, onPressOut, ...rest }: Props) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <AnimatedPressable
      {...rest}
      onPressIn={event => {
        scale.value = withTiming(scaleTo, pressTiming);
        onPressIn?.(event);
      }}
      onPressOut={event => {
        scale.value = withTiming(1, pressTiming);
        onPressOut?.(event);
      }}
      style={[style, animatedStyle]}
    />
  );
}
