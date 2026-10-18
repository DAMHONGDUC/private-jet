import type { NativeBottomTabScreenProps } from '@react-navigation/bottom-tabs/unstable';
import { useNavigation } from '@react-navigation/native';
import type {
  NativeStackNavigationProp,
  NativeStackScreenProps,
} from '@react-navigation/native-stack';
import { TripDetailScreen } from '@/features/booking/presentation/screens/TripDetailScreen';
import { TripsScreen } from '@/features/booking/presentation/screens/TripsScreen';
import type { AppStackParamList, RootTabParamList } from './types';

// A trip opens on the root stack, over the tabs, so the tab bar never shows
// on it; only the list lives in the tab.

/** The Trips tab: the list, which opens a trip over the tabs. */
export function TripsTab({
  navigation,
}: NativeBottomTabScreenProps<RootTabParamList, 'TripsTab'>) {
  const root = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  return (
    <TripsScreen
      onOpenTrip={bookingId => root.navigate('TripDetail', { bookingId })}
      onPlanTrip={() => navigation.navigate('DashboardTab')}
    />
  );
}

export function TripDetailRoute({
  navigation,
  route,
}: NativeStackScreenProps<AppStackParamList, 'TripDetail'>) {
  return (
    <TripDetailScreen
      bookingId={route.params.bookingId}
      onContactConcierge={() => navigation.navigate('Chat')}
    />
  );
}
