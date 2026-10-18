import { AppColors } from '@/core/theme/app-colors';
import { View } from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { makeStyles, useBlackJetTheme } from '@/core/theme/blackjet';
import { Button, ButtonVariant } from '@/core/ui/Button';
import { Screen } from '@/core/ui/Screen';
import { EmptyView } from '@/core/ui/EmptyView';
import { haptics } from '@/core/ui/haptics';
import { imageFor } from '@/core/ui/images';
import {
  quoteChosen,
  quoteToggled,
  selectQuoteSelections,
} from '../charter-search-slice';
import { PhotoPager } from '../components/PhotoPager';
import { QuoteFooter } from '../components/QuoteFooter';
import { QuoteSheet } from '../components/QuoteSheet';
import { QuoteTopBar } from '../components/QuoteTopBar';
import { useCharterSelection } from '../use-charter-selection';

const HERO = 340;

type Props = {
  legIndex: number;
  quoteId: string;
  onBack: () => void;
  /** Every leg has a jet after this choice. */
  onCheckout: () => void;
};

/**
 * One jet for one leg: photos under a parallax header that stretches when
 * pulled, the facts, what is on board, and choosing it.
 */
export function JetQuoteScreen({
  legIndex,
  quoteId,
  onBack,
  onCheckout,
}: Props) {
  const styles = useStyles();
  const palette = useBlackJetTheme();
  const insets = useSafeAreaInsets();
  const dispatch = useDispatch();
  const selections = useSelector(selectQuoteSelections);
  const { request, results } = useCharterSelection();
  const scrollY = useSharedValue(0);

  const onScroll = useAnimatedScrollHandler(event => {
    scrollY.value = event.contentOffset.y;
  });
  // Pulled down, the photo stretches from the top; scrolled up, it moves at half speed under the sheet.
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
  const group = results?.[legIndex];
  const quote = group?.quotes.find(item => item.id === quoteId);
  if (!request || !group || !quote) {
    return (
      <Screen top>
        <EmptyView
          title="This quote has expired"
          message="Search again to see the jets available now."
        />
        <Button
          title="Back"
          variant={ButtonVariant.Secondary}
          onPress={onBack}
        />
      </Screen>
    );
  }

  const legs = results?.length ?? 1;
  const selected = selections[legIndex] === quoteId;
  const othersChosen = (results ?? []).every(
    (_, index) => index === legIndex || selections[index],
  );

  const choose = () => {
    haptics.selection();
    if (selected) {
      dispatch(quoteToggled({ legIndex, quoteId }));
      return;
    }
    dispatch(quoteChosen({ legIndex, quoteId }));
    haptics.success();
    if (othersChosen) {
      onCheckout();
    } else {
      onBack();
    }
  };

  return (
    <View
      style={[styles.root, { backgroundColor: palette.secondaryBackground }]}
    >
      <Animated.ScrollView
        testID="quote-scroll"
        onScroll={onScroll}
        scrollEventThrottle={16}
        contentContainerStyle={{ paddingBottom: insets.bottom + 120 }}
      >
        <Animated.View style={[styles.hero, heroStyle]}>
          <PhotoPager
            testID="quote-photos"
            photos={quote.photos.map(imageFor)}
            height={HERO}
            dotsBottom={40}
          />
          <View
            pointerEvents="none"
            style={[styles.heroShade, { backgroundImage: SHADE }]}
          />
        </Animated.View>
        <QuoteSheet
          quote={quote}
          group={group}
          legIndex={legIndex}
          legs={legs}
        />
      </Animated.ScrollView>

      <QuoteTopBar
        title={quote.aircraft.model}
        scrollY={scrollY}
        heroHeight={HERO}
        onBack={onBack}
      />

      <QuoteFooter
        quote={quote}
        legIndex={legIndex}
        legs={legs}
        selected={selected}
        othersChosen={othersChosen}
        onChoose={choose}
        onBack={onBack}
        onCheckout={onCheckout}
      />
    </View>
  );
}

const SHADE =
  'linear-gradient(180deg, rgba(0, 0, 0, 0.45) 0%, rgba(0, 0, 0, 0) 35%, rgba(0, 0, 0, 0) 70%, rgba(0, 0, 0, 0.35) 100%)';

const useStyles = makeStyles(() => ({
  root: { flex: 1 },
  hero: { height: HERO, backgroundColor: AppColors.fixed.photoBackdrop },
  heroShade: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
}));
