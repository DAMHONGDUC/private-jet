import { useT } from '@/core/i18n/i18n';
import { AppColors } from '@/core/theme/app-colors';
import { StyleSheet, View } from 'react-native';
import { AppSpacing } from '@/core/theme/app-spacing';
import { radius } from '@/core/theme/theme';
import { BJText } from '@/core/ui/BJText';
import { useGetNewsQuery } from '../dashboard-api';
import { imageFor } from '@/core/ui/images';
import { PhotoPager } from './PhotoPager';
import { NewsSkeleton } from './Skeletons';

const HEIGHT = 220;

/** Darkens towards the bottom, behind the title. */
const OVERLAY =
  'linear-gradient(180deg, rgba(8, 7, 5, 0) 35%, rgba(8, 7, 5, 0.75) 100%)';

/** Up to five stories that page sideways (feature-docs/dashboard §2.4); hidden when there are none. */
export function NewsCarousel({
  onOpenNews,
}: {
  onOpenNews?: (newsId: string) => void;
}) {
  const t = useT();
  const { data: posts, isLoading } = useGetNewsQuery();

  if (isLoading) {
    return (
      <View style={styles.root}>
        <BJText size={20}>{t('home.journal')}</BJText>
        <NewsSkeleton />
      </View>
    );
  }
  if (!posts || posts.length === 0) {
    return null;
  }
  return (
    <View style={styles.root}>
      <BJText size={20}>{t('home.journal')}</BJText>
      <View testID="news-carousel" style={styles.card}>
        <PhotoPager
          testID="news-pager"
          photos={posts.map(post => imageFor(post.image))}
          height={HEIGHT}
          dotsBottom={12}
          onPressItem={onOpenNews && (index => onOpenNews(posts[index].id))}
          renderOverlay={index => (
            <View
              pointerEvents="none"
              style={[StyleSheet.absoluteFill, { backgroundImage: OVERLAY }]}
            >
              <View style={styles.text}>
                <BJText
                  testID={`news-title-${index}`}
                  size={20}
                  tone="white"
                  numberOfLines={2}
                >
                  {posts[index].title}
                </BJText>
                <BJText
                  size={13}
                  weight="regular"
                  numberOfLines={2}
                  style={styles.summary}
                >
                  {posts[index].summary}
                </BJText>
              </View>
            </View>
          )}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    marginHorizontal: AppSpacing.lg,
    marginTop: AppSpacing.section,
    gap: AppSpacing.lg,
  },
  card: {
    height: HEIGHT,
    borderRadius: radius.xl,
    overflow: 'hidden',
    backgroundColor: AppColors.fixed.photoBackdrop,
  },
  text: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: AppSpacing.lg,
    paddingBottom: AppSpacing.xxl,
    gap: AppSpacing.xs,
  },
  summary: { color: 'rgba(255, 255, 255, 0.89)' },
});
