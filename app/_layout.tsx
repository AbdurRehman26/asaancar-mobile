import DateTimePicker from '@react-native-community/datetimepicker';
import { createDrawerNavigator, DrawerScreenProps } from '@react-navigation/drawer';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { createContext, useContext, useMemo, useState } from 'react';
import { Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
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
  // Local state for dropdown open/close
  const [durationOpen, setDurationOpen] = useState(false);
  const [brandOpen, setBrandOpen] = useState(false);
  const [typeOpen, setTypeOpen] = useState(false);
  const [transmissionOpen, setTransmissionOpen] = useState(false);
  const [fuelTypeOpen, setFuelTypeOpen] = useState(false);
  const [minSeatOpen, setMinSeatOpen] = useState(false);
  // Local state for date/time picker
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  // Options (should be fetched or passed as props in a real app)
  const durations = ['Hourly', 'Daily', 'Weekly'];
  const brandOptions = ['All Brands', 'Toyota', 'Honda', 'BMW', 'Mercedes', 'Audi'];
  const typeOptions = ['All Types', 'Sedan', 'SUV', 'Truck', 'Hatchback', 'Coupe'];
  const transmissionOptions = ['All', 'Automatic', 'Manual'];
  const fuelTypeOptions = ['All', 'Petrol', 'Diesel', 'Electric', 'Hybrid'];
  const minSeatOptions = ['Any', '2', '4', '5', '7', '8'];

  // Dropdown items
  const durationItems = durations.map((d) => ({ label: d, value: d }));
  const brandItems = brandOptions.map((b) => ({ label: b, value: b }));
  const typeItems = typeOptions.map((t) => ({ label: t, value: t }));
  const transmissionItems = transmissionOptions.map((t) => ({ label: t, value: t }));
  const fuelTypeItems = fuelTypeOptions.map((f) => ({ label: f, value: f }));
  const minSeatItems = minSeatOptions.map((s) => ({ label: s, value: s }));

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
      <ScrollView contentContainerStyle={{ padding: 10, paddingBottom: 20 }} showsVerticalScrollIndicator={false}>
        {/* Duration Dropdown */}
        <Text style={{ fontWeight: '700', fontSize: 15, color: '#222', marginBottom: 6 }}>Duration</Text>
        <View style={{ zIndex: 6000 }}>
          <DropDownPicker
            open={durationOpen}
            value={filters.duration}
            items={durationItems}
            setOpen={open => {
              if (open) handleOpen('duration');
              else handleOpen('');
            }}
            setValue={() => {}}
            onChangeValue={val => setFilters((prev: any) => ({ ...prev, duration: val }))}
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
            value={filters.brand}
            items={brandItems}
            setOpen={open => {
              if (open) handleOpen('brand');
              else handleOpen('');
            }}
            setValue={() => {}}
            onChangeValue={val => setFilters((prev: any) => ({ ...prev, brand: val }))}
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
            value={filters.type}
            items={typeItems}
            setOpen={open => {
              if (open) handleOpen('type');
              else handleOpen('');
            }}
            setValue={() => {}}
            onChangeValue={val => setFilters((prev: any) => ({ ...prev, type: val }))}
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
            value={filters.transmission}
            items={transmissionItems}
            setOpen={open => {
              if (open) handleOpen('transmission');
              else handleOpen('');
            }}
            setValue={() => {}}
            onChangeValue={val => setFilters((prev: any) => ({ ...prev, transmission: val }))}
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
            value={filters.fuelType}
            items={fuelTypeItems}
            setOpen={open => {
              if (open) handleOpen('fuelType');
              else handleOpen('');
            }}
            setValue={() => {}}
            onChangeValue={val => setFilters((prev: any) => ({ ...prev, fuelType: val }))}
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
            value={filters.minSeat}
            items={minSeatItems}
            setOpen={open => {
              if (open) handleOpen('minSeat');
              else handleOpen('');
            }}
            setValue={() => {}}
            onChangeValue={val => setFilters((prev: any) => ({ ...prev, minSeat: val }))}
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

  const Drawer = createDrawerNavigator();

  return (
    <AuthContext.Provider value={{ isLoggedIn, login, logout }}>
      <FilterContext.Provider value={filterContextValue}>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <Drawer.Navigator
            initialRouteName="Main"
            screenOptions={{
              drawerPosition: 'left',
              headerShown: false,
              drawerType: 'front',
              overlayColor: 'rgba(0,0,0,0.2)',
              drawerStyle: { width: 340 },
            }}
          >
            <Drawer.Screen name="Main" options={{ drawerLabel: () => null, title: '', drawerItemStyle: { height: 0 } }}>
              {() => (
                <Stack>
                  <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                  <Stack.Screen name="CarBooking" options={{ headerShown: false }} />
                  <Stack.Screen name="CreateAccount" options={{ headerShown: false }} />
                  <Stack.Screen name="SignIn" options={{ headerShown: false }} />
                  <Stack.Screen name="+not-found" />
                </Stack>
              )}
            </Drawer.Screen>
            <Drawer.Screen name="Filters" component={FilterDrawer} options={{ title: 'Filters' }} />
          </Drawer.Navigator>
          <StatusBar style="auto" />
        </ThemeProvider>
      </FilterContext.Provider>
    </AuthContext.Provider>
  );
}
