import { createBottomTabNavigator, type BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { StyleSheet, Text } from 'react-native';
import { colors } from '@/core/theme/theme';
import { TripsScreen } from '@/features/booking/presentation/screens/TripsScreen';
import { DashboardScreen } from '@/features/dashboard/presentation/screens/DashboardScreen';
import { FlightsNavigator } from './FlightsNavigator';
import type { RootTabParamList } from './types';

const Tab = createBottomTabNavigator<RootTabParamList>();

const ICONS: Record<keyof RootTabParamList, string> = {
  DashboardTab: '◆',
  FlightsTab: '✈︎',
  TripsTab: '☰',
};

/** Built once per tab at module level, so no component is created during render. */
function tabIcon(name: keyof RootTabParamList) {
  return ({ color }: { color: string }) => <Text style={[styles.icon, { color }]}>{ICONS[name]}</Text>;
}

const TAB_ICONS = {
  DashboardTab: tabIcon('DashboardTab'),
  FlightsTab: tabIcon('FlightsTab'),
  TripsTab: tabIcon('TripsTab'),
};

function DashboardRoute({ navigation }: BottomTabScreenProps<RootTabParamList, 'DashboardTab'>) {
  return (
    <DashboardScreen
      onOpenTrips={() => navigation.navigate('TripsTab')}
      onFindFlights={() => navigation.navigate('FlightsTab', { screen: 'FlightList' })}
    />
  );
}

export function RootNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.gold,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border },
        tabBarIcon: TAB_ICONS[route.name],
      })}
    >
      <Tab.Screen name="DashboardTab" component={DashboardRoute} options={{ title: 'Dashboard' }} />
      <Tab.Screen name="FlightsTab" component={FlightsNavigator} options={{ title: 'Flights' }} />
      <Tab.Screen name="TripsTab" component={TripsScreen} options={{ title: 'Trips' }} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  icon: { fontSize: 18 },
});
