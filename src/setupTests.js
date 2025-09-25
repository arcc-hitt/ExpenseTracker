import '@testing-library/jest-dom';

// Polyfill for TextEncoder
global.TextEncoder = require('util').TextEncoder;
global.TextDecoder = require('util').TextDecoder;