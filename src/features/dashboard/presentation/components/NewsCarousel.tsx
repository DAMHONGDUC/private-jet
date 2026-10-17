import { StyleSheet, View } from 'react-native';
import { BJText } from '@/core/ui/BJText';
import { useGetNewsQuery } from '../dashboard-api';
import { imageFor } from '@/core/ui/images';
import { PhotoPager } from './PhotoPager';
import { NewsSkeleton } from './Skeletons';

const HEIGHT = 220;

/** Darkens towards the top-left corner, behind the title. */
const OVERLAY =
  'linear-gradient(200deg, rgba(8, 7, 5, 0.1) 20%, rgba(8, 7, 5, 0.4) 60%, rgba(8, 7, 5, 0.8) 90%)';

/** Up to five stories that page sideways (feature-docs/dashboard §2.4); hidden when there are none. */
export function NewsCarousel() {
  const { data: posts, isLoading } = useGetNewsQuery();

  if (isLoading) {
    return (
      <View style={styles.root}>
        <NewsSkeleton />
      </View>
    );
  }
  if (!posts || posts.length === 0) {
    return null;
  }
  return (
    <View testID="news-carousel" style={[styles.root, styles.card]}>
      <PhotoPager
        testID="news-pager"
        photos={posts.map(post => imageFor(post.image))}
        height={HEIGHT}
        dotsBottom={12}
        renderOverlay={index => (
          <View pointerEvents="none" style={[StyleSheet.absoluteFill, { backgroundImage: OVERLAY }]}>
            <View style={styles.text}>
              <BJText testID={`news-title-${index}`} size={16} tone="white" numberOfLines={2}>
                {posts[index].title}
              </BJText>
              <BJText weight="regular" numberOfLines={2} style={styles.summary}>
                {posts[index].summary}
              </BJText>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { marginHorizontal: 12, marginTop: 24 },
  card: { height: HEIGHT, borderRadius: 16, overflow: 'hidden', backgroundColor: '#191919' },
  text: { paddingHorizontal: 18, paddingVertical: 12, gap: 8 },
  summary: { color: 'rgba(255, 255, 255, 0.89)' },
});
