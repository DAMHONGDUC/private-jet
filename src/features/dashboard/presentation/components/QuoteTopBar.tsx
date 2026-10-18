import Animated, {
  Extrapolation,
  interpolate,
  type SharedValue,
  useAnimatedStyle,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useT } from '@/core/i18n/i18n';
import { AppColors } from '@/core/theme/app-colors';
import { AppSpacing } from '@/core/theme/app-spacing';
import { makeStyles, useBlackJetTheme } from '@/core/theme/blackjet';
import { AppText } from '@/core/ui/AppText';
import { Icon } from '@/core/ui/Icon';
import { PressableScale } from '@/core/ui/PressableScale';

type Props = {
  title: string;
  scrollY: SharedValue<number>;
  /** Height of the photo header the bar fades in over. */
  heroHeight: number;
  onBack: () => void;
};

/** The quote's back button and the title bar that fades in once the photos scroll away. */
export function QuoteTopBar({ title, scrollY, heroHeight, onBack }: Props) {
  const styles = useStyles();
  const palette = useBlackJetTheme();
  const t = useT();
  const insets = useSafeAreaInsets();
  const barStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      scrollY.value,
      [heroHeight - 140, heroHeight - 80],
      [0, 1],
      Extrapolation.CLAMP,
    ),
  }));

  return (
    <>
      <Animated.View
        pointerEvents="none"
        style={[
          styles.topBar,
          {
            height: insets.top + 56,
            backgroundColor: palette.secondaryBackground,
          },
          barStyle,
        ]}
      >
        <AppText variant="subtitle" numberOfLines={1}>
          {title}
        </AppText>
      </Animated.View>
      <PressableScale
        testID="quote-back"
        accessibilityRole="button"
        accessibilityLabel={t('common.back')}
        onPress={onBack}
        style={[styles.back, { top: insets.top + 8 }]}
      >
        <Icon name="chevronLeft" size={20} color={AppColors.fixed.white} />
      </PressableScale>
    </>
  );
}

const useStyles = makeStyles(palette => ({
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: 64,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: palette.iron,
  },
  back: {
    position: 'absolute',
    left: AppSpacing.spacing12,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: AppColors.fixed.photoScrim,
    alignItems: 'center',
    justifyContent: 'center',
  },
}));
