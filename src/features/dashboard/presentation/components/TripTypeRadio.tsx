import { useEffect, useState } from 'react';
import { StyleSheet, View, type LayoutChangeEvent } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useT } from '@/core/i18n/i18n';
import { ColorScheme } from '@/core/theme/app-colors';
import { useBlackJetTheme } from '@/core/theme/blackjet';
import { AppSpacing } from '@/core/theme/app-spacing';
import { elevation, radius, switchTiming } from '@/core/theme/theme';
import { BJText } from '@/core/ui/BJText';
import { PressableScale } from '@/core/ui/PressableScale';
import { TRIP_TYPES, type TripType } from '../../domain/entities/charter';
import { TRIP_TYPE_LABELS } from '../search-labels';

type Props = { value: TripType; onChange: (value: TripType) => void };

const SLIDE = { ...switchTiming, easing: Easing.out(Easing.cubic) };

/**
 * One Way · Round Trip · Multi City as a segmented control
 * (feature-docs/dashboard §2.3a). The raised pill slides to the chosen segment.
 */
export function TripTypeRadio({ value, onChange }: Props) {
  const palette = useBlackJetTheme();
  const t = useT();
  const index = TRIP_TYPES.indexOf(value);
  const [segmentWidth, setSegmentWidth] = useState(0);
  const width = useSharedValue(0);
  const x = useSharedValue(0);

  // A new choice slides the pill over; the first layout places it without moving.
  useEffect(() => {
    x.value = withTiming(index * width.value, SLIDE);
  }, [index, width, x]);

  const pillStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: x.value }],
  }));

  const onLayout = (event: LayoutChangeEvent) => {
    const inner = event.nativeEvent.layout.width - AppSpacing.spacing4 * 2;
    const next = inner / TRIP_TYPES.length;
    setSegmentWidth(next);
    width.value = next;
    x.value = index * next;
  };

  return (
    <View
      style={[styles.segments, { backgroundColor: palette.primaryBackground }]}
      accessibilityRole="radiogroup"
      onLayout={onLayout}
    >
      {segmentWidth > 0 ? (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.pill,
            {
              width: segmentWidth,
              backgroundColor:
                palette.scheme === ColorScheme.Dark
                  ? palette.iron
                  : palette.raised,
              ...elevation(palette.shadow),
            },
            pillStyle,
          ]}
        />
      ) : null}
      {TRIP_TYPES.map(type => {
        const selected = type === value;
        return (
          <PressableScale
            key={type}
            testID={`trip-type-${type}`}
            accessibilityRole="radio"
            accessibilityState={{ checked: selected }}
            onPress={() => onChange(type)}
            scaleTo={1}
            style={styles.segment}
          >
            <BJText
              size={13}
              tone={selected ? 'primary' : 'secondary'}
              weight={selected ? 'medium' : 'regular'}
            >
              {t(TRIP_TYPE_LABELS[type])}
            </BJText>
          </PressableScale>
        );
      })}
    </View>
  );
}

const SEGMENT_HEIGHT = 32;

const styles = StyleSheet.create({
  segments: {
    flexDirection: 'row',
    borderRadius: radius.md,
    padding: AppSpacing.spacing4,
  },
  pill: {
    position: 'absolute',
    top: AppSpacing.spacing4,
    left: AppSpacing.spacing4,
    height: SEGMENT_HEIGHT,
    borderRadius: radius.sm,
  },
  segment: {
    flex: 1,
    height: SEGMENT_HEIGHT,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
