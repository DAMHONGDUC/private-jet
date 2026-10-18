import { Image, StyleSheet, View } from 'react-native';
import { useT } from '@/core/i18n/i18n';
import { useBlackJetTheme } from '@/core/theme/blackjet';
import { radius } from '@/core/theme/theme';
import { BJText } from '@/core/ui/BJText';
import { Icon } from '@/core/ui/Icon';
import { imageFor } from '@/core/ui/images';
import { PressableScale } from '@/core/ui/PressableScale';
import { formatDuration, formatMoney } from '@/core/utils/format';
import type { PopularRoute } from '../../domain/entities/dashboard';
import {
  POPULAR_ROUTE_PHOTO as PHOTO,
  popularRouteStyles as shared,
} from './popular-route-styles';

/** One popular route: photo, cities, codes and duration, starting price. */
export function PopularRouteRow({
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
        shared.row,
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
      <View style={shared.text}>
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

const styles = StyleSheet.create({
  photo: { width: PHOTO, height: PHOTO, borderRadius: radius.md },
  price: { alignItems: 'flex-end' },
});
