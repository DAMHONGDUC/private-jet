import { DarkTheme, DefaultTheme, NavigationContainer, type Theme } from '@react-navigation/native';
import { useEffect, useMemo, useState } from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import { blackJetFonts, useBlackJetTheme, type BlackJetPalette } from '@/core/theme/blackjet';
import { createDependencies } from './di/container';
import { RootNavigator } from './navigation/RootNavigator';
import { setupAppListeners } from './store/listeners';
import { createAppStore, type AppStore } from './store/store';

function navigationTheme(palette: BlackJetPalette): Theme {
  const base = palette.scheme === 'dark' ? DarkTheme : DefaultTheme;
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
  const [store] = useState(() => injected ?? createAppStore(createDependencies()));
  const palette = useBlackJetTheme();
  const theme = useMemo(() => navigationTheme(palette), [palette]);

  useEffect(() => setupAppListeners(store.dispatch), [store]);

  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <StatusBar barStyle={palette.scheme === 'dark' ? 'light-content' : 'dark-content'} />
        <NavigationContainer theme={theme}>
          <RootNavigator />
        </NavigationContainer>
      </SafeAreaProvider>
    </Provider>
  );
}
