import { StyleSheet, View } from 'react-native';
import Animated, { Easing, FadeIn } from 'react-native-reanimated';
import { blackJetCurves } from '@/core/theme/blackjet';
import { BJText } from '@/core/ui/BJText';
import { formatDuration, formatMoney } from '@/core/utils/format';
import { CATEGORY_LABELS } from '@/features/flights/presentation/components/CategoryChips';
import type { JetQuote } from '../../domain/entities/charter';
import { imageFor } from '@/core/ui/images';
import { PhotoPager } from './PhotoPager';

export const JET_CARD_HEIGHT = 250;
/** Cards fade in over 600 ms; the first few 80 ms apart. */
const STAGGERED = 5;

/** Dark at the top for the name, clear in the middle, darker towards the bottom. */
const OVERLAY =
  'linear-gradient(180deg, rgba(0, 0, 0, 0.41) 25%, rgba(25, 25, 25, 0) 50%, rgba(0, 0, 0, 0.5) 75%, rgba(0, 0, 0, 0.7) 100%)';

type Props = { quote: JetQuote; index: number };

/** One aircraft quote, as the original app's jet card (feature-docs/dashboard §12.3). */
export function JetCard({ quote, index }: Props) {
  const entering = FadeIn.duration(600)
    .delay(Math.min(index, STAGGERED) * 80)
    .easing(Easing.bezier(...blackJetCurves.easeInOut));

  return (
    <Animated.View entering={entering} testID={`jet-card-${quote.id}`} style={styles.card}>
      <PhotoPager
        testID={`jet-card-${quote.id}-photos`}
        photos={quote.photos.map(imageFor)}
        height={JET_CARD_HEIGHT}
        dotsBottom={12}
      />
      <View pointerEvents="none" style={[StyleSheet.absoluteFill, { backgroundImage: OVERLAY }]} />
      <View pointerEvents="none" style={styles.content}>
        <View style={styles.row}>
          <View style={styles.flex}>
            <BJText size={16} tone="white" numberOfLines={1}>
              {quote.aircraft.model}
            </BJText>
            <BJText size={12} tone="white">
              {quote.nonStop ? 'Non Stop' : '1 Fuel Stop'}
            </BJText>
          </View>
          <BJText size={12} tone="white">
            Up to {quote.aircraft.totalSeats} seats
          </BJText>
        </View>
        <View style={styles.row}>
          <BJText size={12} tone="white">
            {CATEGORY_LABELS[quote.aircraft.category]}
          </BJText>
          <View style={styles.end}>
            <View style={styles.price}>
              <BJText testID={`jet-card-${quote.id}-price`} size={14} weight="bold" numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7} style={styles.priceText}>
                {formatMoney(quote.price, quote.currency)}
              </BJText>
            </View>
            <BJText size={12} tone="white">
              {formatDuration(quote.durationMinutes)}
            </BJText>
          </View>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: { height: JET_CARD_HEIGHT, borderRadius: 20, overflow: 'hidden', backgroundColor: '#191919' },
  content: { ...StyleSheet.absoluteFill, padding: 12, justifyContent: 'space-between' },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', gap: 12 },
  flex: { flex: 1, gap: 4 },
  end: { alignItems: 'flex-end', gap: 8 },
  price: {
    minWidth: 80,
    height: 25,
    borderRadius: 5,
    paddingHorizontal: 5,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  priceText: { color: '#000000' },
});
