import { useT } from '@/core/i18n/i18n';
import { AppColors } from '@/core/theme/app-colors';
import { Image, StyleSheet, View } from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { makeStyles } from '@/core/theme/blackjet';
import { AppSpacing } from '@/core/theme/app-spacing';
import { AppText } from '@/core/ui/AppText';
import { BottomActions } from '@/core/ui/BottomActions';
import { Button, ButtonVariant } from '@/core/ui/Button';
import { Icon } from '@/core/ui/Icon';
import { PressableScale } from '@/core/ui/PressableScale';
import { Screen } from '@/core/ui/Screen';
import { EmptyView } from '@/core/ui/EmptyView';
import { LoadingView } from '@/core/ui/LoadingView';
import { imageFor } from '@/core/ui/images';
import { useGetNewsQuery } from '../dashboard-api';

const HERO = 320;

type Props = { newsId: string; onBack: () => void; onPlanTrip?: () => void };

/** One story: its photo under a parallax header, then the full text. */
export function NewsDetailScreen({ newsId, onBack, onPlanTrip }: Props) {
  const styles = useStyles();
  const t = useT();
  const insets = useSafeAreaInsets();
  const { data: posts, isLoading } = useGetNewsQuery();
  const scrollY = useSharedValue(0);

  const onScroll = useAnimatedScrollHandler(event => {
    scrollY.value = event.contentOffset.y;
  });
  const heroStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: interpolate(
          scrollY.value,
          [-HERO, 0, HERO],
          [-HERO / 2, 0, HERO / 2],
          Extrapolation.CLAMP,
        ),
      },
      {
        scale: interpolate(
          scrollY.value,
          [-HERO, 0, HERO],
          [2, 1, 1],
          Extrapolation.CLAMP,
        ),
      },
    ],
  }));

  const post = posts?.find(item => item.id === newsId);
  if (isLoading) {
    return (
      <Screen top>
        <LoadingView />
      </Screen>
    );
  }
  if (!post) {
    return (
      <Screen top>
        <EmptyView
          title="This story is gone"
          message="It may have been archived."
        />
        <Button
          title="Back"
          variant={ButtonVariant.Secondary}
          onPress={onBack}
        />
      </Screen>
    );
  }

  return (
    <View style={styles.root}>
      <Animated.ScrollView
        testID="news-scroll"
        onScroll={onScroll}
        scrollEventThrottle={16}
        contentContainerStyle={{
          paddingBottom: onPlanTrip
            ? AppSpacing.spacing24
            : insets.bottom + AppSpacing.spacing32,
        }}
      >
        <Animated.View style={[styles.hero, heroStyle]}>
          <Image
            source={imageFor(post.image)}
            resizeMode="cover"
            style={[StyleSheet.absoluteFill, styles.photo]}
          />
          <View
            pointerEvents="none"
            style={[StyleSheet.absoluteFill, { backgroundImage: SHADE }]}
          />
        </Animated.View>
        <View style={styles.sheet}>
          <View style={styles.block}>
            <AppText variant="label" muted>
              Sovereign news
            </AppText>
            <AppText testID="news-detail-title" variant="display">
              {post.title}
            </AppText>
            <AppText variant="subtitle" muted>
              {post.summary}
            </AppText>
          </View>
          {post.body.split(/\n\s*\n/).map((paragraph, index) => (
            <View key={index}>
              <AppText style={styles.paragraph}>{paragraph}</AppText>
            </View>
          ))}
        </View>
      </Animated.ScrollView>
      {onPlanTrip ? (
        <BottomActions>
          <Button
            testID="news-plan-trip"
            title={t('actions.planFlight')}
            onPress={onPlanTrip}
          />
        </BottomActions>
      ) : null}
      <PressableScale
        testID="news-back"
        accessibilityRole="button"
        accessibilityLabel="Back"
        onPress={onBack}
        style={[styles.back, { top: insets.top + 8 }]}
      >
        <Icon name="chevronLeft" size={20} color={AppColors.fixed.white} />
      </PressableScale>
    </View>
  );
}

const SHADE =
  'linear-gradient(180deg, rgba(0, 0, 0, 0.45) 0%, rgba(0, 0, 0, 0) 40%)';

const useStyles = makeStyles(palette => ({
  // Sized explicitly: with only absolute insets, iOS draws the photo at its pixel size.
  photo: { width: '100%', height: '100%' },
  root: { flex: 1, backgroundColor: palette.secondaryBackground },
  hero: {
    height: HERO,
    backgroundColor: AppColors.fixed.photoBackdrop,
    overflow: 'hidden',
  },
  sheet: {
    backgroundColor: palette.secondaryBackground,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: AppSpacing.spacing16,
    gap: AppSpacing.spacing16,
    marginTop: -24,
    minHeight: 500,
  },
  block: { gap: AppSpacing.spacing8 },
  paragraph: { lineHeight: 23 },
  back: {
    position: 'absolute',
    left: AppSpacing.spacing12,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: AppColors.fixed.photoScrim,
    alignItems: 'center',
    justifyContent: 'center',
  },
}));
