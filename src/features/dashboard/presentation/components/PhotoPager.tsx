import { useEffect, useState, type ReactNode } from 'react';
import {
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  View,
  type ImageSourcePropType,
} from 'react-native';
import { useBlackJetTheme } from '@/core/theme/blackjet';
import { PressableScale } from '@/core/ui/PressableScale';

type Props = {
  photos: ImageSourcePropType[];
  height: number;
  /** Where the dots sit, from the bottom edge. */
  dotsBottom: number;
  /** Drawn over each photo, e.g. a story's title. */
  renderOverlay?: (index: number) => ReactNode;
  /** A photo was tapped. */
  onPressItem?: (index: number) => void;
  /** Turns the page by itself every this many ms, looping; paused while the user drags. */
  autoPlayInterval?: number;
  testID?: string;
};

const DOT = 6;
const PRESSED_OPACITY = 0.85;

/**
 * Photos that page sideways, with slide-style dots: 6 pt, 4 pt apart,
 * permanent ash and white (feature-docs/dashboard §2.4).
 */
export function PhotoPager({
  photos,
  height,
  dotsBottom,
  renderOverlay,
  onPressItem,
  autoPlayInterval,
  testID,
}: Props) {
  const palette = useBlackJetTheme();
  const [width, setWidth] = useState(0);
  const [page, setPage] = useState(0);
  const [list, setList] = useState<FlatList<ImageSourcePropType> | null>(null);
  const [dragging, setDragging] = useState(false);

  // Keyed on page, so any page change (drag, dot tap, auto turn) restarts the wait.
  useEffect(() => {
    if (!autoPlayInterval || !list || dragging || photos.length < 2) {
      return;
    }
    const timer = setTimeout(() => {
      const next = (page + 1) % photos.length;
      list.scrollToIndex({ index: next, animated: true });
      setPage(next);
    }, autoPlayInterval);
    return () => clearTimeout(timer);
  }, [autoPlayInterval, list, dragging, page, photos.length]);

  return (
    <View
      testID={testID}
      style={{ height }}
      onLayout={event => setWidth(event.nativeEvent.layout.width)}
    >
      {width > 0 ? (
        <FlatList
          ref={setList}
          data={photos}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          keyExtractor={(_, index) => String(index)}
          getItemLayout={(_, index) => ({
            length: width,
            offset: width * index,
            index,
          })}
          onScrollBeginDrag={() => setDragging(true)}
          onScrollEndDrag={() => setDragging(false)}
          onMomentumScrollEnd={event =>
            setPage(Math.round(event.nativeEvent.contentOffset.x / width))
          }
          renderItem={({ item, index }) => (
            // Dims rather than shrinks: a smaller page would bare the dark card behind it.
            <Pressable
              testID={testID && `${testID}-item-${index}`}
              disabled={!onPressItem}
              accessibilityRole={onPressItem ? 'button' : undefined}
              onPress={() => onPressItem?.(index)}
              style={({ pressed }) => ({
                width,
                height,
                opacity: pressed ? PRESSED_OPACITY : 1,
              })}
            >
              {/* Sized explicitly: with only absolute insets, iOS draws the photo at its pixel size. */}
              <Image
                source={item}
                resizeMode="cover"
                style={[StyleSheet.absoluteFill, { width, height }]}
              />
              {renderOverlay?.(index)}
            </Pressable>
          )}
        />
      ) : null}
      {photos.length > 1 ? (
        <View style={[styles.dots, { bottom: dotsBottom }]}>
          {photos.map((_, index) => (
            <PressableScale
              key={index}
              accessibilityRole="button"
              accessibilityLabel={`Photo ${index + 1}`}
              hitSlop={6}
              onPress={() => {
                // 500 ms with Curves.ease in the original; the native list animates with its own timing.
                list?.scrollToIndex({ index, animated: true });
                setPage(index);
              }}
              style={[
                styles.dot,
                {
                  backgroundColor:
                    index === page ? palette.info : palette.permanentAsh,
                },
              ]}
            />
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  dots: {
    position: 'absolute',
    alignSelf: 'center',
    flexDirection: 'row',
    gap: 4,
  },
  dot: { width: DOT, height: DOT, borderRadius: DOT / 2 },
});
