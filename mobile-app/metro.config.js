const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// Add custom module resolution
config.resolver.sourceExts.push("js", "jsx", "ts", "tsx");

module.exports = config;
