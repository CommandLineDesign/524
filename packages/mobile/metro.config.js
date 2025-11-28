// Learn more https://docs.expo.dev/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Transform node_modules that use import.meta (like zustand)
config.transformer = {
  ...config.transformer,
  getTransformOptions: async () => ({
    transform: {
      experimentalImportSupport: false,
      inlineRequires: true,
    },
  }),
};

// Don't use package exports to avoid ESM build with import.meta
// This will make Metro use the CJS build from "main" field
config.resolver = {
  ...config.resolver,
  unstable_enablePackageExports: false,
};

module.exports = config;

