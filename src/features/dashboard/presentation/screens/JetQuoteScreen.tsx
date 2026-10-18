import { StyleSheet, View } from 'react-native';
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
import { radius, spacing } from '@/core/theme/theme';
import { AppText } from '@/core/ui/AppText';
import { Button } from '@/core/ui/Button';
import { Icon } from '@/core/ui/Icon';
import { PressableScale } from '@/core/ui/PressableScale';
import { Screen } from '@/core/ui/Screen';
import { EmptyView } from '@/core/ui/StateViews';
import { haptics } from '@/core/ui/haptics';
import { imageFor } from '@/core/ui/images';
import { formatDuration, formatMoney } from '@/core/utils/format';
import {
  quoteChosen,
  quoteToggled,
  selectQuoteSelections,
} from '../charter-search-slice';
import { PhotoPager } from '../components/PhotoPager';
import { CATEGORY_LABELS, formatDay } from '../search-labels';
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
  const barStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      scrollY.value,
      [HERO - 140, HERO - 80],
      [0, 1],
      Extrapolation.CLAMP,
    ),
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
        <Button title="Back" variant="secondary" onPress={onBack} />
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

  const facts: [string, string][] = [
    ['Flight time', formatDuration(quote.durationMinutes)],
    ['Routing', quote.nonStop ? 'Non stop' : '1 fuel stop'],
    ['Seats', `Up to ${quote.aircraft.totalSeats}`],
    ['Cruise', `${quote.specs.cruiseKmh} km/h`],
    ['Range', `${quote.specs.rangeKm.toLocaleString('en-GB')} km`],
    ['Baggage', `${quote.specs.baggageM3} m³`],
  ];

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
        <View style={styles.sheet}>
          <View style={styles.block}>
            <AppText variant="label" muted>
              {CATEGORY_LABELS[quote.aircraft.category]}
              {legs > 1 ? ` · Leg ${legIndex + 1} of ${legs}` : ''}
            </AppText>
            <AppText testID="quote-model" variant="display">
              {quote.aircraft.model}
            </AppText>
            <AppText muted>
              {group.leg.origin} → {group.leg.destination} ·{' '}
              {formatDay(group.leg.date)} · {group.leg.passengers}{' '}
              {group.leg.passengers === 1 ? 'passenger' : 'passengers'}
            </AppText>
          </View>

          <View style={styles.grid}>
            {facts.map(([label, value]) => (
              <View key={label} style={styles.fact}>
                <AppText variant="caption" muted>
                  {label}
                </AppText>
                <AppText variant="subtitle">{value}</AppText>
              </View>
            ))}
          </View>

          <View style={styles.block}>
            <AppText variant="subtitle">Cabin</AppText>
            <AppText muted>{quote.specs.cabin}</AppText>
            <View style={styles.chips}>
              {quote.amenities.map(amenity => (
                <View key={amenity} style={styles.chip}>
                  <AppText variant="caption">{amenity}</AppText>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.block}>
            <AppText variant="subtitle">Included</AppText>
            <AppText muted>
              Two pilots and cabin crew, fuel, landing and handling fees,
              catering for every passenger and a private terminal on both ends.
              Free cancellation up to 24 hours before departure.
            </AppText>
          </View>
        </View>
      </Animated.ScrollView>

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
          {quote.aircraft.model}
        </AppText>
      </Animated.View>
      <PressableScale
        testID="quote-back"
        accessibilityRole="button"
        accessibilityLabel="Back"
        onPress={onBack}
        style={[styles.back, { top: insets.top + 8 }]}
      >
        <Icon name="chevronLeft" size={20} color="#FFFFFF" />
      </PressableScale>

      <View
        style={[styles.footer, { paddingBottom: insets.bottom + spacing.md }]}
      >
        <View style={styles.price}>
          <AppText variant="caption" muted>
            Total for this leg
          </AppText>
          <AppText testID="quote-price" variant="title">
            {formatMoney(quote.price, quote.currency)}
          </AppText>
        </View>
        {selected ? (
          <>
            <Button
              testID="quote-remove"
              title="Remove"
              variant="secondary"
              onPress={choose}
            />
            <Button
              testID="quote-next"
              title={othersChosen ? 'Checkout' : 'Back to jets'}
              onPress={othersChosen ? onCheckout : onBack}
            />
          </>
        ) : (
          <Button
            testID="quote-choose"
            title={
              othersChosen
                ? legs > 1
                  ? 'Choose & checkout'
                  : 'Book this jet'
                : `Choose for leg ${legIndex + 1}`
            }
            onPress={choose}
          />
        )}
      </View>
    </View>
  );
}

const SHADE =
  'linear-gradient(180deg, rgba(0, 0, 0, 0.45) 0%, rgba(0, 0, 0, 0) 35%, rgba(0, 0, 0, 0) 70%, rgba(0, 0, 0, 0.35) 100%)';

const useStyles = makeStyles(palette => ({
  root: { flex: 1 },
  hero: { height: HERO, backgroundColor: '#191919' },
  heroShade: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  sheet: {
    backgroundColor: palette.secondaryBackground,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    padding: spacing.lg,
    gap: spacing.xl,
    minHeight: 600,
    marginTop: -24,
  },
  block: { gap: spacing.sm },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: spacing.lg,
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: palette.primaryBackground,
  },
  fact: {
    width: '33.33%',
    gap: spacing.xs,
    paddingRight: spacing.sm,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    backgroundColor: palette.accentSoft,
  },
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
    left: spacing.md,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    backgroundColor: palette.secondaryBackground,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: palette.iron,
  },
  price: { flex: 1, gap: 2 },
}));
