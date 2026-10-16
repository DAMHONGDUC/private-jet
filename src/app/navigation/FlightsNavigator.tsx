import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useNavigation, type CompositeNavigationProp } from '@react-navigation/native';
import {
  createNativeStackNavigator,
  type NativeStackNavigationProp,
  type NativeStackScreenProps,
} from '@react-navigation/native-stack';
import { colors } from '@/core/theme/theme';
import { BookingConfirmationScreen } from '@/features/booking/presentation/screens/BookingConfirmationScreen';
import { BookingScreen } from '@/features/booking/presentation/screens/BookingScreen';
import { FlightDetailScreen } from '@/features/flights/presentation/screens/FlightDetailScreen';
import { FlightListScreen } from '@/features/flights/presentation/screens/FlightListScreen';
import type { FlightsStackParamList, RootTabParamList } from './types';

const Stack = createNativeStackNavigator<FlightsStackParamList>();

type Props<T extends keyof FlightsStackParamList> = NativeStackScreenProps<FlightsStackParamList, T>;
type TabsNavigation = CompositeNavigationProp<
  NativeStackNavigationProp<FlightsStackParamList>,
  BottomTabNavigationProp<RootTabParamList>
>;

// Screens know nothing of navigation; these adapters turn routes into props.

function FlightListRoute({ navigation }: Props<'FlightList'>) {
  return <FlightListScreen onOpenFlight={flightId => navigation.navigate('FlightDetail', { flightId })} />;
}

function FlightDetailRoute({ navigation, route }: Props<'FlightDetail'>) {
  return (
    <FlightDetailScreen
      flightId={route.params.flightId}
      onBook={flightId => navigation.navigate('Booking', { flightId })}
    />
  );
}

function BookingRoute({ navigation, route }: Props<'Booking'>) {
  return (
    <BookingScreen
      flightId={route.params.flightId}
      // Replace, so Back from the confirmation does not reopen a submitted form.
      onBooked={bookingId => navigation.replace('BookingConfirmation', { bookingId })}
    />
  );
}

function BookingConfirmationRoute({ route }: Props<'BookingConfirmation'>) {
  const navigation = useNavigation<TabsNavigation>();
  return (
    <BookingConfirmationScreen
      bookingId={route.params.bookingId}
      onViewTrips={() => {
        navigation.popToTop();
        navigation.navigate('TripsTab');
      }}
      onDone={() => navigation.popToTop()}
    />
  );
}

export function FlightsNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.gold,
        headerTitleStyle: { color: colors.text },
        headerShadowVisible: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="FlightList" component={FlightListRoute} options={{ headerShown: false }} />
      <Stack.Screen name="FlightDetail" component={FlightDetailRoute} options={{ title: 'Flight' }} />
      <Stack.Screen name="Booking" component={BookingRoute} options={{ title: 'Book seats' }} />
      <Stack.Screen
        name="BookingConfirmation"
        component={BookingConfirmationRoute}
        options={{ headerShown: false, gestureEnabled: false, animation: 'fade' }}
      />
    </Stack.Navigator>
  );
}
