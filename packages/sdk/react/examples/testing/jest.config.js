// Jest config for the React SDK + client-testing-plugin example.
//
// `tsconfig.json` is the single source of truth for workspace path aliases.
// `pathsToModuleNameMapper` derives `moduleNameMapper` from those paths so the
// two configs cannot drift. We pin `react` and `react-dom` through
// `require.resolve` so jest always finds a single copy (whether hoisted to
// the workspace root or installed locally); duplicate React copies break
// hooks.
const path = require('path');
const { pathsToModuleNameMapper } = require('ts-jest');
const { compilerOptions } = require('./tsconfig.json');

const reactDir = path.dirname(require.resolve('react/package.json'));
const reactDomDir = path.dirname(require.resolve('react-dom/package.json'));

module.exports = {
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.tsx?$': ['ts-jest', { tsconfig: { esModuleInterop: true } }],
  },
  testMatch: ['**/*.test.ts?(x)'],
  testPathIgnorePatterns: ['node_modules', 'dist'],
  modulePathIgnorePatterns: ['dist'],
  setupFiles: ['./setup-jest.js'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  moduleNameMapper: {
    ...pathsToModuleNameMapper(compilerOptions.paths || {}, { prefix: '<rootDir>/' }),
    '^react$': reactDir,
    '^react-dom(.*)$': `${reactDomDir}$1`,
  },
};
