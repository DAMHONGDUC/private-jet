module.exports = {
  preset: '@react-native/jest-preset',
  // Picks Reanimated's and worklets' web code paths, which run without a UI thread.
  resolver: 'react-native-reanimated/jest/resolver',
  // Tests live in __tests__/, mirroring src/; __tests__/test-utils holds helpers, not tests.
  testMatch: ['<rootDir>/__tests__/**/*.test.[jt]s?(x)'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?|@react-navigation|react-native-reanimated|react-native-worklets|react-native-screens|react-native-safe-area-context|react-redux|@reduxjs/toolkit|redux|immer|reselect|redux-thunk|use-sync-external-store)/)',
  ],
};
