export default {
  // Use babel-jest to transform files
  transform: {
    '^.+\\.js$': 'babel-jest',
  },
  
  // Test environment
  testEnvironment: 'node',
  
  // Patterns to detect test files
  testMatch: [
    '**/__tests__/**/*.js',
    '**/?(*.)+(spec|test).js'
  ],
  
  // Module file extensions
  moduleFileExtensions: ['js', 'json', 'node'],
  
  // Coverage configuration
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/**/*.test.js',
    '!src/**/__tests__/**'
  ],
  
  // Clear mocks between tests
  clearMocks: true,
  
  // Verbose output
  verbose: true,
  
  // Transform ignore patterns (don't transform node_modules except specific packages if needed)
  transformIgnorePatterns: [
    'node_modules/(?!(mysql2)/)'
  ]
};
