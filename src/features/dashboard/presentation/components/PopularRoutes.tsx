import { Image, StyleSheet, View } from 'react-native';
import { useT } from '@/core/i18n/i18n';
import { useBlackJetTheme } from '@/core/theme/blackjet';
import { AppSpacing } from '@/core/theme/app-spacing';
import { radius } from '@/core/theme/theme';
import { BJText } from '@/core/ui/BJText';
import { Icon } from '@/core/ui/Icon';
import { imageFor } from '@/core/ui/images';
import { PressableScale } from '@/core/ui/PressableScale';
import { Shimmer } from '@/core/ui/Shimmer';
import { formatDuration, formatMoney } from '@/core/utils/format';
import type { PopularRoute } from '../../domain/entities/dashboard';
import { useGetPopularRoutesQuery } from '../dashboard-api';

type Props = {
  /** A route was tapped; the form takes its airports. */
  onPick: (route: PopularRoute) => void;
};

/** Routes members fly most, under the search; hidden when there are none. */
export function PopularRoutes({ onPick }: Props) {
  const t = useT();
  const { data: routes, isLoading } = useGetPopularRoutesQuery();

  if (!isLoading && (!routes || routes.length === 0)) {
    return null;
  }
  return (
    <View testID="popular-routes" style={styles.root}>
      <BJText size={20}>{t('home.popularRoutes')}</BJText>
      <View style={styles.list}>
        {isLoading || !routes
          ? [0, 1, 2].map(index => <RowSkeleton key={index} />)
          : routes.map(route => (
              <RouteRow
                key={route.id}
                route={route}
                onPress={() => onPick(route)}
              />
            ))}
      </View>
    </View>
  );
}

function RouteRow({
  route,
  onPress,
}: {
  route: PopularRoute;
  onPress: () => void;
}) {
  const palette = useBlackJetTheme();
  const t = useT();
  return (
    <PressableScale
      testID={`popular-route-${route.id}`}
      accessibilityRole="button"
      accessibilityLabel={`${route.originCity} to ${
        route.destinationCity
      }, from ${formatMoney(route.fromPrice, route.currency)}`}
      onPress={onPress}
      style={[
        styles.row,
        {
          backgroundColor: palette.cardBackground,
          borderColor: palette.iron,
        },
      ]}
    >
      <Image
        source={imageFor(route.image)}
        resizeMode="cover"
        style={styles.photo}
      />
      <View style={styles.text}>
        <BJText numberOfLines={1}>
          {route.originCity} → {route.destinationCity}
        </BJText>
        <BJText size={13} tone="secondary" weight="regular" numberOfLines={1}>
          {route.origin} · {route.destination} ·{' '}
          {formatDuration(route.durationMinutes)}
        </BJText>
      </View>
      <View style={styles.price}>
        <BJText size={13} tone="secondary" weight="regular">
          {t('home.from')}
        </BJText>
        <BJText>{formatMoney(route.fromPrice, route.currency)}</BJText>
      </View>
      <Icon name="chevronRight" size={20} color={palette.ashGrey} />
    </PressableScale>
  );
}

function RowSkeleton() {
  const palette = useBlackJetTheme();
  return (
    <View
      testID="popular-route-skeleton"
      style={[styles.row, { backgroundColor: palette.primaryBackground }]}
    >
      <Shimmer width={PHOTO} height={PHOTO} radius={radius.md} />
      <View style={styles.text}>
        <Shimmer width={140} height={12} />
        <Shimmer width={96} height={10} />
      </View>
    </View>
  );
}

const PHOTO = 56;

const styles = StyleSheet.create({
  root: {
    paddingHorizontal: AppSpacing.lg,
    paddingTop: AppSpacing.section,
    gap: AppSpacing.lg,
  },
  list: { gap: AppSpacing.md },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: AppSpacing.md,
    padding: AppSpacing.sm,
    paddingRight: AppSpacing.md,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
  },
  photo: { width: PHOTO, height: PHOTO, borderRadius: radius.md },
  text: { flex: 1, gap: AppSpacing.xs },
  price: { alignItems: 'flex-end' },
});
