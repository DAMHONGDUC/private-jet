module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    ['module-resolver', { root: ['./'], alias: { '@': './src', '@test-utils': './__tests__/test-utils' } }],
    // Must stay last: Reanimated 4 compiles worklets through this plugin.
    'react-native-worklets/plugin',
  ],
};
