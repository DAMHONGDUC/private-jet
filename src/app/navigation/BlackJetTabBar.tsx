import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { blackJetFixed } from '@/core/theme/blackjet';
import { BJText } from '@/core/ui/BJText';
import { Icon, type IconName } from '@/core/ui/Icon';
import { PressableScale } from '@/core/ui/PressableScale';
import { haptics } from '@/core/ui/haptics';
import { selectUser } from '@/features/auth/presentation/session-slice';
import { Avatar } from '@/features/profile/presentation/components/Avatar';
import { useSelector } from 'react-redux';
import type { RootTabParamList } from './types';

const ICONS: Record<Exclude<keyof RootTabParamList, 'ProfileTab'>, IconName> = {
  DashboardTab: 'home',
  FlightsTab: 'plane',
  TripsTab: 'ticket',
};

const INDICATOR = 24;

/**
 * The floating bar of the original app (feature-docs/dashboard §2.5): #191919 with
 * 24 pt top corners, white for the current tab and ash for the others. The
 * profile tab shows the member's initials, ringed white when current; a
 * short bar springs along the top edge to the current tab.
 */
export function BlackJetTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const user = useSelector(selectUser);
  const [width, setWidth] = useState(0);
  const tabWidth = (width - BAR_PADDING * 2) / state.routes.length;
  const offset = useSharedValue(0);

  useEffect(() => {
    if (width > 0) {
      offset.value = withSpring(BAR_PADDING + tabWidth * state.index + (tabWidth - INDICATOR) / 2, {
        damping: 18,
        stiffness: 180,
      });
    }
  }, [offset, state.index, tabWidth, width]);

  const indicatorStyle = useAnimatedStyle(() => ({ transform: [{ translateX: offset.value }] }));

  return (
    <View
      onLayout={event => setWidth(event.nativeEvent.layout.width)}
      style={[styles.bar, { paddingBottom: insets.bottom, height: BAR_HEIGHT + insets.bottom }]}
    >
      {width > 0 ? <Animated.View pointerEvents="none" style={[styles.indicator, indicatorStyle]} /> : null}
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
            {route.name === 'ProfileTab' ? (
              <Avatar
                name={user?.fullName ?? '?'}
                size={28}
                ring={focused ? blackJetFixed.navActive : '#555553'}
                ringWidth={focused ? 2 : 1}
              />
            ) : (
              <Icon name={ICONS[route.name as keyof typeof ICONS]} size={28} color={color} />
            )}
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
const BAR_PADDING = 16;

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: BAR_PADDING,
    backgroundColor: blackJetFixed.navBackground,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  indicator: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: INDICATOR,
    height: 3,
    borderBottomLeftRadius: 3,
    borderBottomRightRadius: 3,
    backgroundColor: blackJetFixed.navActive,
  },
  tab: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 4 },
});
