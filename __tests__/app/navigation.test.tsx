import {
  NavigationContainer,
  createNavigationContainerRef,
  type NavigationState,
} from '@react-navigation/native';
import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { RootNavigator } from '@/app/navigation/RootNavigator';
import type { AppStackParamList } from '@/app/navigation/types';
import { createTestStore } from '@test-utils/test-store';

const TABS = ['DashboardTab', 'TripsTab', 'ProfileTab'];

async function renderApp() {
  const ref = createNavigationContainerRef<AppStackParamList>();
  await render(
    <Provider store={createTestStore()}>
      <NavigationContainer ref={ref}>
        <RootNavigator />
      </NavigationContainer>
    </Provider>,
  );
  await screen.findByTestId('booking-card');
  return ref;
}

const rootRoutes = (state: NavigationState | undefined) =>
  state?.routes.map(route => route.name);

/** The tab bar belongs to `Main`, so a page shows without it only when it sits beside `Main`. */
test('every tab is a single screen, so the tab bar shows on the three tabs only', async () => {
  const ref = await renderApp();

  const main = ref.getRootState()?.routes.find(route => route.name === 'Main');
  const tabs = main?.state as NavigationState | undefined;
  expect(tabs?.routes.map(route => route.name)).toEqual(TABS);
  tabs?.routes.forEach(route => expect(route.state).toBeUndefined());
});

test('a trip opens over the tabs', async () => {
  const ref = await renderApp();

  await act(() => ref.navigate('Main', { screen: 'TripsTab' }));
  const [trip] = await screen.findAllByTestId(/^trip-BJ/);
  await fireEvent.press(trip);

  expect(rootRoutes(ref.getRootState())).toEqual(['Main', 'TripDetail']);
  expect(await screen.findByTestId('trip-reference')).toBeOnTheScreen();
});

test('the profile pages open over the tabs', async () => {
  const ref = await renderApp();

  await act(() => ref.navigate('Main', { screen: 'ProfileTab' }));
  await fireEvent.press(await screen.findByTestId('menu-personal'));
  expect(rootRoutes(ref.getRootState())).toEqual(['Main', 'EditProfile']);

  await act(() => ref.goBack());
  await act(() => ref.navigate('PaymentMethods'));
  await fireEvent.press(await screen.findByTestId('add-card'));
  expect(rootRoutes(ref.getRootState())).toEqual([
    'Main',
    'PaymentMethods',
    'AddCard',
  ]);
});
