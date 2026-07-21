// Load polyfills before anything else (must be require for guaranteed order)
require('./polyfills');

// Then load the normal Expo Router entry
require('expo-router/entry');
