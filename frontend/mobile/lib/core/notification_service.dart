import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:flutter/foundation.dart';
import '../config/env.dart';
import 'tz_service.dart';

/// Local notification service
class NotificationService {
  static final FlutterLocalNotificationsPlugin _notificationsPlugin =
      FlutterLocalNotificationsPlugin();
  
  static bool _initialized = false;

  /// Initialize notification service
  static Future<bool> init() async {
    if (_initialized) return true;

    try {
      // Initialize timezone first
      await TzService.init();

      // Android initialization settings
      const androidSettings = AndroidInitializationSettings('@mipmap/ic_launcher');
      
      // iOS initialization settings
      const iosSettings = DarwinInitializationSettings(
        requestAlertPermission: true,
        requestBadgePermission: true,
        requestSoundPermission: true,
      );

      const initSettings = InitializationSettings(
        android: androidSettings,
        iOS: iosSettings,
      );

      // Initialize plugin
      final result = await _notificationsPlugin.initialize(
        initSettings,
        onDidReceiveNotificationResponse: _onNotificationTapped,
      );

      if (result == true) {
        // Request permissions
        await _requestPermissions();
        
        // Create notification channel for Android
        await _createNotificationChannel();
        
        _initialized = true;
        return true;
      }
      
      return false;
    } catch (e) {
      if (kDebugMode) {
        print('❌ Notification initialization failed: $e');
      }
      return false;
    }
  }

  /// Request notification permissions
  static Future<void> _requestPermissions() async {
    if (defaultTargetPlatform == TargetPlatform.android) {
      await _notificationsPlugin
          .resolvePlatformSpecificImplementation<AndroidFlutterLocalNotificationsPlugin>()
          ?.requestNotificationsPermission();
    }
  }

  /// Create notification channel for Android
  static Future<void> _createNotificationChannel() async {
    if (defaultTargetPlatform == TargetPlatform.android) {
      const channel = AndroidNotificationChannel(
        Env.notificationChannelId,
        Env.notificationChannelName,
        description: 'Daily meal reminders for MeeRaiKin',
        importance: Importance.high,
        playSound: true,
      );

      await _notificationsPlugin
          .resolvePlatformSpecificImplementation<AndroidFlutterLocalNotificationsPlugin>()
          ?.createNotificationChannel(channel);
    }
  }

  /// Handle notification tap
  static void _onNotificationTapped(NotificationResponse response) {
    if (kDebugMode) {
      print('📱 Notification tapped: ${response.id}');
    }
    // Handle notification tap - could navigate to specific screen
  }

  /// Schedule daily notification at specific time
  static Future<void> scheduleDaily({
    required int id,
    required String title,
    required String body,
    required int hour,
    required int minute,
  }) async {
    try {
      // Cancel existing notification with same ID
      await cancel(id);

      // Get next occurrence of the time
      final scheduledTime = TzService.getNextOccurrence(hour, minute);

      // Create notification details
      const androidDetails = AndroidNotificationDetails(
        Env.notificationChannelId,
        Env.notificationChannelName,
        importance: Importance.high,
        priority: Priority.high,
        playSound: true,
        icon: '@mipmap/ic_launcher',
      );

      const iosDetails = DarwinNotificationDetails(
        presentAlert: true,
        presentBadge: true,
        presentSound: true,
      );

      const details = NotificationDetails(
        android: androidDetails,
        iOS: iosDetails,
      );

      // Schedule notification
      await _notificationsPlugin.zonedSchedule(
        id,
        title,
        body,
        scheduledTime,
        details,
        androidScheduleMode: AndroidScheduleMode.exactAllowWhileIdle,
        uiLocalNotificationDateInterpretation: UILocalNotificationDateInterpretation.absoluteTime,
        matchDateTimeComponents: DateTimeComponents.time,
      );

      if (kDebugMode) {
        print('🔔 Scheduled notification $id for ${scheduledTime.toString()}');
      }
    } catch (e) {
      if (kDebugMode) {
        print('❌ Failed to schedule notification: $e');
      }
    }
  }

  /// Cancel specific notification
  static Future<void> cancel(int id) async {
    await _notificationsPlugin.cancel(id);
    if (kDebugMode) {
      print('🗑️ Cancelled notification $id');
    }
  }

  /// Cancel all notifications
  static Future<void> cancelAll() async {
    await _notificationsPlugin.cancelAll();
    if (kDebugMode) {
      print('🗑️ Cancelled all notifications');
    }
  }

  /// Get pending notifications
  static Future<List<PendingNotificationRequest>> getPendingNotifications() async {
    return await _notificationsPlugin.pendingNotificationRequests();
  }

  /// Schedule meal notifications
  static Future<void> scheduleMealNotifications({
    String? breakfastTitle,
    String? lunchTitle,
    String? dinnerTitle,
  }) async {
    // Schedule breakfast notification
    await scheduleDaily(
      id: Env.breakfastNotificationId,
      title: Env.appName,
      body: "Breakfast: ${breakfastTitle ?? '—'}",
      hour: 8,
      minute: 0,
    );

    // Schedule lunch notification
    await scheduleDaily(
      id: Env.lunchNotificationId,
      title: Env.appName,
      body: "Lunch: ${lunchTitle ?? '—'}",
      hour: 12,
      minute: 0,
    );

    // Schedule dinner notification
    await scheduleDaily(
      id: Env.dinnerNotificationId,
      title: Env.appName,
      body: "Dinner: ${dinnerTitle ?? '—'}",
      hour: 18,
      minute: 0,
    );
  }

  /// Reschedule specific meal notification
  static Future<void> rescheduleMealNotification({
    required String mealType,
    required String mealTitle,
  }) async {
    int id;
    int hour;
    int minute;

    switch (mealType.toLowerCase()) {
      case 'breakfast':
        id = Env.breakfastNotificationId;
        hour = 8;
        minute = 0;
        break;
      case 'lunch':
        id = Env.lunchNotificationId;
        hour = 12;
        minute = 0;
        break;
      case 'dinner':
        id = Env.dinnerNotificationId;
        hour = 18;
        minute = 0;
        break;
      default:
        return;
    }

    await scheduleDaily(
      id: id,
      title: Env.appName,
      body: "${mealType.capitalize()}: $mealTitle",
      hour: hour,
      minute: minute,
    );
  }
}

/// String extension for capitalization
extension StringExtension on String {
  String capitalize() {
    return "${this[0].toUpperCase()}${substring(1).toLowerCase()}";
  }
}
