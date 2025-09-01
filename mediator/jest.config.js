module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  clearMocks: true,
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageProvider: 'v8',
  collectCoverageFrom: [
    '<rootDir>/src/**/*.ts',
  ],
  testPathIgnorePatterns: [
    '<rootDir>/dist/',
  ],
  setupFilesAfterEnv: ['./jest.setup.ts'],
};
