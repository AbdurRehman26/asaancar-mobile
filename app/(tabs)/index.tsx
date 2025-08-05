import { useRouter } from 'expo-router';
import React, { useContext, useState } from 'react';
import { Dimensions, FlatList, Image, Modal, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import apiService from '../../services/api';
import { FilterContext } from '../_layout';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - 32;

const CarCard = React.memo(function CarCard({ car }: { car: any }) {
  const [imageError, setImageError] = useState(false);
  const router = useRouter();

  const handlePress = () => {
    try {
      const carData = JSON.stringify(car);
      router.push({
        pathname: '/CarBooking',
        params: { car: carData }
      });
        } catch (error) {
      console.error('Navigation error:', error);
          }
  };

  return (
    <TouchableOpacity 
      onPress={handlePress}
      activeOpacity={0.7}
      style={styles.carCardTouchable}
    >
      <View style={styles.modernCarCard}>
        <Image
          source={{ uri: 'https://picsum.photos/300/200?random=' + car.id }}
          style={styles.modernCarImage} 
          onError={() => setImageError(true)}
          onLoad={() => setImageError(false)}
        />
        <View style={styles.modernCarCardContent}>
          <Text style={styles.modernCarTitle} numberOfLines={2}>
            {car.name || car.model || car.title || 'Car Name'}
          </Text>
          <Text style={styles.modernCarBrand}>
            {car.brand || car.make || car.company || '—'}
          </Text>
          <View style={styles.modernCarFeaturesGrid}>
            <View style={styles.modernCarFeatureCol}>
              <View style={styles.modernCarFeatureRow}>
                <Text style={styles.featureIcon}>👤</Text>
                <Text style={styles.modernFeatureText}>{car.seats || 5}</Text>
              </View>
              <View style={styles.modernCarFeatureRow}>
                <Text style={styles.featureIcon}>⚙️</Text>
                <Text style={styles.modernFeatureText}>{car.transmission || 'Automatic'}</Text>
              </View>
            </View>
            <View style={styles.modernCarFeatureCol}>
              <View style={styles.modernCarFeatureRow}>
                <Text style={styles.featureIcon}>⛽</Text>
                <Text style={styles.modernFeatureText}>{car.fuelType || 'Petrol'}</Text>
              </View>
              <View style={styles.modernCarFeatureRow}>
                <Text style={styles.featureIcon}>🚗</Text>
                <Text style={styles.modernFeatureText}>{car.type || 'Sedan'}</Text>
              </View>
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
  const { filters, setFilters } = useContext(FilterContext);
  const [cars, setCars] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  // State for which filter is open in modal
  const [openFilter, setOpenFilter] = useState<string | null>(null);
  // Filter options - fetched from API
  const [filterOptions, setFilterOptions] = useState({
    duration: ['Hourly', 'Daily', 'Weekly'],
    brand: ['All Brands'],
    type: ['All Types'],
    transmission: ['All'],
    fuelType: ['All'],
    minSeat: ['Any', '2', '4', '5', '7', '8'],
  });
  const [filterOptionsLoading, setFilterOptionsLoading] = useState(true);

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
    
    // Use real API to fetch cars
    apiService.getCars(params.toString())
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
      .catch((error) => {
        // Handle API error
        setError('Failed to load cars. Please try again.');
        if (reset) {
          setCars([]);
          setHasMore(false);
        }
        setPage(reset ? 1 : page + 1);
      })
      .finally(() => {
        setLoading(false);
        setLoadingMore(false);
      });
  };

  // Infinite scroll handler
  const onEndReached = () => {
    if (!loading && !loadingMore && hasMore) {
      fetchCars(false);
    }
  };

  // Fetch filter options from API
  const fetchFilterOptions = async () => {
    try {
      setFilterOptionsLoading(true);
      const options = await apiService.getFilterOptions();
      
      setFilterOptions(prev => ({
        ...prev,
        brand: ['All Brands', ...(options.brands || [])],
        type: ['All Types', ...(options.types || [])],
        transmission: ['All', ...(options.transmissions || [])],
        fuelType: ['All', ...(options.fuelTypes || [])],
      }));
    } catch (error) {
      console.error('Failed to fetch filter options:', error);
      // Keep default values if API fails
    } finally {
      setFilterOptionsLoading(false);
    }
  };

  React.useEffect(() => {
    fetchFilterOptions();
    fetchCars(true);
  }, []);



  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
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
        </View>
      </View> {/* End of header */}

      {/* Filter pills row: show all filters, tap to open modal */}
        <View style={styles.filterBox}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScrollView} contentContainerStyle={{ alignItems: 'center', flexDirection: 'row', paddingHorizontal: 0 }}>
        {[
          { key: 'duration', label: 'Duration', value: filters.duration },
          { key: 'brand', label: 'Brand', value: filters.brand },
          { key: 'type', label: 'Type', value: filters.type },
          { key: 'transmission', label: 'Transmission', value: filters.transmission },
          { key: 'fuelType', label: 'Fuel', value: filters.fuelType },
          { key: 'minSeat', label: 'Seats', value: filters.minSeat },
        ].map(f => (
          <Pressable key={f.key} onPress={() => setOpenFilter(f.key)} style={({ pressed }) => [styles.filterTag, pressed && { backgroundColor: '#f2e6f5' }] }>
            <Text style={styles.filterTagText}>{f.label}: <Text style={{ fontWeight: 'bold' }}>{f.value}</Text></Text>
          </Pressable>
        ))}
      </ScrollView>
        </View>

      {/* Modal for filter selection */}
      <Modal
        visible={!!openFilter}
        animationType="slide"
        transparent
        onRequestClose={() => setOpenFilter(null)}
      >
        <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.3)' }} onPress={() => setOpenFilter(null)} />
        <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, backgroundColor: '#fff', borderTopLeftRadius: 18, borderTopRightRadius: 18, padding: 24 }}>
          <Text style={{ fontWeight: 'bold', fontSize: 18, color: '#7e246c', marginBottom: 16 }}>
            Select {openFilter && ([{ key: 'duration', label: 'Duration' }, { key: 'brand', label: 'Brand' }, { key: 'type', label: 'Type' }, { key: 'transmission', label: 'Transmission' }, { key: 'fuelType', label: 'Fuel' }, { key: 'minSeat', label: 'Seats' }].find(f => f.key === openFilter)?.label)}
          </Text>
          {filterOptionsLoading ? (
            <View style={{ paddingVertical: 20, alignItems: 'center' }}>
              <Text style={{ fontSize: 16, color: '#666' }}>Loading options...</Text>
            </View>
          ) : (
            openFilter && (filterOptions[openFilter as keyof typeof filterOptions] as string[])?.map((option: string) => (
              <TouchableOpacity
                key={option}
                style={{ paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#eee' }}
                onPress={() => {
                  setFilters((prev: any) => ({ ...prev, [openFilter]: option }));
                  setOpenFilter(null);
                }}
              >
                <Text style={{ fontSize: 16, color: (filters as any)[openFilter] === option ? '#7e246c' : '#222', fontWeight: (filters as any)[openFilter] === option ? 'bold' : 'normal' }}>{option}</Text>
              </TouchableOpacity>
            ))
          )}
          <TouchableOpacity onPress={() => setOpenFilter(null)} style={{ marginTop: 18, alignSelf: 'center' }}>
            <Text style={{ color: '#7e246c', fontWeight: 'bold', fontSize: 16 }}>Close</Text>
          </TouchableOpacity>
        </View>
      </Modal>

        {/* Popular Cars Section - header removed */}
        <View style={{ flex: 1 }}>
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
                keyExtractor={(item) => `car-${item.id || item.vin || item._id || Math.random()}`}
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
              style={{ flex: 1 }}
              showsVerticalScrollIndicator={true}
              scrollEnabled={true}
              bounces={true}
              alwaysBounceVertical={false}
            />
          )}
        </View>
      </View>
    </SafeAreaView>
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
    marginBottom: 8, // Reduced margin below the search area
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
    justifyContent: 'center',
    paddingHorizontal: 16,
    marginBottom: -4,
  },
  searchBar: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 4,
    paddingVertical: 3,
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
    marginTop: -8, // Negative margin to pull car listing up
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
    paddingHorizontal: 16,
    paddingTop: 8, // Add small top padding
  },
  loadingContainer: {
    flex: 1,
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: '#666',
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
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
    backgroundColor: 'transparent',
    borderRadius: 16,
    padding: 0,
    marginHorizontal: 16,
    marginTop: 0,
    shadowColor: 'transparent',
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
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
filterBoxTransparent: {
    backgroundColor: 'transparent',
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  filterScrollView: {
    height: 32,
  },
  filterSummaryRow: {
    // Remove marginHorizontal, borderRadius, minHeight
    marginTop: 0,
    marginBottom: 0,
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  filterSummaryText: {
    color: '#7e246c',
    fontWeight: '600',
    fontSize: 15,
  },
  filterTag: {
    borderRadius: 16,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 8,
    marginBottom: 0,
    borderWidth: 1,
    borderColor: '#7e246c',
    alignSelf: 'flex-start',
  },
  filterTagText: {
    color: '#7e246c',
    fontWeight: '600',
    fontSize: 13,
  },
  modernCarCard: {
    backgroundColor: '#fff',
    borderRadius: 22,
    marginBottom: 20,
    shadowColor: '#7e246c',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.10,
    shadowRadius: 16,
    elevation: 5,
    overflow: 'hidden',
    position: 'relative',
  },
  cardAccentBar: {
    height: 4,
    width: '100%',
    backgroundColor: '#7e246c',
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 2,
  },
  modernCarImage: {
    width: '100%',
    height: 150,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  modernCarCardContent: {
    padding: 18,
  },
  modernCarTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  modernCarTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222',
    flex: 1,
    marginRight: 8,
  },
  modernCarPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#7e246c',
    backgroundColor: '#f8f0fa',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
    overflow: 'hidden',
  },
  modernCarType: {
    fontSize: 13,
    color: '#7e246c',
    fontWeight: '600',
    marginBottom: 10,
    marginTop: 2,
  },
  modernCarFeatures: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  modernCarFeaturePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f0fa',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginRight: 8,
  },
  modernFeatureText: {
    fontSize: 12,
    color: '#7e246c',
    fontWeight: '600',
    marginLeft: 4,
  },
  modernCarBrand: {
    color: '#7e246c',
    fontWeight: '600',
    fontSize: 16,
    marginTop: 2,
    marginBottom: 2,
    textAlign: 'left',
  },
  modernCarPriceRow: {
    marginTop: 4,
    marginBottom: 2,
  },
  modernCarPriceCurrency: {
    color: '#7e246c',
    fontWeight: 'bold',
    fontSize: 22,
  },
  modernCarWithDriver: {
    color: '#a05ca0',
    fontSize: 15,
    marginBottom: 8,
    marginTop: 0,
  },
  modernCarFeaturesGrid: {
    flexDirection: 'row',
    marginTop: 10,
    gap: 18,
  },
  modernCarFeatureCol: {
    flex: 1,
    gap: 8,
  },
  modernCarFeatureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  modernCarPriceUnit: {
    color: '#7e246c',
    fontWeight: '600',
    fontSize: 16,
  },
  modernCarPriceDetails: {
    marginBottom: 8,
    marginTop: 0,
  },
  bookNowContainer: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
    marginTop: 12,
  },
  bookNowText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  carCardTouchable: {
    marginBottom: 16,
  },
});
