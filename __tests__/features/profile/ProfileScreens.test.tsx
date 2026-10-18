import { fireEvent, screen } from '@testing-library/react-native';
import {
  TEST_NOW,
  createTestStore,
  renderWithStore,
} from '@test-utils/test-store';
import { Language } from '@/core/preferences/preferences-slice';
import { authApi } from '@/features/auth/presentation/auth-api';
import { AddCardScreen } from '@/features/profile/presentation/screens/AddCardScreen';
import { EditProfileScreen } from '@/features/profile/presentation/screens/EditProfileScreen';
import { HelpScreen } from '@/features/profile/presentation/screens/HelpScreen';
import { PaymentMethodsScreen } from '@/features/profile/presentation/screens/PaymentMethodsScreen';
import { ProfileScreen } from '@/features/profile/presentation/screens/ProfileScreen';

async function signedInStore() {
  const store = createTestStore();
  await store.dispatch(authApi.endpoints.restoreSession.initiate());
  return store;
}

const noop = () => {};

test('shows the member, their trips and wallet, and toggles notifications', async () => {
  const store = await signedInStore();
  await renderWithStore(
    <ProfileScreen
      onEditProfile={noop}
      onOpenPayments={noop}
      onOpenHelp={noop}
      onOpenLegal={noop}
      now={TEST_NOW}
    />,
    store,
  );

  expect(screen.getByTestId('profile-name')).toHaveTextContent(
    'Alexander Reed',
  );
  expect(await screen.findByText('Member since March 2023')).toBeOnTheScreen();
  expect(await screen.findByText(/Default: Visa •••• 4242/)).toBeOnTheScreen();

  expect(store.getState().settings.notifications.offers).toBe(false);
  await fireEvent(screen.getByTestId('notify-offers'), 'valueChange', true);
  expect(store.getState().settings.notifications.offers).toBe(true);
});

test('signs out after confirming', async () => {
  const store = await signedInStore();
  await renderWithStore(
    <ProfileScreen
      onEditProfile={noop}
      onOpenPayments={noop}
      onOpenHelp={noop}
      onOpenLegal={noop}
      now={TEST_NOW}
    />,
    store,
  );

  await fireEvent.press(screen.getByTestId('sign-out'));
  await fireEvent.press(screen.getByTestId('confirm-sign-out'));

  expect(store.getState().session.status).toBe('signedOut');
});

test('saves a new name and rejects an empty one', async () => {
  const store = await signedInStore();
  const onSaved = jest.fn();
  await renderWithStore(<EditProfileScreen onSaved={onSaved} />, store);

  await fireEvent.changeText(screen.getByTestId('profile-full-name'), '');
  await fireEvent.press(screen.getByTestId('save-profile'));
  // The problem sits under its field, and only that field is marked.
  expect(screen.getByTestId('profile-full-name-error')).toHaveTextContent(
    'Enter your full name.',
  );
  expect(screen.queryByTestId('profile-phone-error')).toBeNull();
  expect(onSaved).not.toHaveBeenCalled();

  await fireEvent.changeText(
    screen.getByTestId('profile-full-name'),
    'Alex Reed',
  );
  await fireEvent.press(screen.getByTestId('save-profile'));

  await screen.findByTestId('save-profile');
  expect(onSaved).toHaveBeenCalled();
  expect(store.getState().session.user?.fullName).toBe('Alex Reed');
});

test('adds a card, which then shows among the payment methods', async () => {
  const store = await signedInStore();
  const onAdded = jest.fn();
  const { unmount } = await renderWithStore(
    <AddCardScreen onAdded={onAdded} now={TEST_NOW} />,
    store,
  );

  await fireEvent.changeText(
    screen.getByTestId('card-number'),
    '5555555555554444',
  );
  expect(screen.getByTestId('card-number').props.value).toBe(
    '5555 5555 5555 4444',
  );
  await fireEvent.changeText(screen.getByTestId('card-expiry'), '1229');
  expect(screen.getByTestId('card-expiry').props.value).toBe('12/29');

  await fireEvent.press(screen.getByTestId('save-card'));
  expect(screen.getByTestId('card-cvc-error')).toHaveTextContent(
    'Enter the 3 or 4 digit security code.',
  );
  expect(screen.queryByTestId('card-number-error')).toBeNull();

  // Fixing the field clears its error before the next try.
  await fireEvent.changeText(screen.getByTestId('card-cvc'), '123');
  expect(screen.queryByTestId('card-cvc-error')).toBeNull();
  await fireEvent.press(screen.getByTestId('save-card'));
  await screen.findByTestId('save-card');
  expect(onAdded).toHaveBeenCalled();
  await unmount();

  await renderWithStore(<PaymentMethodsScreen onAddCard={noop} />, store);
  expect(await screen.findByText(/4444/)).toBeOnTheScreen();
});

