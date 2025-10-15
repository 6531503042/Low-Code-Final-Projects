/// Environment configuration for MeeRaiKin app
class Env {
  // Base URL for iOS simulator (localhost works)
  // For Android emulator, use "http://10.0.2.2:3000"
  // For real device testing, change to your computer's LAN IP (e.g., "192.168.1.100:3000")
  static const String baseUrl = "http://localhost:3000";
  
  // App name
  static const String appName = "MeeRaiKin";
  
  // API endpoints
  static const String loginEndpoint = "/auth/login";
  static const String registerEndpoint = "/auth/register";
  static const String meEndpoint = "/auth/me";
  static const String preferencesMeEndpoint = "/preferences/me";
  static const String schedulesMeEndpoint = "/schedules/me";
  static const String generateTodayEndpoint = "/suggestions/generate-today";
  static const String todayEndpoint = "/suggestions/today";
  static const String rerollEndpoint = "/suggestions/reroll";
  
  // Notification channel
  static const String notificationChannelId = "meerai_channel";
  static const String notificationChannelName = "MeeRaiKin";
  
  // Default meal times (HH:mm format)
  static const List<String> defaultMealTimes = ["08:00", "12:00", "18:00"];
  
  // Notification IDs
  static const int breakfastNotificationId = 100;
  static const int lunchNotificationId = 200;
  static const int dinnerNotificationId = 300;
}
