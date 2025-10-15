/// User schedule model
class Schedule {
  final List<String> times;
  final String timezone;

  const Schedule({
    required this.times,
    required this.timezone,
  });

  factory Schedule.defaultSchedule() {
    return const Schedule(
      times: ["08:00", "12:00", "18:00"],
      timezone: "Asia/Bangkok",
    );
  }

  factory Schedule.fromJson(Map<String, dynamic> json) {
    return Schedule(
      times: List<String>.from(json['times'] ?? ["08:00", "12:00", "18:00"]),
      timezone: json['timezone'] ?? "Asia/Bangkok",
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'times': times,
      'timezone': timezone,
    };
  }

  /// Create a copy with updated values
  Schedule copyWith({
    List<String>? times,
    String? timezone,
  }) {
    return Schedule(
      times: times ?? this.times,
      timezone: timezone ?? this.timezone,
    );
  }

  /// Get breakfast time
  String get breakfastTime => times.isNotEmpty ? times[0] : "08:00";

  /// Get lunch time
  String get lunchTime => times.length > 1 ? times[1] : "12:00";

  /// Get dinner time
  String get dinnerTime => times.length > 2 ? times[2] : "18:00";

  /// Get time by meal type index
  String getTimeByIndex(int index) {
    if (index >= 0 && index < times.length) {
      return times[index];
    }
    return "08:00"; // Default fallback
  }

  /// Check if times are valid (HH:mm format)
  bool get isValid {
    for (final time in times) {
      if (!_isValidTimeFormat(time)) {
        return false;
      }
    }
    return true;
  }

  /// Validate time format (HH:mm)
  bool _isValidTimeFormat(String time) {
    final regex = RegExp(r'^([01]?[0-9]|2[0-3]):[0-5][0-9]$');
    return regex.hasMatch(time);
  }

  /// Get formatted times for display
  String get formattedTimes {
    return times.join(', ');
  }

  /// Parse time string to hour and minute
  static Map<String, int> parseTime(String time) {
    final parts = time.split(':');
    if (parts.length == 2) {
      return {
        'hour': int.tryParse(parts[0]) ?? 8,
        'minute': int.tryParse(parts[1]) ?? 0,
      };
    }
    return {'hour': 8, 'minute': 0};
  }

  /// Format hour and minute to time string
  static String formatTime(int hour, int minute) {
    return '${hour.toString().padLeft(2, '0')}:${minute.toString().padLeft(2, '0')}';
  }

  /// Check if current time is between meal times
  bool isCurrentTimeMealTime() {
    final now = DateTime.now();
    final currentTime = '${now.hour.toString().padLeft(2, '0')}:${now.minute.toString().padLeft(2, '0')}';
    
    for (final time in times) {
      if (currentTime == time) {
        return true;
      }
    }
    return false;
  }

  /// Get next meal time
  String? getNextMealTime() {
    final now = DateTime.now();
    final currentTime = '${now.hour.toString().padLeft(2, '0')}:${now.minute.toString().padLeft(2, '0')}';
    
    for (final time in times) {
      if (time.compareTo(currentTime) > 0) {
        return time;
      }
    }
    return times.isNotEmpty ? times[0] : null; // Return first meal of next day
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is Schedule &&
        other.times.toString() == times.toString() &&
        other.timezone == timezone;
  }

  @override
  int get hashCode {
    return Object.hash(times, timezone);
  }

  @override
  String toString() {
    return 'Schedule(times: $times, timezone: $timezone)';
  }
}
