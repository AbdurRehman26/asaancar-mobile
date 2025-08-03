import DateTimePicker from '@react-native-community/datetimepicker';
import { Image as ExpoImage } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useContext, useEffect, useState } from 'react';
import { Alert, Platform, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import LocationPicker from '../components/LocationPicker';
import apiService from '../services/api';
import { AuthContext } from './_layout';

export default function CarBooking() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { isLoggedIn } = useContext(AuthContext);

  // Parse car data from params or use default
  let car = {
    id: 1,
    name: 'Toyota Camry',
    brand: 'Toyota',
    type: 'Sedan',
    transmission: 'Automatic',
    fuelType: 'Petrol',
    seats: 5,
    withDriver: 1500,
    withoutDriver: 1200,
    currency: 'PKR',
    image: 'https://picsum.photos/300/200?random=1'
  };

  try {
    if (params.car) {
      const parsedCar = JSON.parse(params.car as string);
      car = { ...car, ...parsedCar };
    }
  } catch (error) {

  }

  const [bookingType, setBookingType] = useState<'self' | 'driver'>('self');
  const [pickupDate, setPickupDate] = useState('');
  const [pickupTime, setPickupTime] = useState('');
  const [numberOfDays, setNumberOfDays] = useState('1');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<{
    latitude: number;
    longitude: number;
    address: string;
  } | null>(null);
  const [currentLocation, setCurrentLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  const [showLocationPicker, setShowLocationPicker] = useState(false);

  // Get current location on component mount
  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getCurrentLocation = async () => {
    try {
      // For demo purposes, we'll use a default location
      const defaultLocation = {
        latitude: 24.8607, // Karachi coordinates
        longitude: 67.0011,
      };
      
      setCurrentLocation(defaultLocation);
      
      // Set a default selected location
      const mockLocation = {
        latitude: defaultLocation.latitude,
        longitude: defaultLocation.longitude,
        address: 'Karachi, Pakistan (Default Location)',
      };
      setSelectedLocation(mockLocation);
    } catch (error) {

      // Set default location on error
      const defaultLocation = {
        latitude: 24.8607,
        longitude: 67.0011,
      };
      setCurrentLocation(defaultLocation);

      const mockLocation = {
        latitude: defaultLocation.latitude,
        longitude: defaultLocation.longitude,
        address: 'Karachi, Pakistan (Default Location)',
      };
      setSelectedLocation(mockLocation);
    }
  };



  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setPickupDate(selectedDate.toISOString().split('T')[0]);
    }
  };

  const handleTimeChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker(false);
    if (selectedTime) {
      setPickupTime(selectedTime.toTimeString().split(' ')[0].substring(0, 5));
    }
  };

  const handleBack = () => {

    try {
      // Navigate to the main screen since there's no back history
      router.replace('/(tabs)');
    } catch (error) {
      
      // Fallback to push if replace fails
      try {
        router.push('/(tabs)');
      } catch (pushError) {
        
      }
    }
  };

  const handleLocationSelect = (location: { latitude: number; longitude: number; address: string }) => {
    setSelectedLocation(location);
  };

  const handleBookNow = async () => {
    // Validation for non-logged in users
    if (!isLoggedIn) {
      if (!fullName.trim() || !phone.trim()) {
        Alert.alert('Required Fields', 'Please fill in your full name and phone number.');
        return;
      }
    }

    if (!pickupDate || !pickupTime) {
      Alert.alert('Booking Details', 'Please select pickup date and time.');
      return;
    }
    if (!selectedLocation) {
      Alert.alert('Location Required', 'Please select a pickup location.');
      return;
    }

    setIsBooking(true);
    try {
      console.log('Starting booking process...');
      console.log('Is logged in:', isLoggedIn);
      console.log('Booking data:', {
        car_id: car.id,
        car_name: car.name,
        booking_type: bookingType,
        pickup_date: pickupDate,
        pickup_time: pickupTime,
        number_of_days: numberOfDays,
        total_price: totalPrice,
      });

      const bookingData = {
        car_id: car.id,
        car_name: car.name,
        car_brand: car.brand,
        booking_type: bookingType,
        pickup_date: pickupDate,
        pickup_time: pickupTime,
        number_of_days: parseInt(numberOfDays || '1'),
        pickup_location: selectedLocation.address,
        pickup_latitude: selectedLocation.latitude,
        pickup_longitude: selectedLocation.longitude,
        total_price: totalPrice,
        currency: car.currency,
        // Guest booking fields
        ...(isLoggedIn ? {} : {
          full_name: fullName.trim(),
          phone: phone.trim(),
          email: email.trim() || null,
        }),
      };

      console.log('Calling API...');
      let response;
      if (isLoggedIn) {
        console.log('Calling createBooking API...');
        response = await apiService.createBooking(bookingData);
      } else {
        console.log('Calling createGuestBooking API...');
        response = await apiService.createGuestBooking(bookingData);
      }
      console.log('API Response:', response);

      if (response && response.id) {
        Alert.alert(
          'Booking Confirmed!', 
          `Your car booking has been successfully confirmed!\n\nBooking ID: ${response.id}\nTotal Amount: ${totalPrice} ${car.currency}`,
          [
            {
              text: 'OK',
              onPress: () => router.back()
            }
          ]
        );
      } else {
        Alert.alert('Booking Error', 'Failed to create booking. Please try again.');
      }
    } catch (error) {
      console.error('Booking error:', error);
      Alert.alert('Booking Error', 'Failed to create booking. Please check your connection and try again.');
    } finally {
      setIsBooking(false);
    }
  };

  const totalPrice = (bookingType === 'driver' ? car.withDriver : car.withoutDriver) * parseInt(numberOfDays || '1');

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f8f9fa' }}>
      {/* Modern Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => {
        
            handleBack();
          }}
          activeOpacity={0.7}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Book Your Car</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Car Details Card */}
        <View style={styles.carSection}>
          <View style={styles.carImageContainer}>
            <ExpoImage
              source={{ uri: car.image }}
              style={styles.carImage}
              contentFit="cover"
            />
            <View style={styles.carImageOverlay} />
          </View>
          
          <View style={styles.carInfo}>
            <Text style={styles.carName}>{car.name}</Text>
            <Text style={styles.carBrand}>{car.brand}</Text>
            
            <View style={styles.carFeatures}>
              <View style={styles.featureItem}>
                <Text style={styles.featureIcon}>👤</Text>
                <Text style={styles.featureText}>{car.seats} Seats</Text>
              </View>
              <View style={styles.featureItem}>
                <Text style={styles.featureIcon}>⚙️</Text>
                <Text style={styles.featureText}>{car.transmission}</Text>
              </View>
              <View style={styles.featureItem}>
                <Text style={styles.featureIcon}>⛽</Text>
                <Text style={styles.featureText}>{car.fuelType}</Text>
              </View>
              <View style={styles.featureItem}>
                <Text style={styles.featureIcon}>🚗</Text>
                <Text style={styles.featureText}>{car.type}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Booking Type Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Booking Type</Text>
          <View style={styles.bookingTypeContainer}>
          <TouchableOpacity
              style={[
                styles.bookingTypeButton,
                bookingType === 'self' && styles.bookingTypeActive
              ]}
              onPress={() => setBookingType('self')}
          >
              <Text style={styles.bookingTypeIcon}>🚗</Text>
              <Text style={[
                styles.bookingTypeText,
                bookingType === 'self' && styles.bookingTypeTextActive
              ]}>Self Drive</Text>
              <Text style={styles.bookingTypePrice}>{car.withoutDriver} {car.currency}</Text>
          </TouchableOpacity>
            
          <TouchableOpacity
              style={[
                styles.bookingTypeButton,
                bookingType === 'driver' && styles.bookingTypeActive
              ]}
              onPress={() => setBookingType('driver')}
          >
              <Text style={styles.bookingTypeIcon}>👨‍💼</Text>
              <Text style={[
                styles.bookingTypeText,
                bookingType === 'driver' && styles.bookingTypeTextActive
              ]}>With Driver</Text>
              <Text style={styles.bookingTypePrice}>{car.withDriver} {car.currency}</Text>
          </TouchableOpacity>
          </View>
        </View>

        {/* Pickup & Duration Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pickup & Duration</Text>
          
          {/* Pickup Date */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Pickup Date</Text>
            <TouchableOpacity 
              style={styles.dateTimeInput}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={styles.dateTimeText}>
                {pickupDate || 'Select Date'}
              </Text>
              <Text style={styles.calendarIcon}>📅</Text>
            </TouchableOpacity>
          </View>

          {/* Pickup Time */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Pickup Time</Text>
            <TouchableOpacity 
              style={styles.dateTimeInput}
              onPress={() => setShowTimePicker(true)}
            >
              <Text style={styles.dateTimeText}>
                {pickupTime || 'Select Time'}
              </Text>
              <Text style={styles.clockIcon}>🕐</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.dateTimeRow}>
            <View style={styles.dateTimeColumn}>
              <Text style={styles.dateTimeLabel}>Number of Days</Text>
              <View style={styles.durationDisplay}>
                <TouchableOpacity 
                  style={styles.daysButton}
                  onPress={() => {
                    const current = parseInt(numberOfDays || '1');
                    if (current > 1) {
                      setNumberOfDays((current - 1).toString());
                    }
                  }}
                >
                  <Text style={styles.daysButtonText}>-</Text>
                </TouchableOpacity>
                <Text style={styles.daysText}>{numberOfDays}</Text>
                <TouchableOpacity 
                  style={styles.daysButton}
                  onPress={() => {
                    const current = parseInt(numberOfDays || '1');
                    setNumberOfDays((current + 1).toString());
                  }}
                >
                  <Text style={styles.daysButtonText}>+</Text>
                </TouchableOpacity>
          </View>
        </View>
          </View>

          {/* Price Summary */}
          <View style={styles.priceSection}>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Total Price</Text>
              <Text style={styles.priceValue}>{totalPrice} {car.currency}</Text>
            </View>
            <Text style={styles.priceNote}>* Prices include all taxes and fees</Text>
          </View>
        </View>

        {/* Location Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pickup Location</Text>
          
          <TouchableOpacity 
            style={styles.locationPickerButton}
            onPress={() => setShowLocationPicker(true)}
          >
            <View style={styles.locationPickerContent}>
              <Text style={styles.locationPickerIcon}>🗺️</Text>
              <View style={styles.locationPickerText}>
                <Text style={styles.locationPickerTitle}>
                  {selectedLocation?.address || 'Select Pickup Location'}
                </Text>
                <Text style={styles.locationPickerSubtitle}>
                  {selectedLocation ? 'Tap to change location' : 'Tap to select location'}
                </Text>
              </View>
              <Text style={styles.locationPickerArrow}>›</Text>
            </View>
          </TouchableOpacity>

          {selectedLocation && (
            <View style={styles.selectedLocationInfo}>
              <Text style={styles.locationCoordinates}>
                {selectedLocation.latitude.toFixed(6)}, {selectedLocation.longitude.toFixed(6)}
              </Text>
            </View>
          )}
        </View>

        {/* Customer Information - Only show when not logged in */}
        {!isLoggedIn && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Your Information</Text>
            
            <TextInput
              style={styles.input}
              placeholder="Full Name *"
              value={fullName}
              onChangeText={setFullName}
            />
            
            <TextInput
              style={styles.input}
              placeholder="Phone Number *"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />
            
            <TextInput
              style={styles.input}
              placeholder="Email (Optional)"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
            />
          </View>
        )}

        {/* Price Summary */}
      </ScrollView>

      {/* Date Picker Modal */}
      {showDatePicker && (
        <DateTimePicker
          value={pickupDate ? new Date(pickupDate) : new Date()}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleDateChange}
          minimumDate={new Date()}
        />
      )}

      {/* Time Picker Modal */}
      {showTimePicker && (
        <DateTimePicker
          value={pickupTime ? new Date(`2000-01-01T${pickupTime}`) : new Date()}
          mode="time"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleTimeChange}
          is24Hour={false}
        />
      )}

      {/* Book Now Button */}
      <View style={styles.bottomContainer}>
        {isLoggedIn && (
          <TouchableOpacity style={styles.chatButton} onPress={() => router.push({
            pathname: '/(tabs)/chat',
            params: { storeId: '1', storeName: 'Car Rental Store' }
          })}>
            <Text style={styles.chatButtonText}>💬 Chat</Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity 
          style={[styles.bookButton, isBooking && styles.bookButtonDisabled]} 
          onPress={handleBookNow}
          disabled={isBooking}
        >
          <Text style={[styles.bookButtonText, isBooking && styles.bookButtonTextDisabled]}>
            {isBooking ? 'Booking...' : 'Book Now'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Location Picker Modal */}
      <LocationPicker
        visible={showLocationPicker}
        onClose={() => setShowLocationPicker(false)}
        onLocationSelect={handleLocationSelect}
        initialLocation={selectedLocation || undefined}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    paddingTop: 30,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#f8f0fa',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    fontSize: 20,
    color: '#7e246c',
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  headerSpacer: {
    width: 44,
  },
  scrollView: {
    flex: 1,
  },
  carSection: {
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#7e246c',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  carImageContainer: {
    position: 'relative',
    height: 200,
  },
  carImage: {
    width: '100%',
    height: '100%',
  },
  carImageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  carInfo: {
    padding: 20,
  },
  carName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  carBrand: {
    fontSize: 16,
    color: '#7e246c',
    fontWeight: '600',
    marginBottom: 16,
  },
  carFeatures: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f0fa',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  featureIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  featureText: {
    fontSize: 14,
    color: '#7e246c',
    fontWeight: '600',
  },
  section: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 20,
    borderRadius: 20,
    shadowColor: '#7e246c',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  bookingTypeContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  bookingTypeButton: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  bookingTypeActive: {
    backgroundColor: '#f8f0fa',
    borderColor: '#7e246c',
  },
  bookingTypeIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  bookingTypeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginBottom: 4,
  },
  bookingTypeTextActive: {
    color: '#7e246c',
  },
  bookingTypePrice: {
    fontSize: 14,
    fontWeight: '700',
    color: '#7e246c',
  },
  dateTimeRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  dateTimeColumn: {
    flex: 1,
  },
  dateTimeLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  dateTimeInput: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
    fontSize: 16,
    color: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#e9ecef',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateTimeText: {
    fontSize: 16,
    color: '#1a1a1a',
    fontWeight: '600',
  },
  calendarIcon: {
    fontSize: 20,
    color: '#7e246c',
  },
  clockIcon: {
    fontSize: 20,
    color: '#7e246c',
  },
  durationDisplay: {
    backgroundColor: '#7e246c',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 16,
  },
  durationText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    minWidth: 30,
    textAlign: 'center',
  },
  daysButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  daysButtonText: {
    color: '#7e246c',
    fontSize: 18,
    fontWeight: 'bold',
  },
  daysText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    minWidth: 30,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
    fontSize: 16,
    color: '#1a1a1a',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  priceSection: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 20,
    borderRadius: 20,
    shadowColor: '#7e246c',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  priceLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  priceValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#7e246c',
  },
  priceNote: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },
  bottomContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 20,
    paddingBottom: 40,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bookButton: {
    backgroundColor: '#7e246c',
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#7e246c',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    flex: 1, // Allow book button to take available space
  },
  bookButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  bookButtonDisabled: {
    backgroundColor: '#ccc',
    shadowOpacity: 0.1,
    elevation: 2,
  },
  bookButtonTextDisabled: {
    color: '#999',
  },
  chatButton: {
    backgroundColor: '#4CAF50', // A green color for chat
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
    flex: 1, // Allow chat button to take available space
    marginRight: 10, // Add some space between chat and book buttons
  },
  chatButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  mapContainer: {
    height: 250,
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#e9ecef',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  locationInfo: {
    padding: 16,
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
    marginBottom: 12,
  },
  useCurrentLocationButton: {
    backgroundColor: '#7e246c',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  useCurrentLocationText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  webMapPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f8ff',
    borderRadius: 12,
    padding: 20,
  },
  webMapText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  webMapSubtext: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  webMapButton: {
    backgroundColor: '#7e246c',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    shadowColor: '#7e246c',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  webMapButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
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
  mapGrid: {
    width: '100%',
    height: 100,
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  mapRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  mapCell: {
    width: '20%',
    height: 20,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    marginHorizontal: 2,
  },
  locationPickerButton: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    padding: 16,
    marginBottom: 8,
  },
  locationPickerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationPickerIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  locationPickerText: {
    flex: 1,
  },
  locationPickerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 2,
  },
  locationPickerSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  locationPickerArrow: {
    fontSize: 18,
    color: '#666',
    fontWeight: '600',
  },
  selectedLocationInfo: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  locationCoordinates: {
    fontSize: 12,
    color: '#666',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
}); 