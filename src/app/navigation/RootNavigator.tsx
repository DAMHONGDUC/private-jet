import { createNativeBottomTabNavigator } from '@react-navigation/bottom-tabs/unstable';
import {
  createNativeStackNavigator,
  type NativeStackScreenProps,
} from '@react-navigation/native-stack';
import { useSelector } from 'react-redux';
import { blackJetFonts, useBlackJetTheme } from '@/core/theme/blackjet';
import { TAB_ICONS } from '@/core/ui/images';
import { useRestoreSessionQuery } from '@/features/auth/presentation/auth-api';
import { LoginScreen } from '@/features/auth/presentation/screens/LoginScreen';
import { SplashScreen } from '@/features/auth/presentation/screens/SplashScreen';
import { selectSession } from '@/features/auth/presentation/session-slice';
import { NewsDetailScreen } from '@/features/dashboard/presentation/screens/NewsDetailScreen';
import { ChatScreen } from '@/features/inbox/presentation/screens/ChatScreen';
import { NotificationsScreen } from '@/features/inbox/presentation/screens/NotificationsScreen';
import {
  CharterCheckoutRoute,
  CharterConfirmationRoute,
  HomeTab,
  JetQuoteRoute,
  SearchResultsRoute,
} from './CharterRoutes';
import { ProfileNavigator } from './ProfileNavigator';
import { TripsNavigator } from './TripsNavigator';
import type { AppStackParamList, RootTabParamList } from './types';

const Tab = createNativeBottomTabNavigator<RootTabParamList>();
const Stack = createNativeStackNavigator<AppStackParamList>();

/**
 * The system tab bar: Liquid Glass on iOS 26, Material on Android. iOS
 * draws SF Symbols; Android tints the bundled PNGs.
 */
function MainTabs() {
  const palette = useBlackJetTheme();
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: palette.accent,
        tabBarInactiveTintColor: palette.secondaryText,
        tabBarActiveIndicatorColor: palette.accentSoft,
        tabBarLabelStyle: { fontFamily: blackJetFonts.medium },
        tabBarStyle: { backgroundColor: palette.secondaryBackground },
        tabBarMinimizeBehavior: 'onScrollDown',
      }}
    >
      <Tab.Screen
        name="DashboardTab"
        component={HomeTab}
        options={{ title: 'Home', tabBarIcon: TAB_ICONS.home }}
      />
      <Tab.Screen
        name="TripsTab"
        component={TripsNavigator}
        options={{ title: 'Trips', tabBarIcon: TAB_ICONS.trips }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileNavigator}
        options={{ title: 'Profile', tabBarIcon: TAB_ICONS.profile }}
      />
    </Tab.Navigator>
  );
}

type Props<T extends keyof AppStackParamList> = NativeStackScreenProps<
  AppStackParamList,
  T
>;

function NotificationsRoute({ navigation }: Props<'Notifications'>) {
  return (
    <NotificationsScreen
      onOpenTrip={bookingId =>
        navigation.navigate('Main', {
          screen: 'TripsTab',
          // initial: false keeps the trip list under the trip, so Back lands on it.
          params: {
            screen: 'TripDetail',
            params: { bookingId },
            initial: false,
          },
        })
      }
    />
  );
}

function NewsDetailRoute({ navigation, route }: Props<'NewsDetail'>) {
  return (
    <NewsDetailScreen
      newsId={route.params.newsId}
      onBack={() => navigation.goBack()}
      onPlanTrip={() => navigation.navigate('Main', { screen: 'DashboardTab' })}
    />
  );
}

/**
 * Splash while the launch check restores the session, then the app or the
 * login screen. Signing in or out swaps them with a fade. The inbox,
 * stories and the charter flow open over the tabs.
 */
export function RootNavigator() {
  useRestoreSessionQuery();
  const { status } = useSelector(selectSession);
  const palette = useBlackJetTheme();

  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'fade' }}>
      {status === 'restoring' ? (
        <Stack.Screen name="Splash" component={SplashScreen} />
      ) : status === 'signedIn' ? (
        <>
          <Stack.Screen name="Main" component={MainTabs} />
          <Stack.Group
            screenOptions={{
              headerShown: true,
              animation: 'slide_from_right',
              headerStyle: { backgroundColor: palette.secondaryBackground },
              headerTintColor: palette.primaryText,
              headerTitleStyle: {
                color: palette.primaryText,
                fontFamily: blackJetFonts.medium,
              },
              headerShadowVisible: false,
              headerBackButtonDisplayMode: 'minimal',
              contentStyle: { backgroundColor: palette.secondaryBackground },
            }}
          >
            <Stack.Screen
              name="Chat"
              component={ChatScreen}
              options={{ title: 'Concierge' }}
            />
            <Stack.Screen
              name="Notifications"
              component={NotificationsRoute}
              options={{ title: 'Notifications' }}
            />
            <Stack.Screen
              name="NewsDetail"
              component={NewsDetailRoute}
              options={{ headerShown: false, animation: 'fade_from_bottom' }}
            />
            <Stack.Screen
              name="SearchResults"
              component={SearchResultsRoute}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="JetQuote"
              component={JetQuoteRoute}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="CharterCheckout"
              component={CharterCheckoutRoute}
              options={{ title: 'Checkout' }}
            />
            <Stack.Screen
              name="CharterConfirmation"
              component={CharterConfirmationRoute}
              options={{
                headerShown: false,
                gestureEnabled: false,
                animation: 'fade',
              }}
            />
          </Stack.Group>
        </>
      ) : (
        <Stack.Screen name="Login" component={LoginScreen} />
      )}
    </Stack.Navigator>
  );
}
