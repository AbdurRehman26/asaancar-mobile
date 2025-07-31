import { useRouter } from 'expo-router';
import React, { useContext, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
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
      
      // Debug token status
      await apiService.debugTokenStatus();

      const response = await apiService.getCustomerBookings();
      console.log('Bookings API response:', response);

      if (Array.isArray(response)) {
        setBookings(response);
      } else if (response && typeof response === 'object' && Array.isArray((response as any).bookings)) {
        setBookings((response as any).bookings);
      } else if (response && typeof response === 'object' && Array.isArray((response as any).data)) {
        setBookings((response as any).data);
      } else {
        setBookings([]);
      }
    } catch (error: any) {
      console.error('Failed to fetch bookings:', error);
      setError(error.message || 'Failed to load bookings');
      
      // Show mock data for development
      const mockBookings: Booking[] = [
        {
          id: '1',
          car_name: 'Toyota Camry',
          car_brand: 'Toyota',
          start_date: '2024-01-15',
          end_date: '2024-01-17',
          total_amount: 4500,
          status: 'confirmed',
          pickup_location: 'Karachi Airport',
          return_location: 'Karachi Airport',
        },
        {
          id: '2',
          car_name: 'Honda Civic',
          car_brand: 'Honda',
          start_date: '2024-01-20',
          end_date: '2024-01-22',
          total_amount: 3600,
          status: 'pending',
          pickup_location: 'Lahore City Center',
          return_location: 'Lahore City Center',
        },
        {
          id: '3',
          car_name: 'BMW X5',
          car_brand: 'BMW',
          start_date: '2024-01-25',
          end_date: '2024-01-28',
          total_amount: 12000,
          status: 'completed',
          pickup_location: 'Islamabad Airport',
          return_location: 'Islamabad Airport',
        },
      ];
      setBookings(mockBookings);
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

  const renderBookingItem = ({ item }: { item: Booking }) => (
    <TouchableOpacity style={styles.bookingCard}>
      <View style={styles.bookingHeader}>
        <Text style={styles.carName}>{item.car_brand} {item.car_name}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
        </View>
      </View>

      <View style={styles.bookingDetails}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Booking ID:</Text>
          <Text style={styles.detailValue}>#{item.id}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Dates:</Text>
          <Text style={styles.detailValue}>
            {formatDate(item.start_date)} - {formatDate(item.end_date)}
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
          <Text style={styles.totalAmount}>₨{item.total_amount.toLocaleString()}</Text>
        </View>
      </View>

      <View style={styles.bookingActions}>
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionButtonText}>View Details</Text>
        </TouchableOpacity>
        {item.status === 'pending' && (
          <TouchableOpacity style={[styles.actionButton, styles.cancelButton]}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
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
    <View style={styles.container}>
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
          renderItem={renderBookingItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
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
}); 