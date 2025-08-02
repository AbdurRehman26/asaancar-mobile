# AsaanCar Mobile App

A React Native car rental application with real-time chat functionality.

## Features

- Car listing and booking
- User authentication
- Real-time chat with stores
- Booking management
- Filter and search functionality

## Setup

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Expo CLI
- Pusher account for real-time chat

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure Pusher for real-time chat:
   - Sign up at [pusher.com](https://pusher.com)
   - Create a new app
   - Update `constants/Config.ts` with your Pusher credentials:
   ```typescript
   export const PUSHER_CONFIG = {
     APP_ID: 'your-pusher-app-id',
     KEY: 'your-pusher-key',
     SECRET: 'your-pusher-secret',
     CLUSTER: 'ap1', // or your preferred cluster
     FORCE_TLS: true,
   };
   ```

4. Start the development server:
   ```bash
   npm start
   ```

## Real-time Chat Features

- **Pusher Integration**: Real-time messaging using Pusher
- **Typing Indicators**: Shows when users are typing
- **Message History**: Loads previous messages
- **Auto-scroll**: Messages automatically scroll to bottom
- **Offline Support**: Messages are cached and synced when online

## API Endpoints

- `POST /api/login` - User authentication
- `POST /api/register` - User registration
- `GET /api/cars` - Get car listings
- `GET /api/customer/bookings` - Get user bookings
- `GET /api/chat/conversations` - Get chat conversations
- `POST /api/chat/conversations` - Create new conversation
- `GET /api/chat/conversations/{id}/messages` - Get messages
- `POST /api/chat/conversations/{id}/messages` - Send message

## Chat Implementation

The chat system uses:
- **Pusher Channels**: For real-time message delivery
- **Private Channels**: Secure communication between users and stores
- **Typing Events**: Real-time typing indicators
- **Message Persistence**: Messages stored in database
- **Optimistic Updates**: UI updates immediately for better UX

## Development

- Run on web: `npm run web`
- Run on iOS: `npm run ios`
- Run on Android: `npm run android`

## CORS Configuration

To fix CORS errors with Pusher authentication, add the following to your Laravel backend:

### 1. Install CORS package (if not already installed):
```bash
composer require fruitcake/laravel-cors
```

### 2. Publish the config:
```bash
php artisan vendor:publish --provider="Fruitcake\Cors\CorsServiceProvider"
```

### 3. Update `config/cors.php`:
```php
return [
    'paths' => ['api/*', 'broadcasting/*'],
    'allowed_methods' => ['*'],
    'allowed_origins' => ['*'], // In production, specify your domain
    'allowed_origins_patterns' => [],
    'allowed_headers' => ['*'],
    'exposed_headers' => [],
    'max_age' => 0,
    'supports_credentials' => true,
];
```

### 4. Add CORS middleware to your routes in `app/Http/Kernel.php`:
```php
protected $middleware = [
    // ... other middleware
    \Fruitcake\Cors\HandleCors::class,
];
```

### 5. For broadcasting routes specifically, add in `routes/web.php`:
```php
Route::post('/broadcasting/auth', function (Request $request) {
    // Your broadcasting auth logic
})->middleware('cors');
```
