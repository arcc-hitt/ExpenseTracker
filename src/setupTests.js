import '@testing-library/jest-dom';

// Polyfill for TextEncoder
global.TextEncoder = require('util').TextEncoder;
global.TextDecoder = require('util').TextDecoder;

// Polyfills for Firebase
global.ReadableStream = require('web-streams-polyfill').ReadableStream;
global.WritableStream = require('web-streams-polyfill').WritableStream;
global.TransformStream = require('web-streams-polyfill').TransformStream;

// Mock import.meta.env for Vite environment variables
Object.defineProperty(global, 'import', {
  value: {
    meta: {
      env: {
        VITE_FIREBASE_API_KEY: 'test-api-key',
        VITE_FIREBASE_DATABASE_URL: 'https://test.firebaseio.com',
      },
    },
  },
  writable: true,
});