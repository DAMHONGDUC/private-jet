import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useBlackJetTheme } from '@/core/theme/blackjet';
import { TripsScreen } from '@/features/booking/presentation/screens/TripsScreen';
import { DashboardScreen } from '@/features/dashboard/presentation/screens/DashboardScreen';
import { BlackJetTabBar } from './BlackJetTabBar';
import { FlightsNavigator } from './FlightsNavigator';
import type { RootTabParamList } from './types';

const Tab = createBottomTabNavigator<RootTabParamList>();

/** Built once, so no component is created during render. */
const renderTabBar = (props: Parameters<typeof BlackJetTabBar>[0]) => <BlackJetTabBar {...props} />;

function DashboardRoute() {
  return <DashboardScreen />;
}

export function RootNavigator() {
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
      <Tab.Screen name="DashboardTab" component={DashboardRoute} options={{ title: 'Home' }} />
      <Tab.Screen name="FlightsTab" component={FlightsNavigator} options={{ title: 'Flights' }} />
      <Tab.Screen name="TripsTab" component={TripsScreen} options={{ title: 'Trips' }} />
    </Tab.Navigator>
  );
}
