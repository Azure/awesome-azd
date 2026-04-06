module.exports = {
    testMatch: ['<rootDir>/test/**/*.test.ts'],
    transformIgnorePatterns: [
        'node_modules/(?!@babel/runtime/helpers/esm)'
    ]
};
