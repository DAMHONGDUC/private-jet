import { useT } from '@/core/i18n/i18n';
import { AppColors } from '@/core/theme/app-colors';
import { StyleSheet, View } from 'react-native';
import { useBlackJetTheme } from '@/core/theme/blackjet';
import { AppSpacing } from '@/core/theme/app-spacing';
import { radius } from '@/core/theme/theme';
import { Icon } from '@/core/ui/Icon';
import { PressableScale } from '@/core/ui/PressableScale';
import { BJText } from '@/core/ui/BJText';
import { formatDuration, formatMoney } from '@/core/utils/format';
import { CATEGORY_LABELS } from '../search-labels';
import type { JetQuote } from '../../domain/entities/charter';
import { imageFor } from '@/core/ui/images';
import { PhotoPager } from './PhotoPager';

export const JET_CARD_HEIGHT = 240;

/** Dark at the top for the name, clear in the middle, darker towards the bottom. */
const OVERLAY =
  'linear-gradient(180deg, rgba(0, 0, 0, 0.41) 25%, rgba(25, 25, 25, 0) 50%, rgba(0, 0, 0, 0.5) 75%, rgba(0, 0, 0, 0.7) 100%)';

type Props = {
  quote: JetQuote;
  selected?: boolean;
  onPress?: () => void;
};

/** One aircraft quote, as the original app's jet card (feature-docs/dashboard §12.3). */
export function JetCard({ quote, selected = false, onPress }: Props) {
  const palette = useBlackJetTheme();
  const t = useT();
  return (
    <PressableScale
      testID={`jet-card-${quote.id}`}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={`${quote.aircraft.model}, ${formatMoney(
        quote.price,
        quote.currency,
      )}`}
      disabled={!onPress}
      onPress={onPress}
      scaleTo={0.985}
      style={[
        styles.card,
        selected && [styles.selected, { borderColor: palette.accent }],
      ]}
    >
      <PhotoPager
        testID={`jet-card-${quote.id}-photos`}
        photos={quote.photos.map(imageFor)}
        height={JET_CARD_HEIGHT}
        dotsBottom={12}
      />
      <View
        pointerEvents="none"
        style={[StyleSheet.absoluteFill, { backgroundImage: OVERLAY }]}
      />
      <View pointerEvents="none" style={styles.content}>
        <View style={styles.row}>
          <View style={styles.flex}>
            <BJText size={16} tone="white" numberOfLines={1}>
              {quote.aircraft.model}
            </BJText>
            <BJText size={13} tone="white">
              {t(quote.nonStop ? 'results.nonStop' : 'results.fuelStop')}
            </BJText>
          </View>
          <BJText size={13} tone="white">
            {t('search.upToSeats', { count: quote.aircraft.totalSeats })}
          </BJText>
        </View>
        <View style={styles.row}>
          <BJText size={13} tone="white">
            {t(CATEGORY_LABELS[quote.aircraft.category])}
          </BJText>
          <View style={styles.end}>
            <View style={styles.price}>
              <BJText
                testID={`jet-card-${quote.id}-price`}
                tone="white"
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.7}
              >
                {formatMoney(quote.price, quote.currency)}
              </BJText>
            </View>
            <BJText size={13} tone="white">
              {formatDuration(quote.durationMinutes)}
            </BJText>
          </View>
        </View>
      </View>
      {selected ? (
        <View
          pointerEvents="none"
          testID={`jet-card-${quote.id}-selected`}
          style={[styles.badge, { backgroundColor: palette.accent }]}
        >
          <Icon name="check" size={14} color={palette.onAccent} />
          <BJText size={13} tone="onAccent">
            {t('results.selected')}
          </BJText>
        </View>
      ) : null}
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  card: {
    height: JET_CARD_HEIGHT,
    borderRadius: radius.xl,
    overflow: 'hidden',
    backgroundColor: AppColors.fixed.photoBackdrop,
  },
  selected: { borderWidth: 1.5 },
  badge: {
    position: 'absolute',
    top: '42%',
    alignSelf: 'center',
    paddingHorizontal: AppSpacing.md,
    paddingVertical: AppSpacing.xs,
    borderRadius: radius.pill,
    flexDirection: 'row',
    alignItems: 'center',
    gap: AppSpacing.xs,
  },
  content: {
    ...StyleSheet.absoluteFill,
    padding: AppSpacing.lg,
    justifyContent: 'space-between',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    gap: AppSpacing.md,
  },
  flex: { flex: 1, gap: AppSpacing.xs },
  end: { alignItems: 'flex-end', gap: AppSpacing.sm },
  /** Smoked glass over the photo, with a hairline edge. */
  price: {
    minWidth: 88,
    height: 32,
    borderRadius: radius.pill,
    paddingHorizontal: AppSpacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: AppColors.fixed.photoScrim,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: AppColors.fixed.onPhotoHairline,
  },
});
