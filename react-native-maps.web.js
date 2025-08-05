// Web mock for react-native-maps
// This prevents the native module import error on web

import React from 'react';
import { View, Text } from 'react-native';

const MockMapView = React.forwardRef((props, ref) => {
  return React.createElement(View, {
    ...props,
    ref,
    style: [
      { backgroundColor: '#f0f0f0', justifyContent: 'center', alignItems: 'center' },
      props.style
    ]
  }, React.createElement(Text, null, 'Maps not available on web'));
});

const MockMarker = React.forwardRef((props, ref) => {
  return React.createElement(View, {
    ...props,
    ref,
    style: [
      { width: 20, height: 20, backgroundColor: 'red', borderRadius: 10 },
      props.style
    ]
  });
});

// Mock all possible exports from react-native-maps
module.exports = {
  default: MockMapView,
  MapView: MockMapView,
  Marker: MockMarker,
  PROVIDER_GOOGLE: 'google',
  PROVIDER_DEFAULT: 'default',
  // Add any other exports that might be used
  Callout: MockMarker,
  Polygon: MockMarker,
  Polyline: MockMarker,
  Circle: MockMarker,
  Overlay: MockMarker,
  Heatmap: MockMarker,
  Geojson: MockMarker,
}; 