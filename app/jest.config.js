module.exports = {
  preset: 'jest-expo',
  setupFilesAfterEnv: ['@testing-library/jest-native/extend-expect'],
  transformIgnorePatterns: [
    'node_modules/(?!(jest-)?react-native|@react-native|@react-navigation|@expo|expo(?!-app-loading)|@expo/vector-icons|@supabase|@shopify)'
  ],
  moduleFileExtensions: ['ts', 'tsx', 'js'],
};
