import { fireEvent, screen, waitFor } from '@testing-library/react-native';
import { createTestStore, renderWithStore } from '@test-utils/test-store';
import { authApi } from '@/features/auth/presentation/auth-api';
import { LoginScreen } from '@/features/auth/presentation/screens/LoginScreen';

async function signedOutStore() {
  const store = createTestStore();
  await store.dispatch(authApi.endpoints.signOut.initiate());
  return store;
}

test('a wrong password is refused, the demo account gets in', async () => {
  const store = await signedOutStore();
  await renderWithStore(<LoginScreen />, store);
  expect(store.getState().session.status).toBe('signedOut');

  await fireEvent.changeText(screen.getByTestId('login-email'), 'demo@blackjet.app');
  await fireEvent.changeText(screen.getByTestId('login-password'), 'not-the-one');
  await fireEvent.press(screen.getByTestId('login-submit'));
  expect(await screen.findByTestId('login-error')).toHaveTextContent('The email or password is incorrect.');

  await fireEvent.press(screen.getByTestId('login-fill-demo'));
  await fireEvent.press(screen.getByTestId('login-submit'));

  await waitFor(() => expect(store.getState().session.status).toBe('signedIn'));
  expect(store.getState().session.user?.fullName).toBe('Alexander Reed');
});

test('the Apple button signs in with the demo account', async () => {
  const store = await signedOutStore();
  await renderWithStore(<LoginScreen />, store);

  await fireEvent.press(screen.getByTestId('login-apple'));

  await waitFor(() => expect(store.getState().session.status).toBe('signedIn'));
});
