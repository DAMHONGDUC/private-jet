import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useNavigation, type CompositeNavigationProp } from '@react-navigation/native';
import {
  createNativeStackNavigator,
  type NativeStackNavigationProp,
  type NativeStackScreenProps,
} from '@react-navigation/native-stack';
import { useSelector } from 'react-redux';
import { colors } from '@/core/theme/theme';
import { BookingConfirmationScreen } from '@/features/booking/presentation/screens/BookingConfirmationScreen';
import { BookingScreen } from '@/features/booking/presentation/screens/BookingScreen';
import { selectFlightSearch } from '@/features/flights/presentation/flight-search-slice';
import { AirportPickerScreen } from '@/features/flights/presentation/screens/AirportPickerScreen';
import { FlightDetailScreen } from '@/features/flights/presentation/screens/FlightDetailScreen';
import { FlightResultsScreen } from '@/features/flights/presentation/screens/FlightResultsScreen';
import { FlightSearchScreen } from '@/features/flights/presentation/screens/FlightSearchScreen';
import type { FlightsStackParamList, RootTabParamList } from './types';

const Stack = createNativeStackNavigator<FlightsStackParamList>();

type Props<T extends keyof FlightsStackParamList> = NativeStackScreenProps<FlightsStackParamList, T>;
type TabsNavigation = CompositeNavigationProp<
  NativeStackNavigationProp<FlightsStackParamList>,
  BottomTabNavigationProp<RootTabParamList>
>;

// Screens know nothing of navigation; these adapters turn routes into props.

function FlightSearchRoute({ navigation }: Props<'FlightSearch'>) {
  return (
    <FlightSearchScreen
      onPickAirport={field => navigation.navigate('AirportPicker', { field })}
      onSearch={() => navigation.navigate('FlightResults')}
    />
  );
}

function AirportPickerRoute({ navigation, route }: Props<'AirportPicker'>) {
  return <AirportPickerScreen field={route.params.field} onDone={() => navigation.goBack()} />;
}

function FlightResultsRoute({ navigation }: Props<'FlightResults'>) {
  return (
    <FlightResultsScreen
      onOpenFlight={flightId => navigation.navigate('FlightDetail', { flightId })}
      onEditSearch={() => navigation.popTo('FlightSearch')}
    />
  );
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
  // The form starts with as many passengers as the search asked for.
  const { passengers } = useSelector(selectFlightSearch);
  return (
    <BookingScreen
      flightId={route.params.flightId}
      initialPassengers={passengers}
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
      <Stack.Screen name="FlightSearch" component={FlightSearchRoute} options={{ headerShown: false }} />
      <Stack.Screen
        name="AirportPicker"
        component={AirportPickerRoute}
        options={({ route }) => ({
          title: route.params.field === 'origin' ? 'Flying from' : 'Flying to',
          presentation: 'modal',
        })}
      />
      <Stack.Screen name="FlightResults" component={FlightResultsRoute} options={{ title: 'Flights' }} />
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
