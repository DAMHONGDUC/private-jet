import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '@/core/theme/theme';

/** Fills the window with the app background; `top` pads under the status bar. */
export function Screen({ children, top = false }: { children: ReactNode; top?: boolean }) {
  const insets = useSafeAreaInsets();
  return <View style={[styles.screen, top && { paddingTop: insets.top }]}>{children}</View>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
});