test('makes a card the default and removes another', async () => {
  const store = await signedInStore();
  await renderWithStore(<PaymentMethodsScreen onAddCard={noop} />, store);

  await fireEvent.press(await screen.findByTestId('default-pm-amex'));
  expect(await screen.findByTestId('remove-pm-visa')).toBeOnTheScreen();
  expect(screen.queryByTestId('remove-pm-amex')).toBeNull();

  await fireEvent.press(screen.getByTestId('remove-pm-visa'));
  await fireEvent.press(screen.getByTestId('confirm-remove-card'));
  await screen.findByTestId('card-pm-amex');
  expect(screen.queryByTestId('card-pm-visa')).toBeNull();
});

test('opens one answer at a time', async () => {
  await renderWithStore(<HelpScreen />);

  expect(screen.getByTestId('faq-answer-0')).toBeOnTheScreen();
  await fireEvent.press(screen.getByTestId('faq-1'));
  expect(screen.queryByTestId('faq-answer-0')).toBeNull();
  expect(screen.getByTestId('faq-answer-1')).toHaveTextContent(/24 hours/);
});

test('switches the app to Vietnamese and back', async () => {
  const store = await signedInStore();
  await renderWithStore(
    <ProfileScreen
      onEditProfile={noop}
      onOpenPayments={noop}
      onOpenHelp={noop}
      onOpenLegal={noop}
      now={TEST_NOW}
    />,
    store,
  );

  await fireEvent.press(screen.getByTestId('menu-language'));
  expect(screen.getByTestId('language-sheet')).toBeOnTheScreen();
  await fireEvent.press(screen.getByTestId('language-vi'));
  expect(store.getState().preferences.language).toBe(Language.Vietnamese);
  expect(screen.queryByTestId('language-sheet')).toBeNull();
  expect(screen.getByTestId('menu-language')).toHaveTextContent(/Tiếng Việt/);
  expect(screen.getByText('Tài khoản')).toBeOnTheScreen();
  expect(screen.getByTestId('sign-out')).toHaveTextContent('Đăng xuất');

  await fireEvent.press(screen.getByTestId('menu-language'));
  await fireEvent.press(screen.getByTestId('language-en'));
  expect(screen.getByText('Account')).toBeOnTheScreen();
});

test('pins the app to dark or light, or leaves it to the phone', async () => {
  const store = await signedInStore();
  await renderWithStore(
    <ProfileScreen
      onEditProfile={noop}
      onOpenPayments={noop}
      onOpenHelp={noop}
      onOpenLegal={noop}
      now={TEST_NOW}
    />,
    store,
  );
  expect(store.getState().preferences.themeMode).toBe('system');

  expect(screen.getByTestId('menu-appearance')).toHaveTextContent(/System/);

  await fireEvent.press(screen.getByTestId('menu-appearance'));
  await fireEvent.press(screen.getByTestId('theme-mode-dark'));
  expect(store.getState().preferences.themeMode).toBe('dark');
  expect(screen.queryByTestId('appearance-sheet')).toBeNull();
  expect(screen.getByTestId('menu-appearance')).toHaveTextContent(/Dark/);

  await fireEvent.press(screen.getByTestId('menu-appearance'));
  await fireEvent.press(screen.getByTestId('theme-mode-system'));
  expect(store.getState().preferences.themeMode).toBe('system');
});

test('the help screen keeps the concierge at the bottom of the screen', async () => {
  await renderWithStore(<HelpScreen onContactConcierge={noop} />);

  const actions = screen.getByTestId('bottom-actions');
  expect(actions).toContainElement(screen.getByTestId('help-concierge'));
  // Under the list, not in it: 8 pt above the (mocked, zero) safe area.
  expect(actions).toHaveStyle({ paddingBottom: 8 });
});
