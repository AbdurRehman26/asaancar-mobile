import { useRouter } from 'expo-router';
import React, { useContext, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    RefreshControl,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { COLORS } from '../../constants/Config';
import apiService from '../../services/api';
import { AuthContext } from '../_layout';

interface Booking {
  id: string;
  car_name: string;
  car_brand: string;
  start_date: string;
  end_date: string;
  total_amount: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  pickup_location: string;
  return_location: string;
}

export default function BookingsScreen() {
  const router = useRouter();
  const { isLoggedIn } = useContext(AuthContext);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBookings = async (isRefresh = false) => {
    try {
      setError(null);
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      // Refresh token before making API call
      await apiService.refreshToken();

      const response = await apiService.getCustomerBookings();
      
      if (response && Array.isArray(response)) {
        setBookings(response);
      } else if (response && typeof response === 'object' && (response as any).bookings) {
        setBookings((response as any).bookings);
      } else if (response && typeof response === 'object' && (response as any).data) {
        setBookings((response as any).data);
      } else {
        setBookings([]);
      }
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
      // Use mock data as fallback
      setBookings([
        {
          id: '1',
          car_name: 'Toyota Camry',
          car_brand: 'Toyota',
          start_date: '2024-01-15',
          end_date: '2024-01-17',
          total_amount: 150,
          status: 'confirmed',
          pickup_location: 'Downtown Office',
          return_location: 'Airport Terminal',
        },
        {
          id: '2',
          car_name: 'Honda Civic',
          car_brand: 'Honda',
          start_date: '2024-01-05',
          end_date: '2024-01-07',
          total_amount: 135,
          status: 'completed',
          pickup_location: 'Shopping Mall',
          return_location: 'Shopping Mall',
        },
      ]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      fetchBookings();
    }
  }, [isLoggedIn]);

  const onRefresh = () => {
    fetchBookings(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return COLORS.SUCCESS;
      case 'pending':
        return COLORS.WARNING;
      case 'completed':
        return '#4A90E2';
      case 'cancelled':
        return COLORS.ERROR;
      default:
        return COLORS.GRAY;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'Confirmed';
      case 'pending':
        return 'Pending';
      case 'completed':
        return 'Completed';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleChatWithStore = (storeId: number, storeName: string) => {
    // Navigate to chat screen with store info
    router.push({
      pathname: '/(tabs)/chat',
      params: { storeId: storeId.toString(), storeName }
    });
  };

  const renderBookingCard = ({ item }: { item: Booking }) => (
    <View style={styles.bookingCard}>
      <View style={styles.bookingHeader}>
        <Text style={styles.carName}>{item.car_name}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>
      
      <View style={styles.bookingDetails}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Dates:</Text>
          <Text style={styles.detailValue}>
            {item.start_date} - {item.end_date}
          </Text>
        </View>
        
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Pickup:</Text>
          <Text style={styles.detailValue}>{item.pickup_location}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Return:</Text>
          <Text style={styles.detailValue}>{item.return_location}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Total:</Text>
          <Text style={styles.totalAmount}>₨{item.total_amount}</Text>
        </View>
      </View>
      
      <View style={styles.bookingActions}>
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionButtonText}>View Details</Text>
        </TouchableOpacity>
        
        {isLoggedIn && (
          <TouchableOpacity 
            style={[styles.actionButton, styles.chatButton]}
            onPress={() => handleChatWithStore(1, 'Car Rental Store')} // Using store ID 1 for demo
          >
            <Text style={styles.chatButtonText}>💬 Chat</Text>
          </TouchableOpacity>
        )}
        
        {item.status === 'confirmed' && (
          <TouchableOpacity style={[styles.actionButton, styles.cancelButton]}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  if (!isLoggedIn) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>My Bookings</Text>
        </View>
        <View style={styles.centerContent}>
          <Text style={styles.loginMessage}>Please log in to view your bookings</Text>
          <TouchableOpacity style={styles.loginButton} onPress={() => router.push('/LoginScreen')}>
            <Text style={styles.loginButtonText}>Login</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>My Bookings</Text>
        </View>

      {loading ? (
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={COLORS.PRIMARY} />
          <Text style={styles.loadingText}>Loading bookings...</Text>
        </View>
      ) : error ? (
        <View style={styles.centerContent}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => fetchBookings()}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : bookings.length === 0 ? (
        <View style={styles.centerContent}>
          <Text style={styles.emptyText}>No bookings found</Text>
          <Text style={styles.emptySubtext}>You haven't made any bookings yet</Text>
          <TouchableOpacity style={styles.browseButton} onPress={() => router.push('/(tabs)')}>
            <Text style={styles.browseButtonText}>Browse Cars</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={bookings}
          renderItem={renderBookingCard}
          keyExtractor={(item) => `booking-${item.id}`}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: COLORS.WHITE,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.LIGHT_GRAY,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.BLACK,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: COLORS.GRAY,
  },
  errorText: {
    fontSize: 16,
    color: COLORS.ERROR,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: COLORS.PRIMARY,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: COLORS.WHITE,
    fontSize: 16,
    fontWeight: '600',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.BLACK,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: COLORS.GRAY,
    textAlign: 'center',
    marginBottom: 20,
  },
  browseButton: {
    backgroundColor: COLORS.PRIMARY,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  browseButtonText: {
    color: COLORS.WHITE,
    fontSize: 16,
    fontWeight: '600',
  },
  loginMessage: {
    fontSize: 16,
    color: COLORS.GRAY,
    textAlign: 'center',
    marginBottom: 20,
  },
  loginButton: {
    backgroundColor: COLORS.PRIMARY,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  loginButtonText: {
    color: COLORS.WHITE,
    fontSize: 16,
    fontWeight: '600',
  },
  listContainer: {
    padding: 20,
  },
  bookingCard: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  carName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.BLACK,
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.WHITE,
  },
  bookingDetails: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: COLORS.GRAY,
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 14,
    color: COLORS.BLACK,
    fontWeight: '600',
  },
  totalAmount: {
    fontSize: 16,
    color: COLORS.PRIMARY,
    fontWeight: 'bold',
  },
  bookingActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    backgroundColor: COLORS.PRIMARY,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionButtonText: {
    color: COLORS.WHITE,
    fontSize: 14,
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: COLORS.ERROR,
  },
  cancelButtonText: {
    color: COLORS.WHITE,
    fontSize: 14,
    fontWeight: '600',
  },
  chatButton: {
    backgroundColor: '#2196F3',
  },
  chatButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
}); 