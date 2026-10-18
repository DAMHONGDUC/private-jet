// A value the app branches on is an enum, never raw text: `status === 'signedIn'`
// hides typos and drifts from the type. Platform and typeof checks are the
// only string comparisons left, since React Native and JavaScript define them.
const STRING = 'Literal[raw=/^[\'"`]/]';
const ALLOWED_LEFT =
  ":not([left.type='UnaryExpression']):not([left.object.name='Platform'])";
const ALLOWED_RIGHT =
  ":not([right.type='UnaryExpression']):not([right.object.name='Platform'])";
const RAW_COMPARISON = 'Compare against an enum member, not raw text.';

module.exports = {
  root: true,
  extends: '@react-native',
  overrides: [
    {
      files: ['src/**/*.{ts,tsx}'],
      excludedFiles: [
        'src/**/data/models/**',
        'src/**/data/datasources/mock/**',
      ],
      rules: {
        'no-restricted-syntax': [
          'error',
          {
            selector: `BinaryExpression[operator=/^[!=]==?$/]${ALLOWED_LEFT} > ${STRING}.right`,
            message: RAW_COMPARISON,
          },
          {
            selector: `BinaryExpression[operator=/^[!=]==?$/]${ALLOWED_RIGHT} > ${STRING}.left`,
            message: RAW_COMPARISON,
          },
          {
            selector: `SwitchCase > ${STRING}.test`,
            message: RAW_COMPARISON,
          },
        ],
      },
    },
  ],
};
