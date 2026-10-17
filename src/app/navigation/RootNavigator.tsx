import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import { StatusBar, useColorScheme } from 'react-native';
import { colors } from '@/core/theme/theme';
import { TripsScreen } from '@/features/booking/presentation/screens/TripsScreen';
import { DashboardScreen } from '@/features/dashboard/presentation/screens/DashboardScreen';
import { BlackJetTabBar } from './BlackJetTabBar';
import { FlightsNavigator } from './FlightsNavigator';
import type { RootTabParamList } from './types';

const Tab = createBottomTabNavigator<RootTabParamList>();

/** Built once, so no component is created during render. */
const renderTabBar = (props: Parameters<typeof BlackJetTabBar>[0]) => <BlackJetTabBar {...props} />;

function DashboardRoute() {
  // The dashboard follows the system theme while the rest of the app stays dark.
  const dark = useColorScheme() === 'dark';
  useFocusEffect(
    useCallback(() => {
      StatusBar.setBarStyle(dark ? 'light-content' : 'dark-content');
      return () => StatusBar.setBarStyle('light-content');
    }, [dark]),
  );
  return <DashboardScreen />;
}

export function RootNavigator() {
  return (
    <Tab.Navigator
      tabBar={renderTabBar}
      screenOptions={{
        headerShown: false,
        animation: 'fade',
        sceneStyle: { backgroundColor: colors.background },
      }}
    >
      <Tab.Screen name="DashboardTab" component={DashboardRoute} options={{ title: 'Home' }} />
      <Tab.Screen name="FlightsTab" component={FlightsNavigator} options={{ title: 'Flights' }} />
      <Tab.Screen name="TripsTab" component={TripsScreen} options={{ title: 'Trips' }} />
    </Tab.Navigator>
  );
}
