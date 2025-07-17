import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useContext, useState } from 'react';
import { Dimensions, Image, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AuthContext } from './_layout';

const { width } = Dimensions.get('window');
const PLACEHOLDER_IMAGE = 'http://asaancar.test/images/car-placeholder.jpeg';

export default function CarBooking() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const car = params && params.car ? JSON.parse(params.car as string) : {};

  const [imageError, setImageError] = useState(false);
  const { isLoggedIn } = useContext(AuthContext);

  // Robust image field detection
  const getCarImage = () => {
    if (imageError) return PLACEHOLDER_IMAGE;
    const possibleFields = [
      'image', 'image_url', 'imageUrl',
      'photo', 'photo_url', 'photoUrl',
      'thumbnail', 'thumbnail_url', 'thumbnailUrl',
    ];
    for (const field of possibleFields) {
      if (car[field] && typeof car[field] === 'string') {
        return car[field];
      }
    }
    return PLACEHOLDER_IMAGE;
  };

  const carImage = getCarImage();
  const carName = car.name || car.model || car.title || 'Toyota Fortuner Legender';
  const carType = car.type || 'SUV';
  const carRating = car.rating || '4.5';

  const [rentType, setRentType] = useState<'self' | 'with'>('self');
  const [pickupDate] = useState('4 Oct');
  const [pickupTime] = useState('10:00 AM');
  const [returnDate] = useState('5 Oct');
  const [returnTime] = useState('10:00 AM');

  const handleBack = () => {
    if (router.canGoBack && router.canGoBack()) {
      router.back();
    } else {
      router.replace('/'); // Go to Home (car listing) screen
    }
  };

  const handleContinue = () => {
    if (!isLoggedIn) {
      router.push('/SignIn');
    } else {
      // Proceed with booking (for now, just alert)
      alert('Booking confirmed!');
    }
  };

  return (
    <View style={styles.container} pointerEvents="box-none">
      {/* Car Image Overlapping Card */}
      <View style={styles.imageWrapper}>
        <Image
          source={{ uri: carImage }}
          style={styles.carImage}
          resizeMode="contain"
          onError={() => setImageError(true)}
          defaultSource={{ uri: PLACEHOLDER_IMAGE }}
        />
      </View>

      {/* Card */}
      <View style={styles.card}>
        <View style={styles.cardHeaderRow}>
          <Text style={styles.carType}>{carType}</Text>
          <View style={styles.ratingRow}>
            <Text style={styles.starIcon}>★</Text>
            <Text style={styles.ratingText}>{carRating}</Text>
          </View>
        </View>
        <Text style={styles.carName}>{carName}</Text>
        <View style={styles.divider} />
        <Text style={styles.sectionLabel}>BOOK CAR</Text>
        <Text style={styles.sectionTitle}>Rent Type</Text>
        <View style={styles.rentTypeRow}>
          <TouchableOpacity
            style={[styles.rentTypeBtn, rentType === 'self' && styles.rentTypeBtnActive]}
            onPress={() => setRentType('self')}
          >
            <Text style={[styles.rentTypeBtnText, rentType === 'self' && styles.rentTypeBtnTextActive]}>Self-Driver</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.rentTypeBtn, rentType === 'with' && styles.rentTypeBtnActive]}
            onPress={() => setRentType('with')}
          >
            <Text style={[styles.rentTypeBtnText, rentType === 'with' && styles.rentTypeBtnTextActive]}>With Driver</Text>
          </TouchableOpacity>
        </View>
        {rentType === 'with' && (
          <Text style={styles.driverCostInfo}>Additional $18/hr Driver Cost if You Choose With Driver Option</Text>
        )}
        <Text style={styles.sectionTitle}>Pick-Up Date and Time</Text>
        <View style={styles.dateTimeRow}>
          <View style={styles.dateTimeBox}>
            <Text style={styles.dateTimeLabel}>Date</Text>
            <Text style={styles.dateTimeValue}>{pickupDate}</Text>
            <Text style={styles.dateTimeIcon}>📅</Text>
          </View>
          <View style={styles.dateTimeBox}>
            <Text style={styles.dateTimeLabel}>Time</Text>
            <Text style={styles.dateTimeValue}>{pickupTime}</Text>
            <Text style={styles.dateTimeIcon}>⏰</Text>
          </View>
        </View>
        <Text style={styles.sectionTitle}>Return Date and Time</Text>
        <View style={styles.dateTimeRow}>
          <View style={styles.dateTimeBox}>
            <Text style={styles.dateTimeLabel}>Date</Text>
            <Text style={styles.dateTimeValue}>{returnDate}</Text>
            <Text style={styles.dateTimeIcon}>📅</Text>
          </View>
          <View style={styles.dateTimeBox}>
            <Text style={styles.dateTimeLabel}>Time</Text>
            <Text style={styles.dateTimeValue}>{returnTime}</Text>
            <Text style={styles.dateTimeIcon}>⏰</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.continueBtn} onPress={handleContinue}>
          <Text style={styles.continueBtnText}>Continue</Text>
        </TouchableOpacity>
      </View>

      {/* Header (rendered last, always on top) */}
      <View style={styles.headerRow} pointerEvents="auto">
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Text style={styles.backIcon}>{'\u25C0'}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Book Car</Text>
        <View style={{ width: 32 }} />
      </View>
    </View>
  );
}

