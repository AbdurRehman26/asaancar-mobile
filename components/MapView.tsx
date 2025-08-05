import React from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';

// Web fallback component
const WebMapFallback: React.FC<{ style?: any }> = ({ style }) => (
  <View style={[styles.webFallback, style]}>
    <Text style={styles.webFallbackText}>
      Maps are not available on web platform.
    </Text>
    <Text style={styles.webFallbackText}>
      Please use the mobile app for location selection.
    </Text>
  </View>
);

// Platform-specific map imports
let NativeMapView: any = null;
let NativeMarker: any = null;

// Import react-native-maps (will use mock on web)
try {
  const Maps = require('react-native-maps');
  NativeMapView = Maps.default;
  NativeMarker = Maps.Marker;
} catch (error) {
  console.warn('react-native-maps not available:', error);
}

interface MapViewProps {
  style?: any;
  initialRegion?: any;
  customMapStyle?: any;
  onRegionChangeComplete?: (region: any) => void;
  showsUserLocation?: boolean;
  showsMyLocationButton?: boolean;
  ref?: any;
}

const MapViewComponent: React.FC<MapViewProps> = React.forwardRef((props, ref) => {
  // Always return web fallback on web platform
  if (Platform.OS === 'web') {
    return <WebMapFallback style={props.style} />;
  }

  // Return fallback if native map is not available
  if (!NativeMapView) {
    return <WebMapFallback style={props.style} />;
  }

  // Return native map component
  return <NativeMapView ref={ref} {...props} />;
});

const styles = StyleSheet.create({
  webFallback: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 20,
  },
  webFallbackText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 10,
  },
});

export default MapViewComponent; 