import {
  DarkTheme,
  DefaultTheme,
  NavigationContainer,
  type Theme,
} from '@react-navigation/native';
import { useEffect, useMemo, useState } from 'react';
import { Appearance, StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider, useSelector } from 'react-redux';
import {
  ThemeMode,
  selectThemeMode,
} from '@/core/preferences/preferences-slice';
import { ColorScheme } from '@/core/theme/app-colors';
import {
  blackJetFonts,
  useBlackJetTheme,
  type BlackJetPalette,
} from '@/core/theme/blackjet';
import { createDependencies } from './di/container';
import { RootNavigator } from './navigation/RootNavigator';
import { setupAppListeners } from './store/listeners';
import { createAppStore, type AppStore } from './store/store';

function navigationTheme(palette: BlackJetPalette): Theme {
  const base = palette.scheme === ColorScheme.Dark ? DarkTheme : DefaultTheme;
  return {
    ...base,
    colors: {
      ...base.colors,
      primary: palette.jetBlack,
      background: palette.secondaryBackground,
      card: palette.secondaryBackground,
      text: palette.primaryText,
      border: palette.iron,
      notification: palette.error,
    },
    fonts: {
      regular: { fontFamily: blackJetFonts.regular, fontWeight: 'normal' },
      medium: { fontFamily: blackJetFonts.medium, fontWeight: 'normal' },
      bold: { fontFamily: blackJetFonts.bold, fontWeight: 'normal' },
      heavy: { fontFamily: blackJetFonts.bold, fontWeight: 'normal' },
    },
  };
}

/** `store` lets tests run the whole app on mock data without delays. */
type Props = { store?: AppStore };

export default function App({ store: injected }: Props) {
  const [store] = useState(
    () => injected ?? createAppStore(createDependencies()),
  );

  useEffect(() => setupAppListeners(store.dispatch), [store]);

  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <ThemedApp />
      </SafeAreaProvider>
    </Provider>
  );
}

/** Everything that reads the theme, so it sits under the store that holds the choice. */
function ThemedApp() {
  const palette = useBlackJetTheme();
  const themeMode = useSelector(selectThemeMode);
  const theme = useMemo(() => navigationTheme(palette), [palette]);

  // Native views (the tab bar, alerts, the keyboard) follow the choice too.
  useEffect(() => {
    Appearance.setColorScheme(
      themeMode === ThemeMode.System ? 'unspecified' : themeMode,
    );
  }, [themeMode]);

  return (
    <>
      <StatusBar
        barStyle={
          palette.scheme === ColorScheme.Dark ? 'light-content' : 'dark-content'
        }
      />
      <NavigationContainer theme={theme}>
        <RootNavigator />
      </NavigationContainer>
    </>
  );
}
