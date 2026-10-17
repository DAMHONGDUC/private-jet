import type { ReactNode } from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { makeStyles } from '@/core/theme/blackjet';

/** Fills the window with the app background; `top` pads under the status bar. */
export function Screen({ children, top = false }: { children: ReactNode; top?: boolean }) {
  const insets = useSafeAreaInsets();
  const styles = useStyles();
  return <View style={[styles.screen, top && { paddingTop: insets.top }]}>{children}</View>;
}

const useStyles = makeStyles(palette => ({
  screen: { flex: 1, backgroundColor: palette.secondaryBackground },
}));
