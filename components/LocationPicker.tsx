// Integration of Google map in React Native using react-native-maps
// https://aboutreact.com/react-native-map-example/
// Import React
import React, { useEffect, useRef, useState } from 'react';
// Import required components
import { Alert, Modal, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
// Import Map and Marker
import * as Location from 'expo-location';
import { MAPS_CONFIG } from '../constants/Config';
import MapViewComponent from './MapView';

interface LocationPickerProps {
  visible: boolean;
  onClose: () => void;
  onLocationSelect: (location: { latitude: number; longitude: number; address: string }) => void;
  initialLocation?: { latitude: number; longitude: number; address: string };
}

const mapStyle = [
  {elementType: 'geometry', stylers: [{color: '#242f3e'}]},
  {elementType: 'labels.text.fill', stylers: [{color: '#746855'}]},
  {elementType: 'labels.text.stroke', stylers: [{color: '#242f3e'}]},
  {
    featureType: 'administrative.locality',
    elementType: 'labels.text.fill',
    stylers: [{color: '#d59563'}],
  },
  {
    featureType: 'poi',
    elementType: 'labels.text.fill',
    stylers: [{color: '#d59563'}],
  },
  {
    featureType: 'poi.park',
    elementType: 'geometry',
    stylers: [{color: '#263c3f'}],
  },
  {
    featureType: 'poi.park',
    elementType: 'labels.text.fill',
    stylers: [{color: '#6b9a76'}],
  },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{color: '#38414e'}],
  },
  {
    featureType: 'road',
    elementType: 'geometry.stroke',
    stylers: [{color: '#212a37'}],
  },
  {
    featureType: 'road',
    elementType: 'labels.text.fill',
    stylers: [{color: '#9ca5b3'}],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry',
    stylers: [{color: '#746855'}],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry.stroke',
    stylers: [{color: '#1f2835'}],
  },
  {
    featureType: 'road.highway',
    elementType: 'labels.text.fill',
    stylers: [{color: '#f3d19c'}],
  },
  {
    featureType: 'transit',
    elementType: 'geometry',
    stylers: [{color: '#2f3948'}],
  },
  {
    featureType: 'transit.station',
    elementType: 'labels.text.fill',
    stylers: [{color: '#d59563'}],
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{color: '#17263c'}],
  },
  {
    featureType: 'water',
    elementType: 'labels.text.fill',
    stylers: [{color: '#515c6d'}],
  },
  {
    featureType: 'water',
    elementType: 'labels.text.stroke',
    stylers: [{color: '#17263c'}],
  },
];

