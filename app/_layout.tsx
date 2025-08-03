import DateTimePicker from '@react-native-community/datetimepicker';
import { DrawerScreenProps } from '@react-navigation/drawer';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { createContext, useContext, useMemo, useState } from 'react';
import { ActivityIndicator, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import 'react-native-reanimated';


import { useColorScheme } from '@/hooks/useColorScheme';

export const AuthContext = createContext({
  isLoggedIn: false,
  login: () => {},
  logout: () => {},
});

// Define filter context
export const FilterContext = createContext({
  filters: {
    duration: 'Hourly',
    date: new Date(),
    time: new Date(),
    brand: 'All Brands',
    type: 'All Types',
    transmission: 'All',
    fuelType: 'All',
    minSeat: 'Any',
    maxPrice: '',
  },
  setFilters: (filters: any) => {},
  resetFilters: () => {},
  filtersUpdated: false,
  setFiltersUpdated: (value: boolean) => {},
});

// Define the drawer param list
type DrawerParamList = {
  Main: undefined;
  Filters: undefined;
};

function FilterDrawer({ navigation }: DrawerScreenProps<DrawerParamList, 'Filters'>) {
  const { filters, setFilters, resetFilters, setFiltersUpdated } = useContext(FilterContext);
  // Local state for dropdown open/close and value
  const [durationOpen, setDurationOpen] = useState(false);
  const [brandOpen, setBrandOpen] = useState(false);
  const [typeOpen, setTypeOpen] = useState(false);
  const [transmissionOpen, setTransmissionOpen] = useState(false);
  const [fuelTypeOpen, setFuelTypeOpen] = useState(false);
  const [minSeatOpen, setMinSeatOpen] = useState(false);
  // Local state for dropdown values
  const [durationValue, setDurationValue] = useState(filters.duration);
  const [brandValue, setBrandValue] = useState(filters.brand);
  const [typeValue, setTypeValue] = useState(filters.type);
  const [transmissionValue, setTransmissionValue] = useState(filters.transmission);
  const [fuelTypeValue, setFuelTypeValue] = useState(filters.fuelType);
  const [minSeatValue, setMinSeatValue] = useState(filters.minSeat);

  // API data state
  const [brands, setBrands] = useState<any[]>([]);
  const [carTypes, setCarTypes] = useState<any[]>([]);
  const [carEngines, setCarEngines] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch API data on component mount
  React.useEffect(() => {
    const fetchFilterData = async () => {
      try {
        setIsLoading(true);
        const apiService = (await import('../services/api')).default;
        
        const [brandsData, typesData, enginesData] = await Promise.all([
          apiService.getCarBrands(),
          apiService.getCarTypes(),
          apiService.getCarEngines(),
        ]);
        
        setBrands(brandsData || []);
        setCarTypes(typesData || []);
        setCarEngines(enginesData || []);
      } catch (error) {
        // Set empty arrays as fallback
        setBrands([]);
        setCarTypes([]);
        setCarEngines([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFilterData();
  }, []);

  // Sync local dropdown value with context when filters change
  React.useEffect(() => { setDurationValue(filters.duration); }, [filters.duration]);
  React.useEffect(() => { setBrandValue(filters.brand); }, [filters.brand]);
  React.useEffect(() => { setTypeValue(filters.type); }, [filters.type]);
  React.useEffect(() => { setTransmissionValue(filters.transmission); }, [filters.transmission]);
  React.useEffect(() => { setFuelTypeValue(filters.fuelType); }, [filters.fuelType]);
  React.useEffect(() => { setMinSeatValue(filters.minSeat); }, [filters.minSeat]);

  // Local state for date/time picker
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  // Options (should be fetched or passed as props in a real app)
  const durations = ['Hourly', 'Daily', 'Weekly'];
  const transmissionOptions = ['All', 'Automatic', 'Manual'];
  const minSeatOptions = ['Any', '2', '4', '5', '7', '8'];

  // Dropdown items
  const filterValidItems = (arr: any[]) => arr.filter(item => typeof item.label === 'string' && item.label.trim() !== '' && typeof item.value === 'string' && item.value.trim() !== '');
  const durationItems = filterValidItems(durations.map((d) => ({ label: d, value: d })));
  const transmissionItems = filterValidItems(transmissionOptions.map((t) => ({ label: t, value: t })));
  const minSeatItems = filterValidItems(minSeatOptions.map((s) => ({ label: s, value: s })));

  // Convert API data to dropdown items
  const brandItems = [
    { label: 'All Brands', value: 'All Brands' },
    ...brands.map(brand => ({ label: brand.name, value: brand.name }))
  ];
  
  const typeItems = [
    { label: 'All Types', value: 'All Types' },
    ...carTypes.map(type => ({ label: type.name, value: type.name }))
  ];
  
  const fuelTypeItems = [
    { label: 'All', value: 'All' },
    ...carEngines.map(engine => ({ label: engine.name, value: engine.name }))
  ];

  // Handlers for updating filter context
  const updateFilter = (key: string, value: any) => {
    setFilters((prev: typeof filters) => ({ ...prev, [key]: value }));
  };

  // Only one dropdown open at a time
  const handleOpen = (dropdown: string) => {
    setDurationOpen(dropdown === 'duration');
    setBrandOpen(dropdown === 'brand');
    setTypeOpen(dropdown === 'type');
    setTransmissionOpen(dropdown === 'transmission');
    setFuelTypeOpen(dropdown === 'fuelType');
    setMinSeatOpen(dropdown === 'minSeat');
  };

  const onClear = () => {
    resetFilters();
  };

  const onApply = () => {
    setFiltersUpdated(true);
    navigation.navigate('Main');
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#fff', padding: 0 }}>
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#F0F0F0', backgroundColor: '#fff', elevation: 2 }}>
        <TouchableOpacity onPress={() => navigation.navigate('Main')} style={{ marginRight: 12, padding: 8, borderRadius: 16, backgroundColor: '#f5f5fa' }}>
          <Text style={{ fontSize: 22, color: '#7e246c' }}>{'←'}</Text>
        </TouchableOpacity>
        <Text style={{ fontWeight: 'bold', fontSize: 22, color: '#222' }}>Filters</Text>
      </View>
      
      {isLoading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#7e246c" />
          <Text style={{ marginTop: 10, color: '#666' }}>Loading filters...</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ padding: 10, paddingBottom: 20 }} showsVerticalScrollIndicator={false}>
        {/* Duration Dropdown */}
        <Text style={{ fontWeight: '700', fontSize: 15, color: '#222', marginBottom: 6 }}>Duration</Text>
        <View style={{ zIndex: 6000 }}>
          <DropDownPicker
            open={durationOpen}
            value={durationValue}
            items={durationItems}
            setOpen={(open) => handleOpen(open ? 'duration' : '')}
            setValue={val => setDurationValue(val ?? '')}
            onChangeValue={val => { setFilters((prev: any) => ({ ...prev, duration: val ?? '' })); setDurationValue(val ?? ''); }}
            zIndex={6000}
            zIndexInverse={1000}
            style={{ backgroundColor: '#F5F6FA', borderColor: '#7e246c', borderRadius: 14, marginBottom: 18 }}
            dropDownContainerStyle={{ borderColor: '#7e246c', borderRadius: 14 }}
            textStyle={{ color: '#222', fontWeight: '600' }}
            placeholder="Select Duration"
            listItemLabelStyle={{ color: '#222' }}
            selectedItemLabelStyle={{ color: '#7e246c', fontWeight: '700' }}
          />
        </View>
        {/* Date */}
        <Text style={{ fontWeight: '700', fontSize: 15, color: '#222', marginBottom: 6 }}>Date</Text>
        <TouchableOpacity style={{ backgroundColor: '#F5F6FA', borderRadius: 14, padding: 14, marginBottom: 18 }} onPress={() => {
          if (Platform.OS !== 'web') setShowDatePicker(true);
          else alert('Date picker is not supported on web.');
        }}>
          <Text style={{ color: '#7e246c', fontWeight: '600', fontSize: 16 }}>{filters.date.toLocaleDateString()}</Text>
        </TouchableOpacity>
        {/* Time */}
        <Text style={{ fontWeight: '700', fontSize: 15, color: '#222', marginBottom: 6 }}>Time</Text>
        <TouchableOpacity style={{ backgroundColor: '#F5F6FA', borderRadius: 14, padding: 14, marginBottom: 18 }} onPress={() => {
          if (Platform.OS !== 'web') setShowTimePicker(true);
          else alert('Time picker is not supported on web.');
        }}>
          <Text style={{ color: '#7e246c', fontWeight: '600', fontSize: 16 }}>{filters.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
        </TouchableOpacity>
        {/* Brand Dropdown */}
        <Text style={{ fontWeight: '700', fontSize: 15, color: '#222', marginBottom: 6 }}>Brand</Text>
        <View style={{ zIndex: 5000 }}>
          <DropDownPicker
            open={brandOpen}
            value={brandValue}
            items={brandItems}
            setOpen={(open) => {
              if (open) handleOpen('brand');
              else handleOpen('');
            }}
            setValue={val => setBrandValue(val ?? '')}
            onChangeValue={val => { setFilters((prev: any) => ({ ...prev, brand: val ?? '' })); setBrandValue(val ?? ''); }}
            zIndex={5000}
            zIndexInverse={2000}
            style={{ backgroundColor: '#F5F6FA', borderColor: '#7e246c', borderRadius: 14, marginBottom: 18 }}
            dropDownContainerStyle={{ borderColor: '#7e246c', borderRadius: 14 }}
            textStyle={{ color: '#222', fontWeight: '600' }}
            placeholder="Select Brand"
            listItemLabelStyle={{ color: '#222' }}
            selectedItemLabelStyle={{ color: '#7e246c', fontWeight: '700' }}
          />
        </View>
        {/* Type Dropdown */}
        <Text style={{ fontWeight: '700', fontSize: 15, color: '#222', marginBottom: 6 }}>Type</Text>
        <View style={{ zIndex: 4000 }}>
          <DropDownPicker
            open={typeOpen}
            value={typeValue}
            items={typeItems}
            setOpen={(open) => {
              if (open) handleOpen('type');
              else handleOpen('');
            }}
            setValue={val => setTypeValue(val ?? '')}
            onChangeValue={val => { setFilters((prev: any) => ({ ...prev, type: val ?? '' })); setTypeValue(val ?? ''); }}
            zIndex={4000}
            zIndexInverse={3000}
            style={{ backgroundColor: '#F5F6FA', borderColor: '#7e246c', borderRadius: 14, marginBottom: 18 }}
            dropDownContainerStyle={{ borderColor: '#7e246c', borderRadius: 14 }}
            textStyle={{ color: '#222', fontWeight: '600' }}
            placeholder="Select Type"
            listItemLabelStyle={{ color: '#222' }}
            selectedItemLabelStyle={{ color: '#7e246c', fontWeight: '700' }}
          />
        </View>
        {/* Transmission Dropdown */}
        <Text style={{ fontWeight: '700', fontSize: 15, color: '#222', marginBottom: 6 }}>Transmission</Text>
        <View style={{ zIndex: 3000 }}>
          <DropDownPicker
            open={transmissionOpen}
            value={transmissionValue}
            items={transmissionItems}
            setOpen={open => handleOpen(open ? 'transmission' : '')}
            setValue={val => setTransmissionValue(val ?? '')}
            onChangeValue={val => { setFilters((prev: any) => ({ ...prev, transmission: val ?? '' })); setTransmissionValue(val ?? ''); }}
            zIndex={3000}
            zIndexInverse={4000}
            style={{ backgroundColor: '#F5F6FA', borderColor: '#7e246c', borderRadius: 14, marginBottom: 18 }}
            dropDownContainerStyle={{ borderColor: '#7e246c', borderRadius: 14 }}
            textStyle={{ color: '#222', fontWeight: '600' }}
            placeholder="Select Transmission"
            listItemLabelStyle={{ color: '#222' }}
            selectedItemLabelStyle={{ color: '#7e246c', fontWeight: '700' }}
          />
        </View>
        {/* Fuel Type Dropdown */}
        <Text style={{ fontWeight: '700', fontSize: 15, color: '#222', marginBottom: 6 }}>Fuel Type</Text>
        <View style={{ zIndex: 2000 }}>
          <DropDownPicker
            open={fuelTypeOpen}
            value={fuelTypeValue}
            items={fuelTypeItems}
            setOpen={open => handleOpen(open ? 'fuelType' : '')}
            setValue={val => setFuelTypeValue(val ?? '')}
            onChangeValue={val => { setFilters((prev: any) => ({ ...prev, fuelType: val ?? '' })); setFuelTypeValue(val ?? ''); }}
            zIndex={2000}
            zIndexInverse={5000}
            style={{ backgroundColor: '#F5F6FA', borderColor: '#7e246c', borderRadius: 14, marginBottom: 18 }}
            dropDownContainerStyle={{ borderColor: '#7e246c', borderRadius: 14 }}
            textStyle={{ color: '#222', fontWeight: '600' }}
            placeholder="Select Fuel Type"
            listItemLabelStyle={{ color: '#222' }}
            selectedItemLabelStyle={{ color: '#7e246c', fontWeight: '700' }}
          />
        </View>
        {/* Min Seats Dropdown */}
        <Text style={{ fontWeight: '700', fontSize: 15, color: '#222', marginBottom: 6 }}>Min Seats</Text>
        <View style={{ zIndex: 1000 }}>
          <DropDownPicker
            open={minSeatOpen}
            value={minSeatValue}
            items={minSeatItems}
            setOpen={open => handleOpen(open ? 'minSeat' : '')}
            setValue={val => setMinSeatValue(val ?? '')}
            onChangeValue={val => { setFilters((prev: any) => ({ ...prev, minSeat: val ?? '' })); setMinSeatValue(val ?? ''); }}
            zIndex={1000}
            zIndexInverse={6000}
            style={{ backgroundColor: '#F5F6FA', borderColor: '#7e246c', borderRadius: 14, marginBottom: 24 }}
            dropDownContainerStyle={{ borderColor: '#7e246c', borderRadius: 14 }}
            textStyle={{ color: '#222', fontWeight: '600' }}
            placeholder="Select Min Seats"
            listItemLabelStyle={{ color: '#222' }}
            selectedItemLabelStyle={{ color: '#7e246c', fontWeight: '700' }}
          />
        </View>
        {/* Max Price */}
        <Text style={{ fontWeight: '700', fontSize: 15, color: '#222', marginBottom: 6 }}>Max Price</Text>
        <TextInput
          style={{ backgroundColor: '#F5F6FA', borderRadius: 14, padding: 14, marginBottom: 24, fontSize: 16, color: '#222', fontWeight: '600' }}
          placeholder="$1000"
          placeholderTextColor="#999"
          value={filters.maxPrice}
          onChangeText={val => updateFilter('maxPrice', val)}
          keyboardType="numeric"
        />
        {/* Buttons */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 16 }}>
          <TouchableOpacity onPress={onClear} style={{ backgroundColor: '#fff', borderColor: '#7e246c', borderWidth: 2, borderRadius: 14, paddingVertical: 14, paddingHorizontal: 32, shadowColor: '#7e246c', shadowOpacity: 0.08, shadowRadius: 4, elevation: 2 }}>
            <Text style={{ color: '#7e246c', fontWeight: '700', fontSize: 16 }}>Reset</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onApply} style={{ backgroundColor: '#7e246c', borderRadius: 14, paddingVertical: 14, paddingHorizontal: 32, shadowColor: '#7e246c', shadowOpacity: 0.12, shadowRadius: 6, elevation: 3 }}>
            <Text style={{ color: '#fff', fontWeight: '700', fontSize: 16 }}>Update</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      )}
      {/* Render pickers at the root, outside ScrollView */}
      {Platform.OS !== 'web' && showDatePicker && (
        <DateTimePicker
          value={filters.date}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            setShowDatePicker(false);
            if (selectedDate) {
              setFilters((prev: any) => ({ ...prev, date: selectedDate }));
            }
          }}
        />
      )}
      {Platform.OS !== 'web' && showTimePicker && (
        <DateTimePicker
          value={filters.time}
          mode="time"
          display="default"
          onChange={(event, selectedTime) => {
            setShowTimePicker(false);
            if (selectedTime) {
              setFilters((prev: any) => ({ ...prev, time: selectedTime }));
            }
          }}
        />
      )}
    </View>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  // Initialize auth state from stored token
  React.useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const apiService = (await import('../services/api')).default;
        const isAuth = await apiService.checkAuthStatus();
        if (isAuth) {
          setIsLoggedIn(true);
        }
      } catch (error) {
        // Silently handle auth check errors to prevent console spam
        // console.error('Failed to check auth status:', error);
      }
    };
    
    // Only check auth status once on mount
    checkAuthStatus();
  }, []);

  const login = () => setIsLoggedIn(true);
  const logout = () => setIsLoggedIn(false);

  // Filter state for context
  const [filters, setFilters] = useState({
    duration: 'Hourly',
    date: new Date(),
    time: new Date(),
    brand: 'All Brands',
    type: 'All Types',
    transmission: 'All',
    fuelType: 'All',
    minSeat: 'Any',
    maxPrice: '',
  });
  const resetFilters = () => setFilters({
    duration: 'Hourly',
    date: new Date(),
    time: new Date(),
    brand: 'All Brands',
    type: 'All Types',
    transmission: 'All',
    fuelType: 'All',
    minSeat: 'Any',
    maxPrice: '',
  });

  const [filtersUpdated, setFiltersUpdated] = useState(false);

  const filterContextValue = useMemo(
    () => ({ filters, setFilters, resetFilters, filtersUpdated, setFiltersUpdated }),
    [filters, setFilters, resetFilters, filtersUpdated, setFiltersUpdated]
  );

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  return (
    <AuthContext.Provider value={{ isLoggedIn, login, logout }}>
              <FilterContext.Provider value={filterContextValue}>
          <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
            <Stack>
              <Stack.Screen name="index" options={{ headerShown: false }} />
              <Stack.Screen name="OnboardingScreen" options={{ headerShown: false }} />
              <Stack.Screen name="LandingScreen" options={{ headerShown: false }} />
              <Stack.Screen name="SplashScreen" options={{ headerShown: false }} />
              <Stack.Screen name="LoginScreen" options={{ headerShown: false }} />
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="CarBooking" options={{ headerShown: false }} />
              <Stack.Screen name="CreateAccount" options={{ headerShown: false }} />
              <Stack.Screen name="SignIn" options={{ headerShown: false }} />
              <Stack.Screen name="+not-found" />
            </Stack>
            <StatusBar style="auto" />
          </ThemeProvider>
        </FilterContext.Provider>
    </AuthContext.Provider>
  );
}
