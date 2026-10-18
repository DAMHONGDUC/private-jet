import { createNativeBottomTabNavigator } from '@react-navigation/bottom-tabs/unstable';
import {
  createNativeStackNavigator,
  type NativeStackScreenProps,
} from '@react-navigation/native-stack';
import { useSelector } from 'react-redux';
import { useT } from '@/core/i18n/i18n';
import { blackJetFonts, useBlackJetTheme } from '@/core/theme/blackjet';
import { TAB_ICONS } from '@/core/ui/images';
import { useRestoreSessionQuery } from '@/features/auth/presentation/auth-api';
import { LoginScreen } from '@/features/auth/presentation/screens/LoginScreen';
import { SplashScreen } from '@/features/auth/presentation/screens/SplashScreen';
import {
  SessionStatus,
  selectSession,
} from '@/features/auth/presentation/session-slice';
import { NewsDetailScreen } from '@/features/dashboard/presentation/screens/NewsDetailScreen';
import { LegalScreen } from '@/features/profile/presentation/screens/HelpScreen';
import { ChatScreen } from '@/features/inbox/presentation/screens/ChatScreen';
import { NotificationsScreen } from '@/features/inbox/presentation/screens/NotificationsScreen';
import {
  CharterCheckoutRoute,
  CharterConfirmationRoute,
  HomeTab,
  JetQuoteRoute,
  SearchResultsRoute,
} from './CharterRoutes';
import {
  AddCardRoute,
  EditProfileRoute,
  HelpRoute,
  PaymentMethodsRoute,
  ProfileTab,
} from './ProfileRoutes';
import { TripDetailRoute, TripsTab } from './TripsRoutes';
import type { AppStackParamList, RootTabParamList } from './types';

const Tab = createNativeBottomTabNavigator<RootTabParamList>();
const Stack = createNativeStackNavigator<AppStackParamList>();

/**
 * The system tab bar: Liquid Glass on iOS 26, Material on Android. iOS
 * draws SF Symbols; Android tints the bundled PNGs. Each tab is a single
 * screen, so the bar shows on these three only.
 */
function MainTabs() {
  const palette = useBlackJetTheme();
  const t = useT();
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
        options={{ title: t('tabs.home'), tabBarIcon: TAB_ICONS.home }}
      />
      <Tab.Screen
        name="TripsTab"
        component={TripsTab}
        options={{ title: t('tabs.trips'), tabBarIcon: TAB_ICONS.trips }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileTab}
        options={{ title: t('tabs.profile'), tabBarIcon: TAB_ICONS.profile }}
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
      onOpenTrip={bookingId => navigation.push('TripDetail', { bookingId })}
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
 * stories, the charter flow and every tab's detail pages open over the tabs.
 */
export function RootNavigator() {
  useRestoreSessionQuery();
  const { status } = useSelector(selectSession);
  const palette = useBlackJetTheme();
  const t = useT();

  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'fade' }}>
      {status === SessionStatus.Restoring ? (
        <Stack.Screen name="Splash" component={SplashScreen} />
      ) : status === SessionStatus.SignedIn ? (
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
              options={{ title: t('screens.concierge') }}
            />
            <Stack.Screen
              name="Notifications"
              component={NotificationsRoute}
              options={{ title: t('screens.notifications') }}
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
              options={{ title: t('screens.checkout') }}
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
            <Stack.Screen
              name="TripDetail"
              component={TripDetailRoute}
              options={{ title: t('screens.trip') }}
            />
            <Stack.Screen
              name="EditProfile"
              component={EditProfileRoute}
              options={{ title: t('screens.personalInfo') }}
            />
            <Stack.Screen
              name="PaymentMethods"
              component={PaymentMethodsRoute}
              options={{ title: t('screens.paymentMethods') }}
            />
            <Stack.Screen
              name="AddCard"
              component={AddCardRoute}
              options={{
                title: t('screens.addCard'),
                animation: 'slide_from_bottom',
              }}
            />
            <Stack.Screen
              name="Help"
              component={HelpRoute}
              options={{ title: t('screens.help') }}
            />
            <Stack.Screen
              name="Legal"
              component={LegalScreen}
              options={{ title: t('screens.legal') }}
            />
          </Stack.Group>
        </>
      ) : (
        <Stack.Screen name="Login" component={LoginScreen} />
      )}
    </Stack.Navigator>
  );
}
