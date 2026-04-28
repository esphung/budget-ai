const { createDefaultPreset } = require('ts-jest');

const tsJestTransformCfg = createDefaultPreset().transform;

/** @type {import("jest").Config} **/
module.exports = {
  testEnvironment: 'node',
  transform: {
    ...tsJestTransformCfg,
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  testMatch: ['**/?(*.)+(spec|test).[tj]s?(x)'],
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
  coverageDirectory: 'coverage',
  collectCoverageFrom: ['src/**/*.{ts,tsx}', '!src/**/*.d.ts'],
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    'src/index.ts',
    'src/routes/index.ts',
  ],
  coverageReporters: ['text', 'lcov'],
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.json',
    },
  },
};
