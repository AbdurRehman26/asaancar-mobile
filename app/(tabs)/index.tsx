import { DrawerNavigationProp } from '@react-navigation/drawer';
import { useNavigation } from '@react-navigation/native';
import { Image as ExpoImage } from 'expo-image';
import { useRouter } from 'expo-router';
import React, { useContext, useState } from 'react';
import { Dimensions, FlatList, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { FilterContext } from '../_layout';

const { width } = Dimensions.get('window');
const durations = ['Hourly', 'Daily', 'Weekly'];
const API_BASE = 'http://asaancar.test/api';

const brands = [
  { id: '1', name: 'BMW', logo: '🚗' },
  { id: '2', name: 'Toyota', logo: '🚗' },
  { id: '3', name: 'Mercedes', logo: '🚗' },
  { id: '4', name: 'Tesla', logo: '🚗' },
  { id: '5', name: 'Honda', logo: '🚗' },
  { id: '6', name: 'Ford', logo: '🚗' },
];

function BrandItem({ brand }: { brand: any }) {
  return (
    <TouchableOpacity style={styles.brandItem}>
      <View style={styles.brandIcon}>
        <Text style={styles.brandLogo}>{brand.logo}</Text>
      </View>
      <Text style={styles.brandName}>{brand.name}</Text>
    </TouchableOpacity>
  );
}

const CarCard = React.memo(function CarCard({ car }: { car: any }) {
  const [imageError, setImageError] = useState(false);
  const router = useRouter();
  
  const getPrice = () => {
    if (typeof car.price === 'string') return car.price;
    if (typeof car.price === 'number') return `$${car.price}/hr`;
    if (car.price && typeof car.price === 'object') {
      return `$${car.price.amount || car.price.value || 25}/hr`;
    }
    return '$25.00/hr';
  };

  // Try different possible image field names
  const getImageSource = () => {
    // If image failed to load, use fallback
    if (imageError) {
      return { uri: 'http://asaancar.test/images/car-placeholder.jpeg' };
    }
    
    const possibleImageFields = ['image', 'image_url', 'imageUrl', 'photo', 'photo_url', 'photoUrl', 'thumbnail', 'thumbnail_url', 'thumbnailUrl'];
    
    for (const field of possibleImageFields) {
      if (car[field] && typeof car[field] === 'string') {
        
        // Fix truncated URLs - if it ends with "cars+qui", complete it
        let imageUrl = car[field];
        if (imageUrl.includes('via.placeholder.com') && imageUrl.endsWith('cars+qui')) {
          imageUrl = imageUrl + 'et';
        }
        
        // Ensure URL is properly encoded
        try {
          const url = new URL(imageUrl);
          return { uri: url.toString() };
        } catch (error) {
          // Try to fix common URL issues
          if (!imageUrl.startsWith('http')) {
            imageUrl = 'https://' + imageUrl;
          }
          return { uri: imageUrl };
        }
      }
    }
    
    return { uri: 'http://asaancar.test/images/car-placeholder.jpeg' };
  };

  return (
    <TouchableOpacity onPress={() => router.push({ pathname: '/CarBooking', params: { car: JSON.stringify(car) } })} activeOpacity={0.9}>
      <View style={styles.carCard}>
        <View style={styles.carCardHeader}>
          <View style={styles.carRating}>
            <Text style={styles.starIcon}>⭐</Text>
            <Text style={styles.ratingText}>4.9</Text>
          </View>
          <TouchableOpacity style={styles.favoriteButton}>
            <Text style={styles.heartIcon}>❤️</Text>
          </TouchableOpacity>
        </View>
        
        <ExpoImage
          source={getImageSource()} 
          style={styles.carImage} 
          contentFit="cover" 
          onError={() => setImageError(true)}
          onLoad={() => setImageError(false)}
        />
        
        <View style={styles.carCardContent}>
          <Text style={styles.carType}>Sedan</Text>
          <View style={styles.carTitleRow}>
            <Text style={styles.carTitle}>
              {car.name || car.model || car.title || 'Hyundai Verna'}
            </Text>
            <Text style={styles.carPrice}>{getPrice()}</Text>
          </View>
          
          <View style={styles.carFeatures}>
            <View style={styles.carFeature}>
              <Text style={styles.featureIcon}>🚗</Text>
              <Text style={styles.featureText}>Manual</Text>
            </View>
            <View style={styles.carFeature}>
              <Text style={styles.featureIcon}>⛽</Text>
              <Text style={styles.featureText}>Petrol</Text>
            </View>
            <View style={styles.carFeature}>
              <Text style={styles.featureIcon}>👥</Text>
              <Text style={styles.featureText}>5 Seats</Text>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
});

// Define the drawer param list
type DrawerParamList = {
  Main: undefined;
  Filters: undefined;
};

export default function HomeScreen() {
  const navigation = useNavigation<DrawerNavigationProp<DrawerParamList>>();
  const { filters, filtersUpdated, setFiltersUpdated } = useContext(FilterContext);
  // Remove all local filter state
  const [cars, setCars] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filtersLoading, setFiltersLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  // Fetch cars (with pagination)
  const fetchCars = (reset = true) => {
    if (loading || loadingMore) return;
    if (!reset && !hasMore) return;
    if (reset) {
      setLoading(true);
      setPage(1);
      setHasMore(true);
      setCars([]);
    } else {
      setLoadingMore(true);
    }
    setError(null);
    // Build query params
    const params = new URLSearchParams({
      duration: filters.duration,
      date: filters.date.toISOString().split('T')[0],
      time: filters.time.toTimeString().slice(0,5),
      brand: filters.brand === 'All Brands' ? '' : filters.brand,
      type: filters.type === 'All Types' ? '' : filters.type,
      transmission: filters.transmission === 'All' ? '' : filters.transmission,
      fuelType: filters.fuelType === 'All' ? '' : filters.fuelType,
      minSeats: filters.minSeat === 'Any' ? '' : filters.minSeat,
      maxPrice: filters.maxPrice,
      page: reset ? '1' : (page + 1).toString(),
    });
    fetch(`${API_BASE}/cars?${params}`)
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) {
          if (reset) setCars(data);
          else setCars(prev => [...prev, ...data]);
          setHasMore(data.length > 0);
        } else if (data && Array.isArray(data.data)) {
          if (reset) setCars(data.data);
          else setCars(prev => [...prev, ...data.data]);
          setHasMore(data.current_page < data.last_page);
        } else if (Array.isArray(data.cars)) {
          if (reset) setCars(data.cars);
          else setCars(prev => [...prev, ...data.cars]);
          setHasMore(data.hasMore !== undefined ? data.hasMore : (data.cars.length > 0));
        } else {
          setCars([]);
          setHasMore(false);
        }
        setPage(reset ? 1 : page + 1);
      })
      .catch(() => setError('Failed to load cars'))
      .finally(() => {
        setLoading(false);
        setLoadingMore(false);
      });
  };

  // Search handler
  const onSearch = () => {
    fetchCars(true);
  };
  const onClear = () => {
    // setDuration('Hourly'); // This line is removed as duration is now from filters
    // setDate(new Date());
    // setTime(new Date());
    // setBrand('All Brands'); // This line is removed as brand is now from filters
    // setType('All Types'); // This line is removed as type is now from filters
    // setTransmission('All'); // This line is removed as transmission is now from filters
    // setFuelType('All'); // This line is removed as fuelType is now from filters
    // setMinSeat('Any'); // This line is removed as minSeat is now from filters
    // setMaxPrice(''); // This line is removed as maxPrice is now from filters
  };

  // Infinite scroll handler
  const onEndReached = () => {
    if (!loading && !loadingMore && hasMore) {
      fetchCars(false);
    }
  };

  React.useEffect(() => {
    if (filtersUpdated) {
      fetchCars(true);
      setFiltersUpdated(false);
    }
  }, [filtersUpdated]);

  return (
    <View style={styles.container}>
      {/* Header with location and search */}
      <View style={styles.header}>
        {/* Removed locationSection */}
        <View style={styles.searchSection}>
          <View style={styles.searchBar}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Search"
              placeholderTextColor="#999"
            />
          </View>
          <TouchableOpacity style={styles.filterButton} onPress={() => navigation.navigate('Filters')}>
            <Text style={styles.filterIcon}>⚙️</Text>
            <View style={styles.notificationBadge} />
          </TouchableOpacity>
        </View>
        {/* Only show a summary of selected filters */}
        <View style={styles.filterSummaryRow}>
          {/* Render selected filters as tags, guard against undefined/null/empty */}
          {filters.duration && filters.duration !== 'Hourly' && typeof filters.duration === 'string' && (
            <View style={styles.filterTag}><Text style={styles.filterTagText}>{filters.duration}</Text></View>
          )}
          {filters.brand && filters.brand !== 'All Brands' && typeof filters.brand === 'string' && (
            <View style={styles.filterTag}><Text style={styles.filterTagText}>{filters.brand}</Text></View>
          )}
          {filters.type && filters.type !== 'All Types' && typeof filters.type === 'string' && (
            <View style={styles.filterTag}><Text style={styles.filterTagText}>{filters.type}</Text></View>
          )}
          {filters.transmission && filters.transmission !== 'All' && typeof filters.transmission === 'string' && (
            <View style={styles.filterTag}><Text style={styles.filterTagText}>{filters.transmission}</Text></View>
          )}
          {filters.fuelType && filters.fuelType !== 'All' && typeof filters.fuelType === 'string' && (
            <View style={styles.filterTag}><Text style={styles.filterTagText}>{filters.fuelType}</Text></View>
          )}
          {filters.minSeat && filters.minSeat !== 'Any' && typeof filters.minSeat === 'string' && (
            <View style={styles.filterTag}><Text style={styles.filterTagText}>{filters.minSeat} Seats</Text></View>
          )}
          {filters.maxPrice && typeof filters.maxPrice === 'string' && (
            <View style={styles.filterTag}><Text style={styles.filterTagText}>${filters.maxPrice}</Text></View>
          )}
        </View>
      </View> {/* End of header */}

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false} contentContainerStyle={styles.screenContent}>
        {/* Brands Section */}
        <View style={styles.brandsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Brands</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.brandsScroll}>
            {brands.map((brand) => (
              <BrandItem key={brand.id} brand={brand} />
            ))}
          </ScrollView>
        </View>

        {/* Popular Cars Section */}
        <View style={styles.carsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Popular Car</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          
          {loading && page === 1 ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Loading cars...</Text>
            </View>
          ) : error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : (
            <FlatList
              data={cars}
              keyExtractor={(item) => item.id?.toString() || item.vin || item._id || ''}
              renderItem={({ item }) => <CarCard car={item} />}
              horizontal={false}
              numColumns={1}
              contentContainerStyle={styles.listContent}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>No cars found.</Text>
                </View>
              }
              onEndReached={onEndReached}
              onEndReachedThreshold={0.5}
              ListFooterComponent={loadingMore ? 
                <View style={styles.loadingMoreContainer}>
                  <Text style={styles.loadingMoreText}>Loading more...</Text>
                </View> : null
              }
              scrollEnabled={false}
            />
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    // paddingHorizontal: 16, // Remove this to allow full width
  },
  header: {
    backgroundColor: '#7e246c',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 0, // No horizontal padding here
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  locationSection: {
    marginBottom: 20,
  },
  locationLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  locationText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    flex: 1,
  },
  locationChevron: {
    fontSize: 12,
    color: '#fff',
  },
  searchSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: 16,
    marginBottom: 0,
  },
  searchBar: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    marginRight: 16, // Add margin between search and filter icon
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
    color: '#999',
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  filterButton: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginRight: 12, // Add right margin for spacing
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#7e246c',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  filterIcon: {
    fontSize: 16,
    color: '#7e246c',
  },
  notificationBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    backgroundColor: '#FF3B30',
    borderRadius: 4,
  },
  scrollView: {
    flex: 1,
  },
  screenContent: {
    paddingHorizontal: 16,
  },
  brandsSection: {
    paddingHorizontal: 0, // Remove double padding, handled by container
    paddingVertical: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  seeAllText: {
    fontSize: 14,
    color: '#7e246c',
    fontWeight: '500',
  },
  brandsScroll: {
    flexDirection: 'row',
  },
  brandItem: {
    alignItems: 'center',
    marginRight: 20,
  },
  brandIcon: {
    width: 60,
    height: 60,
    backgroundColor: '#f0f0f0',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  brandLogo: {
    fontSize: 24,
  },
  brandName: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  carsSection: {
    paddingHorizontal: 0, // Remove double padding, handled by container
    paddingBottom: 20,
  },
  carCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
  },
  carCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  carRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starIcon: {
    fontSize: 16,
    marginRight: 4,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  favoriteButton: {
    padding: 4,
  },
  heartIcon: {
    fontSize: 20,
  },
  carImage: {
    width: '100%',
    height: 150,
  },
  carCardContent: {
    padding: 16,
  },
  carType: {
    fontSize: 12,
    color: '#7e246c',
    fontWeight: '500',
    marginBottom: 4,
  },
  carTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  carTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  carPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#7e246c',
  },
  carFeatures: {
    flexDirection: 'row',
    gap: 16,
  },
  carFeature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  featureIcon: {
    fontSize: 14,
  },
  featureText: {
    fontSize: 12,
    color: '#666',
  },
  listContent: {
    paddingBottom: 32,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    color: '#666',
    fontSize: 16,
  },
  errorContainer: {
    padding: 40,
    alignItems: 'center',
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 16,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: '#666',
    fontSize: 16,
  },
  loadingMoreContainer: {
    padding: 20,
    alignItems: 'center',
  },
  loadingMoreText: {
    color: '#666',
    fontSize: 14,
  },
  filterBox: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 16,
    marginTop: 16,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  filterRowWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 12,
  },
  filterCol: {
    flex: 1,
    minWidth: 120,
  },
  filterLabel: {
    fontSize: 14,
    color: '#7e246c',
    fontWeight: '600',
    marginBottom: 4,
  },
  filterOption: {
    backgroundColor: '#F2F4F7',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    marginBottom: 4,
  },
  filterOptionActive: {
    backgroundColor: '#7e246c',
  },
  filterOptionText: {
    color: '#222',
    fontWeight: '500',
  },
  filterOptionTextActive: {
    color: '#fff',
  },
  filterInput: {
    backgroundColor: '#F2F4F7',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 15,
    color: '#222',
    minWidth: 80,
  },
  filterButtonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 8,
  },
  clearBtn: {
    backgroundColor: '#F2F4F7',
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  clearBtnText: {
    color: '#7e246c',
    fontWeight: '600',
  },
  searchBtn: {
    backgroundColor: '#7e246c',
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 10,
  },
  searchBtnText: {
    color: '#fff',
    fontWeight: '700',
  },
  filterBoxRow: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginHorizontal: 8,
    marginTop: 16,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    maxHeight: 110,
},
filterBoxRowContent: {
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
},
filterDropdown: {
    marginRight: 16,
    minWidth: 90,
    maxWidth: 160,
},
filterButtonRowHorizontal: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginLeft: 8,
},
picker: {
  backgroundColor: '#F2F4F7',
  borderRadius: 12,
  height: 40,
  minWidth: 90,
  maxWidth: 160,
  marginBottom: 0,
},
pickerItem: {
  fontSize: 15,
  color: '#222',
  },
  filterSummaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#f8f8fa',
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
  },
  filterSummaryText: {
    color: '#7e246c',
    fontWeight: '600',
    fontSize: 15,
  },
  filterTag: {
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: '#7e246c',
    alignSelf: 'flex-start',
  },
  filterTagText: {
    color: '#7e246c',
    fontWeight: '600',
    fontSize: 13,
  },
});
