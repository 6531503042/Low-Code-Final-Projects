import 'package:flutter_native_timezone/flutter_native_timezone.dart';
import 'package:timezone/data/latest.dart' as tz;
import 'package:timezone/timezone.dart' as tz;

/// Timezone service for handling local timezone operations
class TzService {
  static bool _initialized = false;

  /// Initialize timezone service
  static Future<void> init() async {
    if (_initialized) return;

    try {
      // Initialize timezone database
      tz.initializeTimeZones();

      // Get device's local timezone
      final localTimezone = await FlutterNativeTimezone.getLocalTimezone();
      
      // Set local location
      tz.setLocalLocation(tz.getLocation(localTimezone));
      
      _initialized = true;
    } catch (e) {
      // Fallback to UTC if initialization fails
      tz.setLocalLocation(tz.UTC);
      _initialized = true;
    }
  }

  /// Get current local timezone
  static String getCurrentTimezone() {
    return tz.local.name;
  }

  /// Get current date in local timezone
  static DateTime getCurrentDate() {
    return tz.TZDateTime.now(tz.local);
  }

  /// Create a TZDateTime for today at specific hour and minute
  static tz.TZDateTime createTodayAt(int hour, int minute) {
    final now = getCurrentDate();
    return tz.TZDateTime(tz.local, now.year, now.month, now.day, hour, minute);
  }

  /// Create a TZDateTime for tomorrow at specific hour and minute
  static tz.TZDateTime createTomorrowAt(int hour, int minute) {
    final now = getCurrentDate();
    final tomorrow = now.add(const Duration(days: 1));
    return tz.TZDateTime(tz.local, tomorrow.year, tomorrow.month, tomorrow.day, hour, minute);
  }

  /// Check if a time has already passed today
  static bool hasTimePassedToday(int hour, int minute) {
    final now = getCurrentDate();
    final targetTime = tz.TZDateTime(tz.local, now.year, now.month, now.day, hour, minute);
    return now.isAfter(targetTime);
  }

  /// Get next occurrence of a time (today if not passed, tomorrow if passed)
  static tz.TZDateTime getNextOccurrence(int hour, int minute) {
    if (hasTimePassedToday(hour, minute)) {
      return createTomorrowAt(hour, minute);
    } else {
      return createTodayAt(hour, minute);
    }
  }
}
