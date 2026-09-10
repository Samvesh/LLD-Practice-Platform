/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  testMatch: ['**/*.test.ts'],
  // setupFiles runs BEFORE any test module is imported — sets dummy env vars
  // so that env.ts validation doesn't throw during import chains.
  setupFiles: ['<rootDir>/tests/setup.ts'],
};
