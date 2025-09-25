const babelJest = require('babel-jest');

module.exports = babelJest.createTransformer({
  presets: [
    [
      '@babel/preset-env',
      {
        targets: {
          node: 'current',
        },
      },
    ],
    [
      '@babel/preset-react',
      {
        runtime: 'automatic',
      },
    ],
  ],
  plugins: [
    // Custom plugin to replace import.meta.env
    function importMetaEnvPlugin() {
      return {
        visitor: {
          MemberExpression(path) {
            if (
              path.get('object').isMetaProperty() &&
              path.get('object.property').isIdentifier({ name: 'meta' }) &&
              path.get('property').isIdentifier({ name: 'env' })
            ) {
              path.replaceWithSourceString('({ VITE_FIREBASE_API_KEY: "test-api-key", VITE_FIREBASE_DATABASE_URL: "https://test.firebaseio.com" })');
            }
          },
        },
      };
    },
  ],
});