/* eslint-env jest */

// Reanimated has no UI thread under Jest: its mock applies animated values at
// once and turns layout animations into no-ops.
jest.mock('react-native-worklets', () => require('react-native-worklets/lib/module/mock'));
jest.mock('react-native-reanimated', () => require('react-native-reanimated/mock'));

jest.mock('react-native-safe-area-context', () => {
  const actual = jest.requireActual('react-native-safe-area-context');
  const insets = { top: 0, right: 0, bottom: 0, left: 0 };
  return {
    ...actual,
    useSafeAreaInsets: () => insets,
    SafeAreaProvider: ({ children }) => children,
  };
});

// Required at top level: RNTL registers its own cleanup hooks on import.
const { cleanup } = require('@testing-library/react-native');
const { resetTestStores } = require('./__tests__/test-utils/test-store');

// Unmount first, then drop the cached queries and their removal timers.
afterEach(async () => {
  await cleanup();
  resetTestStores();
});
