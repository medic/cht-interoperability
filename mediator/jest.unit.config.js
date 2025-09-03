const baseConfig = require('./jest.base.config.js');

module.exports = {
  ...baseConfig,
  displayName: 'unit',
  testMatch: [
    '<rootDir>/src/**/*.spec.ts',
    '!<rootDir>/test/**/*',
  ],
  setupFilesAfterEnv: ['./jest.setup.ts'],
};