const LocationPicker: React.FC<LocationPickerProps> = ({ 
  visible, 
  onClose, 
  onLocationSelect, 
  initialLocation 
}) => {
  const mapRef = useRef<any>(null);
  const [selectedLocation, setSelectedLocation] = useState({
    latitude: initialLocation?.latitude || MAPS_CONFIG.DEFAULT_LATITUDE,
    longitude: initialLocation?.longitude || MAPS_CONFIG.DEFAULT_LONGITUDE,
  });
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(initialLocation?.address || 'Getting address...');
  const [isLoadingAddress, setIsLoadingAddress] = useState(false);

  // Get current location when component mounts
  useEffect(() => {
    if (visible && !initialLocation) {
      getCurrentLocation();
    } else if (initialLocation) {
      setSelectedLocation({
        latitude: initialLocation.latitude,
        longitude: initialLocation.longitude,
      });
      setSelectedAddress(initialLocation.address || 'Getting address...');
    }
  }, [visible, initialLocation]);

  // Get address from coordinates
  const getAddressFromCoordinates = async (latitude: number, longitude: number) => {
    try {
      setIsLoadingAddress(true);
      const addressResponse = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      if (addressResponse.length > 0) {
        const address = addressResponse[0];
        const addressParts = [
          address.street,
          address.district,
          address.city,
          address.region,
          address.country,
        ].filter(Boolean);
        
        const fullAddress = addressParts.join(', ');
        setSelectedAddress(fullAddress || 'Address not available');
      } else {
        setSelectedAddress('Address not available');
      }
    } catch (error) {
      console.error('Error getting address:', error);
      setSelectedAddress('Address not available');
    } finally {
      setIsLoadingAddress(false);
    }
  };

  const getCurrentLocation = async () => {
    try {
      setIsLoadingLocation(true);
      
      // Request location permissions
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Location Permission',
          'Permission to access location was denied. Using default location.',
          [{ text: 'OK' }]
        );
        return;
      }

      // Get current position
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
        timeInterval: 5000,
      });

      const newLocation = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };

      setSelectedLocation(newLocation);
      getAddressFromCoordinates(newLocation.latitude, newLocation.longitude);

      // Animate map to current location
      if (mapRef.current) {
        mapRef.current.animateToRegion({
          ...newLocation,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }, 1000);
      }

    } catch (error) {
      console.error('Error getting current location:', error);
      Alert.alert(
        'Location Error',
        'Could not get your current location. Using default location.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoadingLocation(false);
    }
  };

  const handleRegionChangeComplete = (region: any) => {
    // Update selected location to the center of the map
    const newLocation = {
      latitude: region.latitude,
      longitude: region.longitude,
    };
    
    setSelectedLocation(newLocation);
    getAddressFromCoordinates(newLocation.latitude, newLocation.longitude);
  };

  const handleConfirmLocation = () => {
    onLocationSelect({
      latitude: selectedLocation.latitude,
      longitude: selectedLocation.longitude,
      address: selectedAddress,
    });
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Select Location</Text>
          <TouchableOpacity onPress={handleConfirmLocation} style={styles.confirmButton}>
            <Text style={styles.confirmButtonText}>Confirm</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.mapContainer}>
          <MapViewComponent
            ref={mapRef}
            style={styles.mapStyle}
            initialRegion={{
              latitude: selectedLocation.latitude,
              longitude: selectedLocation.longitude,
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421,
            }}
            customMapStyle={mapStyle}
            onRegionChangeComplete={handleRegionChangeComplete}
            showsUserLocation={true}
            showsMyLocationButton={true}
          />
          
          {/* Center marker that stays fixed */}
          <View style={styles.centerMarkerContainer}>
            <View style={styles.centerMarker}>
              <View style={styles.centerMarkerDot} />
            </View>
          </View>
          
          {/* Address display overlay */}
          <View style={styles.addressContainer}>
            <View style={styles.addressCard}>
              <Text style={styles.addressLabel}>Selected Address:</Text>
              <Text style={styles.addressText} numberOfLines={3}>
                {isLoadingAddress ? 'Getting address...' : selectedAddress}
              </Text>
              <Text style={styles.coordinatesText}>
                {selectedLocation.latitude.toFixed(6)}, {selectedLocation.longitude.toFixed(6)}
              </Text>
            </View>
          </View>

          {/* Current location button */}
          <TouchableOpacity 
            style={styles.currentLocationButton}
            onPress={getCurrentLocation}
            disabled={isLoadingLocation}
          >
            <Text style={styles.currentLocationButtonText}>
              {isLoadingLocation ? 'Getting Location...' : '📍 Use My Location'}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
    backgroundColor: '#fff',
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    fontSize: 16,
    color: '#666',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  confirmButton: {
    padding: 8,
  },
  confirmButtonText: {
    fontSize: 16,
    color: '#7e246c',
    fontWeight: '600',
  },
  mapContainer: {
    flex: 1,
  },
  mapStyle: {
    flex: 1,
  },
  centerMarkerContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -20 }, { translateY: -20 }], // Adjust for marker size
  },
  centerMarker: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#7e246c',
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerMarkerDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#fff',
  },
  locationInfo: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 10,
    borderRadius: 5,
  },
  locationInfoText: {
    color: '#fff',
    fontSize: 16,
  },
  addressContainer: {
    position: 'absolute',
    top: 20, // Moved higher on the screen
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 15,
    borderRadius: 10,
    zIndex: 1,
  },
  addressCard: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: 10,
    borderRadius: 8,
  },
  addressLabel: {
    fontSize: 14,
    color: '#fff',
    marginBottom: 5,
  },
  addressText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
  coordinatesText: {
    fontSize: 14,
    color: '#fff',
    marginTop: 5,
  },
  currentLocationButton: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#7e246c',
    paddingVertical: 15,
    paddingHorizontal: 20,
    alignItems: 'center',
    zIndex: 1,
  },
  currentLocationButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },

});

export default LocationPicker;