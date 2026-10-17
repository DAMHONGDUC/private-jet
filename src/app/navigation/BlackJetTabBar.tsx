import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { blackJetFixed } from '@/core/theme/blackjet';
import { BJText } from '@/core/ui/BJText';
import { Icon, type IconName } from '@/core/ui/Icon';
import { PressableScale } from '@/core/ui/PressableScale';
import { haptics } from '@/core/ui/haptics';
import type { RootTabParamList } from './types';

const ICONS: Record<keyof RootTabParamList, IconName> = {
  DashboardTab: 'home',
  FlightsTab: 'plane',
  TripsTab: 'ticket',
};

/**
 * The floating bar of the original app (feature-docs/dashboard §2.5): #191919 with
 * 24 pt top corners, white for the current tab and ash for the others.
 */
export function BlackJetTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.bar, { paddingBottom: insets.bottom, height: BAR_HEIGHT + insets.bottom }]}>
      {state.routes.map((route, index) => {
        const focused = state.index === index;
        const color = focused ? blackJetFixed.navActive : blackJetFixed.navInactive;
        const title = descriptors[route.key].options.title ?? route.name;
        return (
          <PressableScale
            key={route.key}
            testID={`tab-${route.name}`}
            accessibilityRole="tab"
            accessibilityState={{ selected: focused }}
            accessibilityLabel={title}
            onPress={() => {
              const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
              // The current tab does nothing, as in the original.
              if (!focused && !event.defaultPrevented) {
                haptics.selection();
                navigation.navigate(route.name, route.params);
              }
            }}
            style={styles.tab}
          >
            <Icon name={ICONS[route.name as keyof RootTabParamList]} size={28} color={color} />
            <BJText size={10} style={{ color }}>
              {title}
            </BJText>
          </PressableScale>
        );
      })}
    </View>
  );
}

const BAR_HEIGHT = 70;

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    backgroundColor: blackJetFixed.navBackground,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  tab: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 4 },
});
