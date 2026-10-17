import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useNavigation, type CompositeNavigationProp } from '@react-navigation/native';
import {
  createNativeStackNavigator,
  type NativeStackNavigationProp,
  type NativeStackScreenProps,
} from '@react-navigation/native-stack';
import { blackJetFonts, useBlackJetTheme } from '@/core/theme/blackjet';
import { BookingConfirmationScreen } from '@/features/booking/presentation/screens/BookingConfirmationScreen';
import { CharterCheckoutScreen } from '@/features/dashboard/presentation/screens/CharterCheckoutScreen';
import { DashboardScreen } from '@/features/dashboard/presentation/screens/DashboardScreen';
import { JetQuoteScreen } from '@/features/dashboard/presentation/screens/JetQuoteScreen';
import type { AppStackParamList, HomeStackParamList, RootTabParamList } from './types';

const Stack = createNativeStackNavigator<HomeStackParamList>();

type Props<T extends keyof HomeStackParamList> = NativeStackScreenProps<HomeStackParamList, T>;
type TabsNavigation = CompositeNavigationProp<
  NativeStackNavigationProp<HomeStackParamList>,
  BottomTabNavigationProp<RootTabParamList>
>;

function HomeRoute({ navigation }: Props<'Home'>) {
  const root = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  return (
    <DashboardScreen
      onOpenMessages={() => root.navigate('Chat')}
      onOpenNotifications={() => root.navigate('Notifications')}
      onOpenNews={newsId => root.navigate('NewsDetail', { newsId })}
      onOpenQuote={(legIndex, quoteId) => navigation.navigate('JetQuote', { legIndex, quoteId })}
      onCheckout={() => navigation.navigate('CharterCheckout')}
    />
  );
}

function JetQuoteRoute({ navigation, route }: Props<'JetQuote'>) {
  return (
    <JetQuoteScreen
      legIndex={route.params.legIndex}
      quoteId={route.params.quoteId}
      onBack={() => navigation.goBack()}
      onCheckout={() => navigation.replace('CharterCheckout')}
    />
  );
}

function CharterCheckoutRoute({ navigation }: Props<'CharterCheckout'>) {
  return (
    <CharterCheckoutScreen
      onBack={() => navigation.goBack()}
      // Replace, so Back from the confirmation does not reopen a paid checkout.
      onBooked={bookingId => navigation.replace('CharterConfirmation', { bookingId })}
    />
  );
}

function CharterConfirmationRoute({ route }: Props<'CharterConfirmation'>) {
  const navigation = useNavigation<TabsNavigation>();
  return (
    <BookingConfirmationScreen
      bookingId={route.params.bookingId}
      onViewTrip={() => {
        navigation.popToTop();
        // initial: false keeps the trip list under the trip, so Back lands on it.
        navigation.navigate('TripsTab', { screen: 'TripDetail', params: { bookingId: route.params.bookingId }, initial: false });
      }}
      onDone={() => navigation.popToTop()}
    />
  );
}

export function HomeNavigator() {
  const palette = useBlackJetTheme();
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: palette.secondaryBackground },
        headerTintColor: palette.primaryText,
        headerTitleStyle: { color: palette.primaryText, fontFamily: blackJetFonts.medium },
        headerShadowVisible: false,
        headerBackButtonDisplayMode: 'minimal',
        contentStyle: { backgroundColor: palette.secondaryBackground },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="Home" component={HomeRoute} options={{ headerShown: false }} />
      <Stack.Screen name="JetQuote" component={JetQuoteRoute} options={{ headerShown: false, animation: 'fade_from_bottom' }} />
      <Stack.Screen name="CharterCheckout" component={CharterCheckoutRoute} options={{ title: 'Checkout' }} />
      <Stack.Screen
        name="CharterConfirmation"
        component={CharterConfirmationRoute}
        options={{ headerShown: false, gestureEnabled: false, animation: 'fade' }}
      />
    </Stack.Navigator>
  );
}
