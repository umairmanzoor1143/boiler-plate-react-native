// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require("expo/metro-config");

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);
config.resolver.sourceExts.push("cjs");
config.resolver.resolverMainFields = ["react-native", "browser", "main"];
config.watchFolders = [...(config.watchFolders || []), './src'];

module.exports = config;
