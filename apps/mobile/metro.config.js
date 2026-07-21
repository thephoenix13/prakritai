const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');
const path = require('path');

const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// Watch all files in the monorepo so shared package changes hot-reload
config.watchFolders = [monorepoRoot];

// Resolve packages from both local and root node_modules
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(monorepoRoot, 'node_modules'),
];

// Stub out opentelemetry — Supabase imports it optionally but Metro can't bundle it on web
config.resolver.extraNodeModules = {
  '@opentelemetry/api': path.resolve(projectRoot, 'opentelemetry-stub.js'),
  'expo-notifications': path.resolve(projectRoot, 'expo-notifications-stub.js'),
};

// Force @tanstack packages to use their pre-built legacy output (no private fields)
// instead of raw TypeScript source which Hermes can't handle
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName.startsWith('@tanstack/')) {
    // Remove 'react-native' from the condition names to avoid resolving to src/
    const newContext = {
      ...context,
      unstable_conditionNames: (context.unstable_conditionNames || []).filter(
        (c) => c !== 'react-native'
      ),
    };
    return newContext.resolveRequest(newContext, moduleName, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

// Add DOMException polyfill before all other code (including RN initialization)
const originalGetPolyfills = config.serializer?.getPolyfills;
config.serializer = {
  ...config.serializer,
  getPolyfills(context) {
    const defaults = originalGetPolyfills ? originalGetPolyfills(context) : [];
    return [
      path.resolve(projectRoot, 'polyfills.js'),
      ...defaults,
    ];
  },
};

module.exports = withNativeWind(config, { input: './global.css' });
