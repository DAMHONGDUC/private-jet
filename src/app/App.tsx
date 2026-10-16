import { DarkTheme, NavigationContainer, type Theme } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import { colors } from '@/core/theme/theme';
import { createDependencies } from './di/container';
import { RootNavigator } from './navigation/RootNavigator';
import { setupAppListeners } from './store/listeners';
import { createAppStore, type AppStore } from './store/store';

const navigationTheme: Theme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: colors.gold,
    background: colors.background,
    card: colors.surface,
    text: colors.text,
    border: colors.border,
  },
};

/** `store` lets tests run the whole app on mock data without delays. */
type Props = { store?: AppStore };

export default function App({ store: injected }: Props) {
  const [store] = useState(() => injected ?? createAppStore(createDependencies()));

  useEffect(() => setupAppListeners(store.dispatch), [store]);

  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <StatusBar barStyle="light-content" />
        <NavigationContainer theme={navigationTheme}>
          <RootNavigator />
        </NavigationContainer>
      </SafeAreaProvider>
    </Provider>
  );
}
