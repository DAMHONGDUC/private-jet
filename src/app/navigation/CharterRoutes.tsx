import { useNavigation } from '@react-navigation/native';
import type {
  NativeStackNavigationProp,
  NativeStackScreenProps,
} from '@react-navigation/native-stack';
import { BookingConfirmationScreen } from '@/features/booking/presentation/screens/BookingConfirmationScreen';
import { CharterCheckoutScreen } from '@/features/dashboard/presentation/screens/CharterCheckoutScreen';
import { DashboardScreen } from '@/features/dashboard/presentation/screens/DashboardScreen';
import { JetQuoteScreen } from '@/features/dashboard/presentation/screens/JetQuoteScreen';
import { SearchResultsScreen } from '@/features/dashboard/presentation/screens/SearchResultsScreen';
import type { AppStackParamList } from './types';

// Screens know nothing of navigation; these adapters turn routes into props.

type Props<T extends keyof AppStackParamList> = NativeStackScreenProps<
  AppStackParamList,
  T
>;

/** The Home tab: the search, which opens its results over the tabs. */
export function HomeTab() {
  const root = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  return (
    <DashboardScreen
      onOpenMessages={() => root.navigate('Chat')}
      onOpenNotifications={() => root.navigate('Notifications')}
      onOpenNews={newsId => root.navigate('NewsDetail', { newsId })}
      onShowResults={() => root.navigate('SearchResults')}
    />
  );
}

export function SearchResultsRoute({ navigation }: Props<'SearchResults'>) {
  return (
    <SearchResultsScreen
      onBack={() => navigation.goBack()}
      onOpenQuote={(legIndex, quoteId) =>
        navigation.navigate('JetQuote', { legIndex, quoteId })
      }
      onCheckout={() => navigation.navigate('CharterCheckout')}
    />
  );
}

export function JetQuoteRoute({ navigation, route }: Props<'JetQuote'>) {
  return (
    <JetQuoteScreen
      legIndex={route.params.legIndex}
      quoteId={route.params.quoteId}
      onBack={() => navigation.goBack()}
      onCheckout={() => navigation.replace('CharterCheckout')}
    />
  );
}

export function CharterCheckoutRoute({ navigation }: Props<'CharterCheckout'>) {
  return (
    <CharterCheckoutScreen
      onBack={() => navigation.goBack()}
      // Replace, so Back from the confirmation does not reopen a paid checkout.
      onBooked={bookingId =>
        navigation.replace('CharterConfirmation', { bookingId })
      }
    />
  );
}

export function CharterConfirmationRoute({
  navigation,
  route,
}: Props<'CharterConfirmation'>) {
  return (
    <BookingConfirmationScreen
      bookingId={route.params.bookingId}
      onViewTrip={() => {
        // The trip list goes under the trip, so Back lands on it.
        navigation.popTo('Main', { screen: 'TripsTab' });
        navigation.navigate('TripDetail', {
          bookingId: route.params.bookingId,
        });
      }}
      onDone={() => navigation.popTo('Main', { screen: 'DashboardTab' })}
    />
  );
}
