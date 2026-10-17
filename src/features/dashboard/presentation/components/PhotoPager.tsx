import { useState, type ReactNode } from 'react';
import { FlatList, Image, StyleSheet, View, type ImageSourcePropType } from 'react-native';
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
  testID?: string;
};

const DOT = 6;

/**
 * Photos that page sideways, with slide-style dots: 6 pt, 4 pt apart,
 * permanent ash and white (feature-docs/dashboard §2.4).
 */
export function PhotoPager({ photos, height, dotsBottom, renderOverlay, onPressItem, testID }: Props) {
  const palette = useBlackJetTheme();
  const [width, setWidth] = useState(0);
  const [page, setPage] = useState(0);
  const [list, setList] = useState<FlatList<ImageSourcePropType> | null>(null);

  return (
    <View testID={testID} style={{ height }} onLayout={event => setWidth(event.nativeEvent.layout.width)}>
      {width > 0 ? (
        <FlatList
          ref={setList}
          data={photos}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          keyExtractor={(_, index) => String(index)}
          getItemLayout={(_, index) => ({ length: width, offset: width * index, index })}
          onMomentumScrollEnd={event => setPage(Math.round(event.nativeEvent.contentOffset.x / width))}
          renderItem={({ item, index }) => (
            <PressableScale
              testID={testID && `${testID}-item-${index}`}
              disabled={!onPressItem}
              accessibilityRole={onPressItem ? 'button' : undefined}
              onPress={() => onPressItem?.(index)}
              scaleTo={0.99}
              style={{ width, height }}
            >
              <Image source={item} resizeMode="cover" style={StyleSheet.absoluteFill} />
              {renderOverlay?.(index)}
            </PressableScale>
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
              style={[styles.dot, { backgroundColor: index === page ? palette.info : palette.permanentAsh }]}
            />
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  dots: { position: 'absolute', alignSelf: 'center', flexDirection: 'row', gap: 4 },
  dot: { width: DOT, height: DOT, borderRadius: DOT / 2 },
});
