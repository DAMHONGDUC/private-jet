import { useT } from '@/core/i18n/i18n';
import { AppColors } from '@/core/theme/app-colors';
import { StyleSheet, View } from 'react-native';
import { useBlackJetTheme } from '@/core/theme/blackjet';
import { AppSpacing } from '@/core/theme/app-spacing';
import { radius } from '@/core/theme/theme';
import { Icon } from '@/core/ui/Icon';
import { BJText } from '@/core/ui/BJText';
import { formatDuration, formatMoney } from '@/core/utils/format';
import { CATEGORY_LABELS } from '../search-labels';
import type { JetQuote } from '../../domain/entities/charter';
import { imageFor } from '@/core/ui/images';
import type { FlightSchedule } from '@/features/flights/domain/entities/schedule';
import { formatSchedule } from '@/features/flights/presentation/schedule-labels';
import { PhotoPager } from './PhotoPager';

export const JET_CARD_HEIGHT = 240;

/** Dark at the top for the name, clear in the middle, darker towards the bottom. */
const OVERLAY =
  'linear-gradient(180deg, rgba(0, 0, 0, 0.41) 25%, rgba(25, 25, 25, 0) 50%, rgba(0, 0, 0, 0.5) 75%, rgba(0, 0, 0, 0.7) 100%)';

type Props = {
  quote: JetQuote;
  /** Estimated take-off and landing, local at each end. */
  schedule?: FlightSchedule;
  selected?: boolean;
  onPress?: () => void;
};

/** One aircraft quote, as the original app's jet card (feature-docs/dashboard §12.3). */
export function JetCard({ quote, schedule, selected = false, onPress }: Props) {
  const palette = useBlackJetTheme();
  const t = useT();
  return (
    // A plain view, not a pressable: a pressable around the pager turns a sideways swipe into a tap.
    // Taps reach onPress through the pager's pages, so the photos swipe from anywhere on the card.
    <View
      testID={`jet-card-${quote.id}`}
      accessible
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={`${quote.aircraft.model}, ${formatMoney(
        quote.price,
        quote.currency,
      )}`}
      accessibilityActions={onPress ? [{ name: 'activate' }] : undefined}
      onAccessibilityAction={onPress}
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
        onPressItem={onPress && (() => onPress())}
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
            <BJText
              testID={`jet-card-${quote.id}-schedule`}
              size={13}
              tone="white"
              numberOfLines={1}
            >
              {schedule ? `${formatSchedule(schedule)} · ` : ''}
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
    </View>
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
    paddingHorizontal: AppSpacing.spacing12,
    paddingVertical: AppSpacing.spacing4,
    borderRadius: radius.pill,
    flexDirection: 'row',
    alignItems: 'center',
    gap: AppSpacing.spacing4,
  },
  content: {
    ...StyleSheet.absoluteFill,
    padding: AppSpacing.spacing16,
    justifyContent: 'space-between',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    gap: AppSpacing.spacing12,
  },
  flex: { flex: 1, gap: AppSpacing.spacing4 },
  end: { alignItems: 'flex-end', gap: AppSpacing.spacing8 },
  /** Smoked glass over the photo, with a hairline edge. */
  price: {
    minWidth: 88,
    height: 32,
    borderRadius: radius.pill,
    paddingHorizontal: AppSpacing.spacing12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: AppColors.fixed.photoScrim,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: AppColors.fixed.onPhotoHairline,
  },
});
