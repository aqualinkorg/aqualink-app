/**
 * For a detailed explanation regarding each configuration property, visit:
 * https://jestjs.io/docs/configuration
 */

import nextJest from 'next/jest';

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: './',
});

const config: any = {
  // Indicates which provider should be used to instrument code for coverage
  coverageProvider: 'v8',
  // A path to a module which exports an async function that is triggered once before all test suites
  globalSetup: './src/global-setup.js',
  // An array of directory names to be searched recursively up from the requiring module's location
  moduleDirectories: ['src', 'node_modules'],
  // An array of file extensions your modules use
  moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx', 'json'],
  // A map from regular expressions to module names or to arrays of module names that allow to stub out resources with a single module
  moduleNameMapper: {
    // '^axios$': 'axios/dist/node/axios.cjs',
    '^csv-stringify/browser/esm/sync':
      '<rootDir>/../../node_modules/csv-stringify/dist/cjs/sync.cjs',
  },
  // The root directory that Jest should scan for tests and modules within
  rootDir: './',
  // A list of paths to modules that run some code to configure or set up the testing framework before each test
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  // A list of paths to snapshot serializer modules Jest should use for snapshot testing
  snapshotSerializers: ['enzyme-to-json/serializer'],
  // The test environment that will be used for testing
  testEnvironment: 'jsdom',
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
export default async () => ({
  ...(await createJestConfig(config)()),
  // Next/jest overrides the transformIgnorePatterns, so we need to set it here
  transformIgnorePatterns: ['!node_modules/react-leaflet/'],
});
