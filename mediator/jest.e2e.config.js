const baseConfig = require('./jest.base.config.js');

module.exports = {
  ...baseConfig,
  displayName: 'e2e',
  testMatch: [
    '<rootDir>/test/**/*.spec.ts',
  ],
  // Note: setupFilesAfterEnv is not included here
};
