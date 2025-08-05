const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Exclude react-native-maps from web builds
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

// Add resolver for web platform
config.resolver.resolverMainFields = ['react-native', 'browser', 'main'];

// Use web mock for react-native-maps only on web platform
config.resolver.alias = {
  ...config.resolver.alias,
  'react-native-maps': require.resolve('./react-native-maps.web.js'),
};

// Add platform-specific resolver
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (platform === 'web' && moduleName === 'react-native-maps') {
    return {
      filePath: require.resolve('./react-native-maps.web.js'),
      type: 'sourceFile',
    };
  }
  
  // Let Metro handle other modules normally
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config; 