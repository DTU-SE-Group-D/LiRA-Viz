const webpackConfig = require('react-scripts/config/webpack.config.js');

module.exports = {
  title: 'Frontend Components',
  propsParser: require('react-docgen-typescript').withCustomConfig(
    `${process.cwd()}/tsconfig.json`,
    {
      skipChildrenPropWithoutDoc: false,
    },
  ).parse,
  components: ['src/App.tsx', 'src/Components/**/*.{tsx,jsx,js,ts}'],
  webpackConfig: {
    ...webpackConfig(process.env.NODE_ENV),
    cache: false, // DON'T REMOVE THIS!!!!!!
  },
  ignore: [
    '**/__tests__/**',
    '**/*.test.{js,jsx,ts,tsx}',
    '**/*.spec.{js,jsx,ts,tsx}',
    '**/*.d.ts',
    'src/Components/**/constants.ts',
    'src/Components/**/Hooks/*.{tsx,jsx,js,ts}',
  ],
};
