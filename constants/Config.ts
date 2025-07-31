// API Configuration
export const API_CONFIG = {
  BASE_URL: 'http://asaancar.test',
  TIMEOUT: 30000, // 30 seconds
  RETRY_ATTEMPTS: 3,
};

// Google Maps Configuration
export const MAPS_CONFIG = {
  API_KEY: 'YOUR_GOOGLE_MAPS_API_KEY', // Replace with actual API key
  DEFAULT_LATITUDE: 24.8607, // Karachi, Pakistan
  DEFAULT_LONGITUDE: 67.0011,
  DEFAULT_ZOOM: 12,
};

// App Configuration
export const APP_CONFIG = {
  APP_NAME: 'AsaanCar',
  VERSION: '1.0.0',
  BUILD_NUMBER: '1',
  SUPPORT_EMAIL: 'support@asaancar.com',
  SUPPORT_PHONE: '+92-300-1234567',
};

// Theme Colors
export const COLORS = {
  PRIMARY: '#7e246c',
  PRIMARY_LIGHT: '#F3E5F5',
  SECONDARY: '#8E8E93',
  SUCCESS: '#4CAF50',
  WARNING: '#FF9800',
  ERROR: '#F44336',
  WHITE: '#FFFFFF',
  BLACK: '#000000',
  GRAY: '#666666',
  LIGHT_GRAY: '#E0E0E0',
  BACKGROUND: '#F8F9FB',
};

// Car Configuration
export const CAR_CONFIG = {
  DEFAULT_PRICE_PER_HOUR: 30,
  DEFAULT_PRICE_PER_DAY: 200,
  MAX_SEATS: 8,
  MIN_SEATS: 2,
  FUEL_TYPES: ['Petrol', 'Diesel', 'Electric', 'Hybrid'],
  TRANSMISSION_TYPES: ['Manual', 'Automatic'],
  CAR_TYPES: ['Sedan', 'SUV', 'Hatchback', 'Van', 'Luxury'],
  BRANDS: ['Toyota', 'Honda', 'Suzuki', 'BMW', 'Mercedes', 'Audi', 'Other'],
};

// Booking Configuration
export const BOOKING_CONFIG = {
  MIN_BOOKING_HOURS: 1,
  MAX_BOOKING_DAYS: 30,
  ADVANCE_BOOKING_DAYS: 7,
  CANCELLATION_HOURS: 24,
  DEPOSIT_PERCENTAGE: 20,
};

// Payment Configuration
export const PAYMENT_CONFIG = {
  CURRENCY: 'PKR',
  CURRENCY_SYMBOL: '₨',
  TAX_PERCENTAGE: 15,
  SERVICE_FEE_PERCENTAGE: 5,
};

// Storage Keys
export const STORAGE_KEYS = {
  USER_TOKEN: 'user_token',
  USER_PROFILE: 'user_profile',
  BOOKING_HISTORY: 'booking_history',
  FAVORITE_CARS: 'favorite_cars',
  SEARCH_HISTORY: 'search_history',
  APP_SETTINGS: 'app_settings',
};

// Validation Rules
export const VALIDATION = {
  PASSWORD_MIN_LENGTH: 8,
  PHONE_REGEX: /^(\+92|0)?[0-9]{10}$/,
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 50,
};

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  INVALID_CREDENTIALS: 'Invalid email or password.',
  EMAIL_REQUIRED: 'Email is required.',
  PASSWORD_REQUIRED: 'Password is required.',
  NAME_REQUIRED: 'Name is required.',
  PHONE_REQUIRED: 'Phone number is required.',
  INVALID_EMAIL: 'Please enter a valid email address.',
  INVALID_PHONE: 'Please enter a valid phone number.',
  PASSWORD_TOO_SHORT: 'Password must be at least 8 characters.',
  NAME_TOO_SHORT: 'Name must be at least 2 characters.',
  TERMS_REQUIRED: 'You must agree to the terms and conditions.',
  USER_NOT_FOUND: 'User not found.',
  ACCOUNT_EXISTS: 'An account with this email already exists.',
  WEAK_PASSWORD: 'Password is too weak.',
  INVALID_TOKEN: 'Invalid or expired token.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  SERVER_ERROR: 'Server error. Please try again later.',
  TIMEOUT_ERROR: 'Request timed out. Please try again.',
};

// Success Messages
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Login successful!',
  SIGNUP_SUCCESS: 'Account created successfully!',
  LOGOUT_SUCCESS: 'Logged out successfully!',
  PROFILE_UPDATED: 'Profile updated successfully!',
  BOOKING_CREATED: 'Booking created successfully!',
  BOOKING_CANCELLED: 'Booking cancelled successfully!',
  PASSWORD_CHANGED: 'Password changed successfully!',
  EMAIL_VERIFIED: 'Email verified successfully!',
  PAYMENT_SUCCESS: 'Payment processed successfully!',
};

// Navigation Routes
export const ROUTES = {
  SPLASH: '/SplashScreen',
  ONBOARDING: '/OnboardingScreen',
  LANDING: '/LandingScreen',
  LOGIN: '/LoginScreen',
  SIGNUP: '/CreateAccount',
  HOME: '/(tabs)',
  CAR_BOOKING: '/CarBooking',
  CHAT: '/(tabs)/chat',
  PROFILE: '/(tabs)/profile',
};

// Date Formats
export const DATE_FORMATS = {
  DISPLAY: 'MMM dd, yyyy',
  API: 'yyyy-MM-dd',
  TIME: 'HH:mm',
  DATETIME: 'MMM dd, yyyy HH:mm',
};

// Animation Durations
export const ANIMATION = {
  FAST: 200,
  NORMAL: 300,
  SLOW: 500,
  SPLASH_DURATION: 3000,
};

// Image Configuration
export const IMAGE_CONFIG = {
  CAR_THUMBNAIL_WIDTH: 300,
  CAR_THUMBNAIL_HEIGHT: 200,
  PROFILE_IMAGE_SIZE: 150,
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  SUPPORTED_FORMATS: ['jpg', 'jpeg', 'png', 'webp'],
};

// Feature Flags
export const FEATURES = {
  ENABLE_CHAT: true,
  ENABLE_NOTIFICATIONS: true,
  ENABLE_LOCATION_SERVICES: true,
  ENABLE_PUSH_NOTIFICATIONS: true,
  ENABLE_BIOMETRIC_AUTH: false,
  ENABLE_DARK_MODE: true,
};

// Development Configuration
export const DEV_CONFIG = {
  ENABLE_LOGS: __DEV__,
  MOCK_API: __DEV__,
  MOCK_DELAY: 1000,
  ENABLE_DEBUG_MENU: __DEV__,
}; 