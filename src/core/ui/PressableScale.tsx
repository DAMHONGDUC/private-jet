import { Pressable, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { springConfig } from '@/core/theme/theme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type Props = Omit<PressableProps, 'style'> & { style?: StyleProp<ViewStyle>; scaleTo?: number };

/** A pressable that sinks slightly under the finger and springs back. */
export function PressableScale({ style, scaleTo = 0.97, onPressIn, onPressOut, ...rest }: Props) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <AnimatedPressable
      {...rest}
      onPressIn={event => {
        scale.value = withSpring(scaleTo, springConfig);
        onPressIn?.(event);
      }}
      onPressOut={event => {
        scale.value = withSpring(1, springConfig);
        onPressOut?.(event);
      }}
      style={[style, animatedStyle]}
    />
  );
}
