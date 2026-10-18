import { StyleSheet, View } from 'react-native';
import { useT } from '@/core/i18n/i18n';
import { AppSpacing } from '@/core/theme/app-spacing';
import { BJText } from '@/core/ui/BJText';
import type { PopularRoute } from '../../domain/entities/dashboard';
import { useGetPopularRoutesQuery } from '../dashboard-api';
import { PopularRouteRow } from './PopularRouteRow';
import { PopularRouteSkeleton } from './PopularRouteSkeleton';

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
          ? [0, 1, 2].map(index => <PopularRouteSkeleton key={index} />)
          : routes.map(route => (
              <PopularRouteRow
                key={route.id}
                route={route}
                onPress={() => onPick(route)}
              />
            ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    paddingHorizontal: AppSpacing.spacing16,
    paddingTop: AppSpacing.section,
    gap: AppSpacing.spacing16,
  },
  list: { gap: AppSpacing.spacing12 },
});
