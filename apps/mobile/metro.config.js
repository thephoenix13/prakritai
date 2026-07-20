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
};

module.exports = withNativeWind(config, { input: './global.css' });
