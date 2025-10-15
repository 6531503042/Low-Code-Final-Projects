# MeeRaiKin Mobile App

A Flutter mobile application that provides daily meal suggestions with local notifications. Built with clean architecture, Material 3 design, and production-ready features.

## Features

- 🔐 **JWT Authentication** - Secure login with backend API
- 🍽️ **Daily Meal Suggestions** - AI-powered meal recommendations
- 🔔 **Local Notifications** - Reminders at 08:00, 12:00, and 18:00
- ⚙️ **User Preferences** - Customize cuisine, allergens, and budget
- 📅 **Meal Scheduling** - Set custom meal times
- 🎨 **Material 3 Design** - Modern, beautiful UI with rounded cards
- 🌐 **Offline Support** - Cached images and secure storage
- 📱 **Cross-Platform** - iOS and Android support

## Tech Stack

- **Framework**: Flutter (latest stable)
- **State Management**: Riverpod
- **Navigation**: GoRouter
- **HTTP Client**: Dio with interceptors
- **Storage**: Flutter Secure Storage
- **Notifications**: Flutter Local Notifications
- **Timezone**: Timezone + Flutter Native Timezone
- **Images**: Cached Network Image
- **Theme**: Material 3

## Project Structure

```
lib/
├── config/
│   └── env.dart                 # Environment configuration
├── core/
│   ├── app_router.dart          # GoRouter configuration
│   ├── app_theme.dart           # Material 3 theme
│   ├── dio_client.dart          # HTTP client with auth
│   ├── notification_service.dart # Local notifications
│   ├── result.dart              # Result pattern
│   ├── storage.dart             # Secure storage wrapper
│   └── tz_service.dart          # Timezone handling
└── features/
    ├── auth/
    │   ├── data/                # Auth repository
    │   ├── providers/           # Auth state management
    │   └── view/                # Login & splash screens
    ├── suggestions/
    │   ├── data/                # Suggestion repository
    │   ├── models/              # Data models
    │   ├── providers/           # Suggestion state management
    │   └── view/                # Dashboard screen
    ├── preferences/
    │   ├── data/                # Preferences repository
    │   ├── models/              # Preferences models
    │   ├── providers/           # Preferences state management
    │   └── view/                # Preferences screen
    └── schedules/
        ├── data/                # Schedule repository
        ├── models/              # Schedule models
        ├── providers/           # Schedule state management
        └── view/                # Schedule screen
```

## Setup

### Prerequisites

- Flutter SDK (latest stable)
- Dart SDK (latest stable)
- Android Studio / Xcode
- Backend API running (see backend README)

### Installation

1. **Clone and navigate to the project**
   ```bash
   cd frontend/mobile
   ```

2. **Install dependencies**
   ```bash
   flutter pub get
   ```

3. **Configure backend URL**
   
   Edit `lib/config/env.dart`:
   ```dart
   // For Android emulator
   static const String baseUrl = "http://10.0.2.2:3000";
   
   // For real device (change to your computer's LAN IP)
   static const String baseUrl = "http://192.168.1.100:3000";
   ```

4. **Run the app**
   ```bash
   flutter run
   ```

### Demo Credentials

- **Admin**: `admin@meerai.kin` / `Admin123!`
- **User**: `user@meerai.kin` / `User123!`

## Configuration

### Android

The app requires the following permissions:
- `INTERNET` - For API calls
- `POST_NOTIFICATIONS` - For local notifications (Android 13+)
- `WAKE_LOCK` - For notification scheduling
- `VIBRATE` - For notification vibration

### iOS

The app requires notification permissions which are requested at runtime.

## API Integration

The app connects to a NestJS backend with the following endpoints:

- `POST /auth/login` - User authentication
- `GET /auth/me` - Get current user
- `GET /preferences/me` - Get user preferences
- `PATCH /preferences/me` - Update preferences
- `GET /schedules/me` - Get meal schedule
- `PATCH /schedules/me` - Update schedule
- `POST /suggestions/generate-today` - Generate daily suggestions
- `GET /suggestions/today` - Get today's suggestions
- `POST /suggestions/reroll` - Reroll specific meal

## Notifications

The app schedules local notifications for:
- **Breakfast**: 08:00 (default)
- **Lunch**: 12:00 (default)
- **Dinner**: 18:00 (default)

Notifications are automatically rescheduled when:
- User changes meal times
- User rerolls a meal (if time hasn't passed)
- User generates new suggestions

## Development

### Running Tests

```bash
flutter test
```

### Building for Release

**Android:**
```bash
flutter build apk --release
```

**iOS:**
```bash
flutter build ios --release
```

### Code Generation

```bash
flutter packages pub run build_runner build
```

## Architecture

### State Management

The app uses Riverpod for state management with the following patterns:

- **Providers** - Dependency injection
- **StateNotifiers** - Business logic and state updates
- **AsyncValue** - Loading, error, and data states
- **Result Pattern** - Consistent error handling

### Data Flow

1. **UI** triggers actions in providers
2. **Providers** call repositories
3. **Repositories** make API calls
4. **Services** handle side effects (notifications, storage)
5. **UI** updates based on state changes

### Error Handling

- Global error handling in Dio interceptors
- Result pattern for repository methods
- User-friendly error messages
- Automatic retry mechanisms

## Contributing

1. Follow the existing code structure
2. Use meaningful commit messages
3. Add tests for new features
4. Update documentation as needed

## License

MIT License - see LICENSE file for details.
