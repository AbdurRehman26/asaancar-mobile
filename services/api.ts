import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { API_CONFIG, ERROR_MESSAGES, STORAGE_KEYS } from '../constants/Config';

// Web-safe storage fallback
const getStorage = () => {
  if (Platform.OS === 'web') {
    return {
      getItem: async (key: string) => {
        try {
          if (typeof window !== 'undefined' && window.localStorage) {
            return window.localStorage.getItem(key);
          }
          return null;
        } catch (error) {
          console.error('localStorage getItem failed:', error);
          return null;
        }
      },
      setItem: async (key: string, value: string) => {
        try {
          if (typeof window !== 'undefined' && window.localStorage) {
            window.localStorage.setItem(key, value);
          }
        } catch (error) {
          console.error('localStorage setItem failed:', error);
        }
      },
      removeItem: async (key: string) => {
        try {
          if (typeof window !== 'undefined' && window.localStorage) {
            window.localStorage.removeItem(key);
          }
        } catch (error) {
          console.error('localStorage removeItem failed:', error);
        }
      },
    };
  }
  return AsyncStorage;
};

class ApiService {
  private baseURL: string;
  private timeout: number;
  private authToken: string | null = null;
  private storage: any;

  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
    this.timeout = API_CONFIG.TIMEOUT;
    this.storage = getStorage();
    this.loadAuthToken();
  }

  private async loadAuthToken() {
    try {
      this.authToken = await this.storage.getItem(STORAGE_KEYS.USER_TOKEN);
    } catch (error) {
      console.error('Failed to load auth token:', error);
    }
  }

  private async saveAuthToken(token: string) {
    this.authToken = token;
    await this.storage.setItem(STORAGE_KEYS.USER_TOKEN, token);
  }

  private async saveUserData(userData: any) {
    await this.storage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(userData));
  }

  private async getUserData(): Promise<any> {
    try {
      const userData = await this.storage.getItem(STORAGE_KEYS.USER_PROFILE);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Failed to get user data:', error);
      return null;
    }
  }

  private async clearAuthToken() {
    try {
      await this.storage.removeItem(STORAGE_KEYS.USER_TOKEN);
      this.authToken = null;
    } catch (error) {
      console.error('Failed to clear auth token:', error);
    }
  }

  private async request(endpoint: string, options: RequestInit = {}): Promise<any> {
    const url = `${this.baseURL}${endpoint}`;
    
    // Ensure we have the latest token
    await this.loadAuthToken();
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...options.headers as Record<string, string>,
    };

    // Add auth token if available
    if (this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }

    const defaultOptions: RequestInit = {
      headers,
      ...options,
    };

    try {
      const response = await fetch(url, defaultOptions);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        // Only log critical errors to reduce console spam
        if (response.status >= 500) {
          console.error('API Error Response:', errorData);
        }
        throw new Error(errorData.message || errorData.error || `HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      // Only log network errors in development
      if (__DEV__) {
        console.error('API request failed:', error);
      }
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(ERROR_MESSAGES.NETWORK_ERROR);
    }
  }

  // Get cars list
  async getCars(params?: any): Promise<any> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key] !== undefined && params[key] !== '') {
          queryParams.append(key, params[key]);
        }
      });
    }
    
    const endpoint = `/api/cars${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return this.request(endpoint);
  }

  // Get car brands
  async getCarBrands(): Promise<any[]> {
    const response = await this.request(API_CONFIG.ENDPOINTS.CAR_BRANDS);
    return response;
  }

  // Get car types
  async getCarTypes(): Promise<any[]> {
    const response = await this.request(API_CONFIG.ENDPOINTS.CAR_TYPES);
    return response;
  }

  // Get car engines
  async getCarEngines(): Promise<any[]> {
    const response = await this.request(API_CONFIG.ENDPOINTS.CAR_ENGINES);
    return response;
  }

  async getCarById(id: string): Promise<any> {
    return this.request(`/cars/${id}`);
  }

  async searchCars(query: string): Promise<any[]> {
    return this.request(`/cars/search?q=${encodeURIComponent(query)}`);
  }

  // Booking-related API calls
  async createBooking(bookingData: any): Promise<any> {
    return this.request('/bookings', {
      method: 'POST',
      body: JSON.stringify(bookingData),
    });
  }

  async getBookings(userId?: string): Promise<any[]> {
    const endpoint = userId ? `/bookings?userId=${userId}` : '/bookings';
    return this.request(endpoint);
  }

  async getCustomerBookings(): Promise<any[]> {
    const response = await this.request('/api/customer/bookings');
    return response;
  }

  async cancelBooking(bookingId: string): Promise<any> {
    return this.request(`/bookings/${bookingId}/cancel`, {
      method: 'PUT',
    });
  }

  // Authentication API calls
  async login(credentials: { email: string; password: string }): Promise<any> {
    const response = await this.request('/api/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    // Save auth token if provided
    if (response.token || response.access_token) {
      const token = response.token || response.access_token;
      await this.saveAuthToken(token);
    }

    // Save user data if provided
    if (response.user) {
      await this.saveUserData(response.user);
    }

    return response;
  }

  async register(userData: { name: string; email: string; password: string }): Promise<any> {
    const response = await this.request('/api/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });

    // Save auth token if provided
    if (response.token || response.access_token) {
      const token = response.token || response.access_token;
      await this.saveAuthToken(token);
    }

    // Save user data if provided
    if (response.user) {
      await this.saveUserData(response.user);
    }

    return response;
  }

  async resetPassword(email: string): Promise<any> {
    const response = await this.request('/api/reset-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });

    return response;
  }

  async logout(): Promise<any> {
    try {
      await this.request('/api/logout', {
        method: 'POST',
      });
    } catch (error) {
      console.error('Logout API failed:', error);
    } finally {
      // Always clear local token
      await this.clearAuthToken();
    }
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!this.authToken;
  }

  // Get current auth token
  async getCurrentToken(): Promise<string | null> {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        return localStorage.getItem('authToken');
      } else {
        const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
        return await AsyncStorage.getItem('authToken');
      }
    } catch (error) {
      console.error('Failed to get current token:', error);
      return null;
    }
  }

  // Check authentication status (async version for initialization)
  async checkAuthStatus(): Promise<boolean> {
    try {
      await this.loadAuthToken();
      return !!this.authToken;
    } catch (error) {
      console.error('Failed to check auth status:', error);
      return false;
    }
  }

  // Refresh token from storage
  async refreshToken(): Promise<void> {
    try {
      await this.loadAuthToken();
    } catch (error) {
      console.error('Failed to refresh token:', error);
    }
  }

  // User profile API calls
  async getUserProfile(userId: string): Promise<any> {
    const response = await this.request(`/users/${userId}`);
    return response;
  }

  async getCurrentUserData(): Promise<any> {
    return await this.getUserData();
  }

  async updateUserProfile(userId: string, profileData: any): Promise<any> {
    const response = await this.request(`/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
    
    // Save updated user data locally
    await this.saveUserData(profileData);
    
    return response;
  }

  // Chat API calls
  async getConversations(): Promise<any[]> {
    const response = await this.request('/api/chat/conversations');
    return response;
  }

  async createConversation(storeId: number): Promise<any> {
    const response = await this.request('/api/chat/conversations', {
      method: 'POST',
      body: JSON.stringify({ 
        store_id: storeId,
        user_id: null, // Will be set by backend from auth token
        type: 'store',
        status: 'active'
      }),
    });
    
    // Check if response is successful and has required data
    if (response && (response.id || response.conversation_id)) {
      return {
        id: response.id || response.conversation_id,
        store_id: storeId,
        user_id: response.user_id || null,
        type: response.type || 'store',
        status: response.status || 'active',
        created_at: response.created_at || new Date().toISOString(),
        updated_at: response.updated_at || new Date().toISOString(),
      };
    } else {
      throw new Error('Invalid response from conversation API');
    }
  }

  async getMessages(conversationId: number): Promise<any[]> {
    const response = await this.request(`/api/chat/conversations/${conversationId}/messages`);
    return response;
  }

  async sendMessage(conversationId: number, message: string): Promise<any> {
    const response = await this.request(`/api/chat/conversations/${conversationId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ 
        message: message,
        sender_type: 'user',
        conversation_id: conversationId
      }),
    });

    // Trigger Pusher event for real-time messaging
    try {
      const pusherService = (await import('./pusher')).default;
      if (pusherService.isConnected()) {
        pusherService.sendMessage(conversationId.toString(), {
          ...response,
          conversation_id: conversationId,
        });
      }
    } catch (pusherError) {
      console.error('Pusher error:', pusherError);
      // Continue without Pusher if it fails
    }

    return response;
  }

  // Location API calls
  async searchLocations(query: string): Promise<any[]> {
    return this.request(`/locations/search?q=${encodeURIComponent(query)}`);
  }

  async getLocationDetails(locationId: string): Promise<any> {
    return this.request(`/locations/${locationId}`);
  }

  // Mock data for development
  getMockCars(): any[] {
    return [
      {
        id: '1',
        name: 'Toyota Camry',
        brand: 'Toyota',
        type: 'Sedan',
        seats: 5,
        transmission: 'Automatic',
        fuelType: 'Petrol',
        pricePerHour: 30,
        pricePerDay: 200,
        image: 'https://via.placeholder.com/300x200/7e246c/ffffff?text=Toyota+Camry',
        available: true,
      },
      {
        id: '2',
        name: 'Honda Civic',
        brand: 'Honda',
        type: 'Sedan',
        seats: 5,
        transmission: 'Manual',
        fuelType: 'Petrol',
        pricePerHour: 25,
        pricePerDay: 180,
        image: 'https://via.placeholder.com/300x200/7e246c/ffffff?text=Honda+Civic',
        available: true,
      },
      {
        id: '3',
        name: 'BMW X5',
        brand: 'BMW',
        type: 'SUV',
        seats: 7,
        transmission: 'Automatic',
        fuelType: 'Diesel',
        pricePerHour: 50,
        pricePerDay: 350,
        image: 'https://via.placeholder.com/300x200/7e246c/ffffff?text=BMW+X5',
        available: true,
      },
      {
        id: '4',
        name: 'Mercedes C-Class',
        brand: 'Mercedes',
        type: 'Sedan',
        seats: 5,
        transmission: 'Automatic',
        fuelType: 'Petrol',
        pricePerHour: 45,
        pricePerDay: 320,
        image: 'https://via.placeholder.com/300x200/7e246c/ffffff?text=Mercedes+C-Class',
        available: true,
      },
      {
        id: '5',
        name: 'Audi A4',
        brand: 'Audi',
        type: 'Sedan',
        seats: 5,
        transmission: 'Automatic',
        fuelType: 'Petrol',
        pricePerHour: 40,
        pricePerDay: 280,
        image: 'https://via.placeholder.com/300x200/7e246c/ffffff?text=Audi+A4',
        available: true,
      },
    ];
  }
}

export const apiService = new ApiService();
export default apiService; 