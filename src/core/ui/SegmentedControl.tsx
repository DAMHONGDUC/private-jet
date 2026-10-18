import { useEffect, useState } from 'react';
import { View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { ColorScheme } from '@/core/theme/app-colors';
import { blackJetCurves, makeStyles } from '@/core/theme/blackjet';
import { elevation, radius } from '@/core/theme/theme';
import { AppText } from './AppText';
import { PressableScale } from './PressableScale';
import { haptics } from './haptics';

type Props<T extends string> = {
  options: readonly { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  testID: string;
};

/** Equal segments with a pill that slides to the chosen one. */
export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  testID,
}: Props<T>) {
  const styles = useStyles();
  const [width, setWidth] = useState(0);
  const index = Math.max(
    0,
    options.findIndex(option => option.value === value),
  );
  const position = useSharedValue(index);

  useEffect(() => {
    position.value = withTiming(index, {
      duration: 200,
      easing: Easing.bezier(...blackJetCurves.easeInOut),
    });
  }, [index, position]);

  const segment = width / options.length;
  const pillStyle = useAnimatedStyle(() => ({
    width: segment,
    transform: [{ translateX: position.value * segment }],
  }));

  return (
    <View
      testID={testID}
      style={styles.track}
      onLayout={event => setWidth(event.nativeEvent.layout.width - 8)}
    >
      {width > 0 ? <Animated.View style={[styles.pill, pillStyle]} /> : null}
      {options.map(option => {
        const selected = option.value === value;
        return (
          <PressableScale
            key={option.value}
            testID={`${testID}-${option.value}`}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            scaleTo={0.97}
            onPress={() => {
              if (!selected) {
                haptics.selection();
                onChange(option.value);
              }
            }}
            style={styles.segment}
          >
            <AppText variant="subtitle" muted={!selected}>
              {option.label}
            </AppText>
          </PressableScale>
        );
      })}
    </View>
  );
}

const useStyles = makeStyles(palette => ({
  track: {
    flexDirection: 'row',
    padding: 4,
    borderRadius: radius.md,
    backgroundColor: palette.primaryBackground,
  },
  pill: {
    position: 'absolute',
    top: 4,
    bottom: 4,
    left: 4,
    borderRadius: radius.sm,
    backgroundColor:
      palette.scheme === ColorScheme.Dark ? palette.iron : palette.raised,
    ...elevation(palette.shadow),
  },
  segment: {
    flex: 1,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
}));
