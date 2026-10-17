import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSelector } from 'react-redux';
import { useBlackJetTheme } from '@/core/theme/blackjet';
import { useRestoreSessionQuery } from '@/features/auth/presentation/auth-api';
import { LoginScreen } from '@/features/auth/presentation/screens/LoginScreen';
import { SplashScreen } from '@/features/auth/presentation/screens/SplashScreen';
import { selectSession } from '@/features/auth/presentation/session-slice';
import { BlackJetTabBar } from './BlackJetTabBar';
import { FlightsNavigator } from './FlightsNavigator';
import { HomeNavigator } from './HomeNavigator';
import { ProfileNavigator } from './ProfileNavigator';
import { TripsNavigator } from './TripsNavigator';
import type { AppStackParamList, RootTabParamList } from './types';

const Tab = createBottomTabNavigator<RootTabParamList>();
const Stack = createNativeStackNavigator<AppStackParamList>();

/** Built once, so no component is created during render. */
const renderTabBar = (props: Parameters<typeof BlackJetTabBar>[0]) => <BlackJetTabBar {...props} />;

function MainTabs() {
  const palette = useBlackJetTheme();
  return (
    <Tab.Navigator
      tabBar={renderTabBar}
      screenOptions={{
        headerShown: false,
        animation: 'fade',
        sceneStyle: { backgroundColor: palette.secondaryBackground },
      }}
    >
      <Tab.Screen name="DashboardTab" component={HomeNavigator} options={{ title: 'Home' }} />
      <Tab.Screen name="FlightsTab" component={FlightsNavigator} options={{ title: 'Flights' }} />
      <Tab.Screen name="TripsTab" component={TripsNavigator} options={{ title: 'Trips' }} />
      <Tab.Screen name="ProfileTab" component={ProfileNavigator} options={{ title: 'Profile' }} />
    </Tab.Navigator>
  );
}

/**
 * Splash while the launch check restores the session, then the app or the
 * login screen. Signing in or out swaps them with a fade.
 */
export function RootNavigator() {
  useRestoreSessionQuery();
  const { status } = useSelector(selectSession);

  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'fade' }}>
      {status === 'restoring' ? (
        <Stack.Screen name="Splash" component={SplashScreen} />
      ) : status === 'signedIn' ? (
        <Stack.Screen name="Main" component={MainTabs} />
      ) : (
        <Stack.Screen name="Login" component={LoginScreen} />
      )}
    </Stack.Navigator>
  );
}
