import * as Location from 'expo-location';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Modal,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { MAPS_CONFIG } from '../constants/Config';

// Google Maps TypeScript declarations
declare global {
  interface Window {
    google: any;
  }
}

interface LocationData {
  latitude: number;
  longitude: number;
  address: string;
}

interface LocationPickerProps {
  onLocationSelect: (location: LocationData) => void;
  initialLocation?: LocationData;
  visible: boolean;
  onClose: () => void;
}

export default function LocationPicker({
  onLocationSelect,
  initialLocation,
  visible,
  onClose,
}: LocationPickerProps) {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [loading, setLoading] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  


  useEffect(() => {
    if (visible) {
      initializeLocation();
      loadGoogleMaps();
    }
  }, [visible]);

  const loadGoogleMaps = () => {
    // Only load Google Maps on web platform
    if (Platform.OS !== 'web') {
      console.log('Google Maps not supported on mobile, using location services');
      setMapLoaded(false);
      return;
    }

    // Check if Google Maps is already loaded
    if (window.google && window.google.maps) {
      setMapLoaded(true);
      initializeWebMap();
      return;
    }

    // Load Google Maps JavaScript API with proper loading pattern
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${MAPS_CONFIG.API_KEY}&v=weekly&loading=async`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      setMapLoaded(true);
      // Small delay to ensure Google Maps is fully initialized
      setTimeout(() => {
        initializeWebMap();
      }, 100);
    };
    script.onerror = () => {
      console.error('Failed to load Google Maps API');
      setMapLoaded(false);
    };
    document.head.appendChild(script);
  };

  const initializeWebMap = () => {
    if (typeof window.google === 'undefined') {
      console.log('Google Maps not loaded yet');
      return;
    }

    const mapElement = document.getElementById('google-map');
    if (!mapElement) {
      console.log('Map element not found');
      return;
    }

    console.log('Initializing Google Maps...');
    
    // Suppress deprecation warning for Marker
    const originalWarn = console.warn;
    console.warn = (...args) => {
      if (args[0] && typeof args[0] === 'string' && args[0].includes('google.maps.Marker is deprecated')) {
        return; // Suppress this specific warning
      }
      originalWarn.apply(console, args);
    };

    const map = new window.google.maps.Map(mapElement, {
      center: { 
        lat: MAPS_CONFIG.DEFAULT_LATITUDE, 
        lng: MAPS_CONFIG.DEFAULT_LONGITUDE 
      },
      zoom: 15,
      mapTypeId: window.google.maps.MapTypeId.ROADMAP,
      disableDefaultUI: false,
      zoomControl: true,
      streetViewControl: false,
      fullscreenControl: false,
      mapTypeControl: false,
      scaleControl: true,
    });

    // Create a draggable marker that stays in the center
    const centerMarker = new window.google.maps.Marker({
      position: map.getCenter(),
      map: map,
      title: 'Selected Location',
      draggable: true,
      icon: {
        url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
          <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
            <circle cx="16" cy="16" r="12" fill="#7e246c" stroke="#fff" stroke-width="2"/>
            <circle cx="16" cy="16" r="4" fill="#fff"/>
          </svg>
        `),
        scaledSize: new window.google.maps.Size(32, 32),
        anchor: new window.google.maps.Point(16, 16),
      },
    });

    // Update marker position when map is moved
    map.addListener('center_changed', () => {
      const center = map.getCenter();
      if (center) {
        centerMarker.setPosition(center);
        
        // Update location state
        const newLocation: LocationData = {
          latitude: center.lat(),
          longitude: center.lng(),
          address: 'Selected Location',
        };
        setLocation(newLocation);

        // Use coordinates as address since Places API is deprecated
        newLocation.address = `${center.lat().toFixed(6)}, ${center.lng().toFixed(6)}`;
        setLocation(newLocation);
      }
    });

    // Update marker position when marker is dragged
    centerMarker.addListener('dragend', () => {
      const position = centerMarker.getPosition();
      if (position) {
        const newLocation: LocationData = {
          latitude: position.lat(),
          longitude: position.lng(),
          address: 'Selected Location',
        };
        setLocation(newLocation);

        // Use coordinates as address since Places API is deprecated
        newLocation.address = `${position.lat().toFixed(6)}, ${position.lng().toFixed(6)}`;
        setLocation(newLocation);
      }
    });

    // Set initial location
    const initialCenter = map.getCenter();
    if (initialCenter) {
      const newLocation: LocationData = {
        latitude: initialCenter.lat(),
        longitude: initialCenter.lng(),
        address: 'Selected Location',
      };
      setLocation(newLocation);

      // Use coordinates as address since Places API is deprecated
      newLocation.address = `${initialCenter.lat().toFixed(6)}, ${initialCenter.lng().toFixed(6)}`;
      setLocation(newLocation);
    }
  };

  const initializeLocation = async () => {
    setLoading(true);
    try {
      console.log('Initializing location for platform:', Platform.OS);
      
      // Check location permissions
      const { status } = await Location.requestForegroundPermissionsAsync();
      console.log('Location permission status:', status);
      
      if (status !== 'granted') {
        Alert.alert(
          'Location Permission',
          'Please enable location access to use the location picker.',
          [{ text: 'OK' }]
        );
        setLoading(false);
        return;
      }

      // Get current location
      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      
      console.log('Current location obtained:', currentLocation.coords);

      const newLocation: LocationData = {
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
        address: 'Current Location',
      };

      setLocation(newLocation);

      // Use coordinates as address since reverseGeocodeAsync is deprecated
      newLocation.address = `${currentLocation.coords.latitude.toFixed(6)}, ${currentLocation.coords.longitude.toFixed(6)}`;
      setLocation(newLocation);
      
      console.log('Location set successfully:', newLocation);
    } catch (error) {
      console.log('Error getting location:', error);
      // Use default location if current location fails
      const defaultLocation: LocationData = {
        latitude: MAPS_CONFIG.DEFAULT_LATITUDE,
        longitude: MAPS_CONFIG.DEFAULT_LONGITUDE,
        address: 'Karachi, Pakistan',
      };
      setLocation(defaultLocation);
      console.log('Using default location:', defaultLocation);
    } finally {
      setLoading(false);
    }
  };

  const handleUseCurrentLocation = async () => {
    setLoading(true);
    try {
      console.log('Getting current location...');
      
      // Request location permissions first
      const { status } = await Location.requestForegroundPermissionsAsync();
      console.log('Permission status:', status);
      
      if (status !== 'granted') {
        Alert.alert(
          'Permission Denied',
          'Location permission is required to use this feature. Please enable location access in your device settings.'
        );
        setLoading(false);
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      
      console.log('Current location obtained:', currentLocation.coords);

      const newLocation: LocationData = {
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
        address: 'Current Location',
      };

      // Use coordinates as address since reverseGeocodeAsync is deprecated
      newLocation.address = `${currentLocation.coords.latitude.toFixed(6)}, ${currentLocation.coords.longitude.toFixed(6)}`;

      setLocation(newLocation);
      console.log('Location updated:', newLocation);
    } catch (error) {
      console.log('Error getting current location:', error);
      Alert.alert('Error', 'Could not get current location. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleManualLocation = () => {
    // For now, we'll use a simple location selection
    // In a real app, you might want to integrate with a map service
    const manualLocation: LocationData = {
      latitude: MAPS_CONFIG.DEFAULT_LATITUDE + (Math.random() - 0.5) * 0.01,
      longitude: MAPS_CONFIG.DEFAULT_LONGITUDE + (Math.random() - 0.5) * 0.01,
      address: 'Selected Location',
    };
    setLocation(manualLocation);
  };

  const handleConfirmLocation = async () => {
    if (!location) {
      Alert.alert('Error', 'Please select a location.');
      return;
    }

    try {
      // Use coordinates as address since reverseGeocodeAsync is deprecated
      let finalLocation = { ...location };
      finalLocation.address = `${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`;

      onLocationSelect(finalLocation);
      onClose();
    } catch (error) {
      console.log('Error processing location:', error);
      onLocationSelect(location);
      onClose();
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={[styles.closeButton, { pointerEvents: 'auto' }]}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Select Location</Text>
          <TouchableOpacity onPress={handleConfirmLocation} style={[styles.confirmButton, { pointerEvents: 'auto' }]}>
            <Text style={styles.confirmButtonText}>Confirm</Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#7e246c" />
              <Text style={styles.loadingText}>Getting your location...</Text>
            </View>
          ) : (
            <View style={styles.locationContainer}>
                            {/* Map Section */}
              {Platform.OS === 'web' ? (
                <View style={styles.webMapContainer}>
                  {mapLoaded ? (
                    <>
                      <div 
                        id="google-map" 
                        style={{
                          width: '100%',
                          height: '300px',
                          borderRadius: '12px',
                          border: '1px solid #e0e0e0',
                          backgroundColor: '#f0f0f0'
                        }}
                      />
                      <Text style={styles.mapInstructions}>
                        Move the map to position the marker, or drag the marker directly
                      </Text>
                    </>
                  ) : (
                    <View style={styles.mapLoadingContainer}>
                      <ActivityIndicator size="large" color="#7e246c" />
                      <Text style={styles.mapLoadingText}>Loading Google Maps...</Text>
                    </View>
                  )}
                </View>
              ) : (
                <View style={styles.mobileMapContainer}>
                  <View style={styles.mapPlaceholder}>
                    <View style={styles.mapIconContainer}>
                      <Text style={styles.mapIcon}>🗺️</Text>
                    </View>
                    <Text style={styles.mapTitle}>Location Picker</Text>
                    <Text style={styles.mapSubtitle}>
                      Use current location or select manually
                    </Text>
                    
                    {/* Grid Pattern for Map Look */}
                    <View style={styles.mapGrid}>
                      {Array.from({ length: 6 }, (_, row) => (
                        <View key={row} style={styles.mapRow}>
                          {Array.from({ length: 8 }, (_, col) => (
                            <View key={col} style={styles.mapCell} />
                          ))}
                        </View>
                      ))}
                    </View>
                  </View>
                  <Text style={styles.mapInstructions}>
                    Use the buttons below to select your location
                  </Text>
                </View>
              )}

              {/* Location Info */}
              {location && (
                <View style={styles.locationInfo}>
                  <Text style={styles.locationLabel}>Selected Location:</Text>
                  <Text style={styles.locationAddress}>{location.address}</Text>
                  <Text style={styles.locationCoordinates}>
                    {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.currentLocationButton, { pointerEvents: loading ? 'none' : 'auto' }]}
            onPress={handleUseCurrentLocation}
            disabled={loading}
          >
            <Text style={styles.currentLocationButtonText}>📍 Use Current Location</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingBottom: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    fontSize: 24,
    color: '#666',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  confirmButton: {
    padding: 8,
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#7e246c',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  locationContainer: {
    flex: 1,
  },
  webMapContainer: {
    flex: 1,
    marginBottom: 20,
  },
  mobileMapContainer: {
    flex: 1,
    marginBottom: 20,
    borderRadius: 12,
    overflow: 'hidden',
  },
  mobileMap: {
    width: '100%',
    height: 300,
  },
  mapInstructions: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 10,
  },
  mapPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f8ff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  mapIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#7e246c',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  mapIcon: {
    fontSize: 30,
    color: '#fff',
  },
  mapTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  mapSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  mapGrid: {
    width: '100%',
    height: 120,
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  mapRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  mapCell: {
    width: '10%',
    height: 15,
    backgroundColor: '#e0e0e0',
    borderRadius: 2,
    marginHorizontal: 1,
  },
  locationInfo: {
    padding: 20,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  locationLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  locationAddress: {
    fontSize: 16,
    color: '#1a1a1a',
    fontWeight: '600',
    marginBottom: 8,
  },
  locationCoordinates: {
    fontSize: 12,
    color: '#666',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  actionButtons: {
    padding: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  currentLocationButton: {
    backgroundColor: '#7e246c',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: 'center',
  },
  currentLocationButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  manualSelectButton: {
    backgroundColor: '#f8f9fa',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  manualSelectButtonText: {
    color: '#666',
    fontSize: 14,
  },
  mapLoadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f8ff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  mapLoadingText: {
    color: '#666',
    fontSize: 14,
    marginTop: 10,
  },
}); 