import { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  type DimensionValue,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { blackJetCurves, useBlackJetTheme } from '@/core/theme/blackjet';

const DURATION = 800;
/** 0.524 rad, the tilt of the original shimmer. */
const ANGLE = '30deg';

type Props = {
  width: DimensionValue;
  height: number;
  radius?: number;
  style?: StyleProp<ViewStyle>;
};

/** A placeholder bar that one light sweep crosses once when it appears (feature-docs/dashboard §6.4). */
export function Shimmer({ width, height, radius = 100, style }: Props) {
  const palette = useBlackJetTheme();
  const [barWidth, setBarWidth] = useState(0);
  const sweep = useSharedValue(0);

  useEffect(() => {
    if (barWidth > 0) {
      sweep.value = withTiming(1, {
        duration: DURATION,
        easing: Easing.bezier(...blackJetCurves.easeInOut),
      });
    }
  }, [barWidth, sweep]);

  const bandStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: -barWidth + sweep.value * barWidth * 2 },
      { rotate: ANGLE },
    ],
  }));

  const clear = `${palette.shimmerColour}00`;
  return (
    <View
      onLayout={event => setBarWidth(event.nativeEvent.layout.width)}
      style={[
        styles.bar,
        {
          width,
          height,
          borderRadius: radius,
          backgroundColor: palette.loadStateColour,
        },
        style,
      ]}
    >
      <Animated.View
        pointerEvents="none"
        style={[
          styles.band,
          {
            backgroundImage: `linear-gradient(90deg, ${clear}, ${palette.shimmerColour}, ${clear})`,
          },
          bandStyle,
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  bar: { overflow: 'hidden' },
  band: { position: 'absolute', top: '-100%', bottom: '-100%', width: '60%' },
});
