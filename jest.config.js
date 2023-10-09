module.exports = {
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  transform: {
    '^.+\\.ts$': 'ts-jest',
    '^.+\\.js$': 'babel-jest',
  },
  testMatch: ['<rootDir>/test/**/*.test.{js,ts}'],
  collectCoverage: true,
  coverageDirectory: './coverage',
  globals: {
    'ts-jest': {
      isolatedModules: true,
    },
  }
};