const CARD_WIDTH = width - 32;
const IMAGE_SIZE = 160;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FB',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 60 : 30, // Add padding to avoid overlap
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingTop: Platform.OS === 'ios' ? 60 : 30,
    paddingHorizontal: 16,
    marginBottom: 8,
    backgroundColor: '#fff',
    zIndex: 10,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  backButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  backIcon: {
    fontSize: 20,
    color: '#222',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#222',
  },
  imageWrapper: {
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Platform.OS === 'ios' ? 110 : 80, // Add margin to push image below header
    marginBottom: -IMAGE_SIZE / 2, // Pull card up to touch image, but not overlap
    zIndex: 2,
  },
  carImage: {
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,
    borderRadius: 20,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.10,
    shadowRadius: 10,
    elevation: 6,
  },
  card: {
    marginTop: 0, // Remove extra margin, handled by imageWrapper
    width: CARD_WIDTH,
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  carType: {
    color: '#7e246c',
    fontWeight: '600',
    fontSize: 14,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  starIcon: {
    color: '#FFD700',
    fontSize: 16,
    marginRight: 2,
  },
  ratingText: {
    fontSize: 14,
    color: '#222',
    fontWeight: '600',
  },
  carName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#222',
    marginBottom: 12,
  },
  divider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginVertical: 12,
  },
  sectionLabel: {
    color: '#8E8E93',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1.2,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222',
    marginTop: 8,
    marginBottom: 8,
  },
  rentTypeRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
  },
  rentTypeBtn: {
    flex: 1,
    backgroundColor: '#F2F4F7',
    borderRadius: 16,
    paddingVertical: 12,
    alignItems: 'center',
  },
  rentTypeBtnActive: {
    backgroundColor: '#7e246c',
  },
  rentTypeBtnText: {
    color: '#222',
    fontWeight: '600',
    fontSize: 15,
  },
  rentTypeBtnTextActive: {
    color: '#fff',
  },
  driverCostInfo: {
    backgroundColor: '#F2F4F7',
    color: '#7e246c',
    fontSize: 13,
    borderRadius: 8,
    padding: 8,
    marginBottom: 8,
  },
  dateTimeRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 8,
  },
  dateTimeBox: {
    flex: 1,
    backgroundColor: '#F2F4F7',
    borderRadius: 12,
    alignItems: 'center',
    paddingVertical: 12,
    marginBottom: 4,
  },
  dateTimeLabel: {
    color: '#8E8E93',
    fontSize: 12,
    marginBottom: 2,
  },
  dateTimeValue: {
    color: '#222',
    fontWeight: '600',
    fontSize: 15,
    marginBottom: 2,
  },
  dateTimeIcon: {
    fontSize: 18,
    color: '#7e246c',
  },
  continueBtn: {
    backgroundColor: '#7e246c',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 18,
  },
  continueBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 17,
    letterSpacing: 0.5,
  },
}); 