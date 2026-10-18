import { View } from 'react-native';
import { useBlackJetTheme } from '@/core/theme/blackjet';
import { radius } from '@/core/theme/theme';
import { Shimmer } from '@/core/ui/Shimmer';
import {
  POPULAR_ROUTE_PHOTO as PHOTO,
  popularRouteStyles as shared,
} from './popular-route-styles';

/** A popular route row while routes load. */
export function PopularRouteSkeleton() {
  const palette = useBlackJetTheme();
  return (
    <View
      testID="popular-route-skeleton"
      style={[shared.row, { backgroundColor: palette.primaryBackground }]}
    >
      <Shimmer width={PHOTO} height={PHOTO} radius={radius.md} />
      <View style={shared.text}>
        <Shimmer width={140} height={12} />
        <Shimmer width={96} height={10} />
      </View>
    </View>
  );
}
