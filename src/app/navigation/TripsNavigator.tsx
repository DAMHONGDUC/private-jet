import type { NativeBottomTabNavigationProp } from '@react-navigation/bottom-tabs/unstable';
import {
  useNavigation,
  type CompositeNavigationProp,
} from '@react-navigation/native';
import {
  createNativeStackNavigator,
  type NativeStackNavigationProp,
  type NativeStackScreenProps,
} from '@react-navigation/native-stack';
import { blackJetFonts, useBlackJetTheme } from '@/core/theme/blackjet';
import { TripDetailScreen } from '@/features/booking/presentation/screens/TripDetailScreen';
import { TripsScreen } from '@/features/booking/presentation/screens/TripsScreen';
import type {
  AppStackParamList,
  RootTabParamList,
  TripsStackParamList,
} from './types';

const Stack = createNativeStackNavigator<TripsStackParamList>();

type Props<T extends keyof TripsStackParamList> = NativeStackScreenProps<
  TripsStackParamList,
  T
>;
type TabsNavigation = CompositeNavigationProp<
  NativeStackNavigationProp<TripsStackParamList>,
  NativeBottomTabNavigationProp<RootTabParamList>
>;

function TripListRoute({ navigation }: Props<'TripList'>) {
  const tabs = useNavigation<TabsNavigation>();
  return (
    <TripsScreen
      onOpenTrip={bookingId => navigation.navigate('TripDetail', { bookingId })}
      onPlanTrip={() => tabs.navigate('DashboardTab')}
    />
  );
}

function TripDetailRoute({ route }: Props<'TripDetail'>) {
  const root = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  return (
    <TripDetailScreen
      bookingId={route.params.bookingId}
      onContactConcierge={() => root.navigate('Chat')}
    />
  );
}

export function TripsNavigator() {
  const palette = useBlackJetTheme();
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: palette.secondaryBackground },
        headerTintColor: palette.primaryText,
        headerTitleStyle: {
          color: palette.primaryText,
          fontFamily: blackJetFonts.medium,
        },
        headerShadowVisible: false,
        headerBackButtonDisplayMode: 'minimal',
        contentStyle: { backgroundColor: palette.secondaryBackground },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen
        name="TripList"
        component={TripListRoute}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="TripDetail"
        component={TripDetailRoute}
        options={{ title: 'Trip' }}
      />
    </Stack.Navigator>
  );
}
