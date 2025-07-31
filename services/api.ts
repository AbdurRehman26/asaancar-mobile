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
      console.log('Token loaded from storage:', this.authToken ? 'Available' : 'Not available');
      if (this.authToken) {
        console.log('Token value:', this.authToken.substring(0, 30) + '...');
      }
    } catch (error) {
      console.error('Failed to load auth token:', error);
    }
  }

  private async saveAuthToken(token: string) {
    try {
      console.log('Saving auth token to storage:', token.substring(0, 30) + '...');
      await this.storage.setItem(STORAGE_KEYS.USER_TOKEN, token);
      this.authToken = token;
      console.log('Auth token saved successfully');
    } catch (error) {
      console.error('Failed to save auth token:', error);
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
      console.log(`Adding auth token to request: ${this.authToken.substring(0, 20)}...`);
    } else {
      console.log('No auth token available for request');
    }

    const defaultOptions: RequestInit = {
      headers,
      ...options,
    };

    try {
      console.log(`Making API request to: ${url}`);
      console.log('Request headers:', JSON.stringify(headers, null, 2));
      console.log('Full request options:', JSON.stringify(defaultOptions, null, 2));
      const response = await fetch(url, defaultOptions);
      
      console.log(`Response status: ${response.status}`);
      console.log('Response headers:', response.headers);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('API Error Response:', errorData);
        throw new Error(errorData.message || errorData.error || `HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('API Response data:', data);
      return data;
    } catch (error) {
      console.error('API request failed:', error);
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
    try {
      const response = await this.request('/api/customer/bookings');
      return response;
    } catch (error) {
      console.error('Get customer bookings API failed, using mock response:', error);
      
      // Mock bookings response for development
      return [
        {
          id: 1,
          car: {
            id: 1,
            name: 'Toyota Camry',
            brand: 'Toyota',
            model: 'Camry',
            year: 2022,
            image: 'https://via.placeholder.com/300x200',
            price: 50,
          },
          status: 'confirmed',
          startDate: '2024-01-15',
          endDate: '2024-01-17',
          pickupLocation: 'Downtown Office',
          returnLocation: 'Airport Terminal',
          totalAmount: 150,
          createdAt: '2024-01-10T10:00:00Z',
        },
        {
          id: 2,
          car: {
            id: 3,
            name: 'Honda Civic',
            brand: 'Honda',
            model: 'Civic',
            year: 2023,
            image: 'https://via.placeholder.com/300x200',
            price: 45,
          },
          status: 'completed',
          startDate: '2024-01-05',
          endDate: '2024-01-07',
          pickupLocation: 'Shopping Mall',
          returnLocation: 'Shopping Mall',
          totalAmount: 135,
          createdAt: '2024-01-01T14:30:00Z',
        },
      ];
    }
  }

  async cancelBooking(bookingId: string): Promise<any> {
    return this.request(`/bookings/${bookingId}/cancel`, {
      method: 'PUT',
    });
  }

  // Authentication API calls
  async login(credentials: { email: string; password: string }): Promise<any> {
    try {
      const response = await this.request('/api/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      });

      console.log('Login API response:', response);

      // Save auth token if provided
      if (response.token || response.access_token) {
        const token = response.token || response.access_token;
        await this.saveAuthToken(token);
        console.log('Auth token saved successfully');
      }

      return response;
    } catch (error) {
      console.error('Login API failed, using mock response:', error);
      
      // Mock login response for development
      const mockToken = 'mock_jwt_token_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      const mockResponse = {
        success: true,
        token: mockToken,
        user: {
          id: 1,
          name: 'Test User',
          email: credentials.email,
        },
        message: 'Login successful (mock)',
      };
      
      // Save the mock token
      await this.saveAuthToken(mockToken);
      console.log('Mock auth token saved successfully');
      
      return mockResponse;
    }
  }

  async register(userData: { name: string; email: string; password: string }): Promise<any> {
    try {
      const response = await this.request('/api/register', {
        method: 'POST',
        body: JSON.stringify(userData),
      });

      console.log('Registration API response:', response);

      // Save auth token if provided
      if (response.token || response.access_token) {
        const token = response.token || response.access_token;
        await this.saveAuthToken(token);
        console.log('Auth token saved successfully');
      }

      return response;
    } catch (error) {
      console.error('Registration API failed, using mock response:', error);
      
      // Mock registration response for development
      const mockToken = 'mock_jwt_token_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      const mockResponse = {
        success: true,
        token: mockToken,
        user: {
          id: 2,
          name: userData.name,
          email: userData.email,
        },
        message: 'Registration successful (mock)',
      };
      
      // Save the mock token
      await this.saveAuthToken(mockToken);
      console.log('Mock auth token saved successfully');
      
      return mockResponse;
    }
  }

  async resetPassword(email: string): Promise<any> {
    try {
      const response = await this.request('/api/reset-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });

      return response;
    } catch (error) {
      console.log('Reset password API failed, using mock response:', error);
      
      // Mock reset password for development
      return {
        success: true,
        message: 'Password reset email sent (mock)',
      };
    }
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
  getAuthToken(): string | null {
    return this.authToken;
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
      console.log('Token refreshed:', this.authToken ? 'Available' : 'Not available');
    } catch (error) {
      console.error('Failed to refresh token:', error);
    }
  }

  // Get current token (with refresh)
  async getCurrentToken(): Promise<string | null> {
    await this.refreshToken();
    return this.authToken;
  }

  // Debug method to check token status
  async debugTokenStatus(): Promise<void> {
    console.log('=== Token Debug Info ===');
    console.log('Current authToken in memory:', this.authToken ? 'Available' : 'Not available');
    if (this.authToken) {
      console.log('Token value:', this.authToken.substring(0, 30) + '...');
    }
    
    try {
      const storedToken = await this.storage.getItem(STORAGE_KEYS.USER_TOKEN);
      console.log('Token in storage:', storedToken ? 'Available' : 'Not available');
      if (storedToken) {
        console.log('Stored token value:', storedToken.substring(0, 30) + '...');
      }
    } catch (error) {
      console.error('Error reading from storage:', error);
    }
    console.log('=== End Token Debug ===');
  }

  // User profile API calls
  async getUserProfile(userId: string): Promise<any> {
    return this.request(`/users/${userId}`);
  }

  async updateUserProfile(userId: string, profileData: any): Promise<any> {
    return this.request(`/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  // Chat API calls
  async getChats(userId: string): Promise<any[]> {
    return this.request(`/chats?userId=${userId}`);
  }

  async sendMessage(chatId: string, message: string): Promise<any> {
    return this.request(`/chats/${chatId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ message }),
    });
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