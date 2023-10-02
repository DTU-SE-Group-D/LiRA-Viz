module.exports = {
  propsParser: require('react-docgen-typescript').withDefaultConfig({
    skipChildrenPropWithoutDoc: false,
  }).parse,
  components: ['src/App.tsx', 'src/Components/**/*.{tsx,jsx,js,ts}'],
  ignore: [
    '**/__tests__/**',
    '**/*.test.{js,jsx,ts,tsx}',
    '**/*.spec.{js,jsx,ts,tsx}',
    '**/*.d.ts',
    'src/Components/**/constants.ts',
    'src/Components/**/Hooks/*.{tsx,jsx,js,ts}',
  ],
};
