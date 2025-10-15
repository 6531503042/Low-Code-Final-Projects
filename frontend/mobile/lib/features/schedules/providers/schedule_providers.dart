import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../data/schedule_repository.dart';
import '../models/schedule_models.dart';
import '../../../core/notification_service.dart';
import '../../../core/result.dart';

/// Schedule repository provider
final scheduleRepositoryProvider = Provider<ScheduleRepository>((ref) {
  return ScheduleRepository();
});

/// Schedule state notifier
class ScheduleStateNotifier extends StateNotifier<AsyncValue<Schedule?>> {
  final ScheduleRepository _scheduleRepository;

  ScheduleStateNotifier(this._scheduleRepository) : super(const AsyncValue.loading()) {
    loadSchedule();
  }

  /// Load user schedule
  Future<void> loadSchedule() async {
    state = const AsyncValue.loading();
    
    try {
      final result = await _scheduleRepository.getMe();
      
      result.when(
        onSuccess: (schedule) {
          state = AsyncValue.data(schedule);
        },
        onError: (message) {
          // If schedule not found, create default schedule
          state = AsyncValue.data(Schedule.defaultSchedule());
        },
      );
    } catch (e) {
      state = AsyncValue.error(e, StackTrace.current);
    }
  }

  /// Update schedule
  Future<void> updateSchedule(Schedule schedule) async {
    state = const AsyncValue.loading();
    
    try {
      final result = await _scheduleRepository.updateMe(schedule);
      
      result.when(
        onSuccess: (updatedSchedule) {
          state = AsyncValue.data(updatedSchedule);
          
          // Reschedule notifications with new times
          _rescheduleNotifications(updatedSchedule);
        },
        onError: (message) {
          state = AsyncValue.error(message, StackTrace.current);
        },
      );
    } catch (e) {
      state = AsyncValue.error(e, StackTrace.current);
    }
  }

  /// Update meal time
  Future<void> updateMealTime(int index, String time) async {
    final currentSchedule = state.valueOrNull ?? Schedule.defaultSchedule();
    final times = List<String>.from(currentSchedule.times);
    
    if (index >= 0 && index < times.length) {
      times[index] = time;
      final updatedSchedule = currentSchedule.copyWith(times: times);
      await updateSchedule(updatedSchedule);
    }
  }

  /// Update timezone
  Future<void> updateTimezone(String timezone) async {
    final currentSchedule = state.valueOrNull ?? Schedule.defaultSchedule();
    final updatedSchedule = currentSchedule.copyWith(timezone: timezone);
    await updateSchedule(updatedSchedule);
  }

  /// Reschedule notifications based on new schedule
  Future<void> _rescheduleNotifications(Schedule schedule) async {
    try {
      // Cancel all existing notifications
      await NotificationService.cancelAll();
      
      // Schedule new notifications
      if (schedule.times.isNotEmpty) {
        final breakfastTime = Schedule.parseTime(schedule.times[0]);
        await NotificationService.scheduleDaily(
          id: 100,
          title: "MeeRaiKin",
          body: "Breakfast time!",
          hour: breakfastTime['hour']!,
          minute: breakfastTime['minute']!,
        );
      }
      
      if (schedule.times.length > 1) {
        final lunchTime = Schedule.parseTime(schedule.times[1]);
        await NotificationService.scheduleDaily(
          id: 200,
          title: "MeeRaiKin",
          body: "Lunch time!",
          hour: lunchTime['hour']!,
          minute: lunchTime['minute']!,
        );
      }
      
      if (schedule.times.length > 2) {
        final dinnerTime = Schedule.parseTime(schedule.times[2]);
        await NotificationService.scheduleDaily(
          id: 300,
          title: "MeeRaiKin",
          body: "Dinner time!",
          hour: dinnerTime['hour']!,
          minute: dinnerTime['minute']!,
        );
      }
    } catch (e) {
      // Handle notification scheduling error silently
      // This shouldn't prevent schedule update
    }
  }

  /// Schedule meal notifications with specific meal titles
  Future<void> scheduleMealNotifications({
    String? breakfastTitle,
    String? lunchTitle,
    String? dinnerTitle,
  }) async {
    final currentSchedule = state.valueOrNull ?? Schedule.defaultSchedule();
    
    if (currentSchedule.times.isNotEmpty) {
      final breakfastTime = Schedule.parseTime(currentSchedule.times[0]);
      await NotificationService.scheduleDaily(
        id: 100,
        title: "MeeRaiKin",
        body: "Breakfast: ${breakfastTitle ?? '—'}",
        hour: breakfastTime['hour']!,
        minute: breakfastTime['minute']!,
      );
    }
    
    if (currentSchedule.times.length > 1) {
      final lunchTime = Schedule.parseTime(currentSchedule.times[1]);
      await NotificationService.scheduleDaily(
        id: 200,
        title: "MeeRaiKin",
        body: "Lunch: ${lunchTitle ?? '—'}",
        hour: lunchTime['hour']!,
        minute: lunchTime['minute']!,
      );
    }
    
    if (currentSchedule.times.length > 2) {
      final dinnerTime = Schedule.parseTime(currentSchedule.times[2]);
      await NotificationService.scheduleDaily(
        id: 300,
        title: "MeeRaiKin",
        body: "Dinner: ${dinnerTitle ?? '—'}",
        hour: dinnerTime['hour']!,
        minute: dinnerTime['minute']!,
      );
    }
  }

  /// Refresh schedule
  Future<void> refresh() async {
    await loadSchedule();
  }

  /// Get current schedule
  Schedule? get currentSchedule {
    return state.valueOrNull;
  }

  /// Check if schedule is loaded
  bool get hasSchedule {
    return currentSchedule != null;
  }
}

/// Schedule state provider
final scheduleStateProvider = StateNotifierProvider<ScheduleStateNotifier, AsyncValue<Schedule?>>((ref) {
  final scheduleRepository = ref.watch(scheduleRepositoryProvider);
  return ScheduleStateNotifier(scheduleRepository);
});

/// Current schedule provider
final currentScheduleProvider = Provider<Schedule?>((ref) {
  final scheduleState = ref.watch(scheduleStateProvider);
  return scheduleState.valueOrNull;
});

/// Meal time providers
final breakfastTimeProvider = Provider<String>((ref) {
  final schedule = ref.watch(currentScheduleProvider);
  return schedule?.breakfastTime ?? "08:00";
});

final lunchTimeProvider = Provider<String>((ref) {
  final schedule = ref.watch(currentScheduleProvider);
  return schedule?.lunchTime ?? "12:00";
});

final dinnerTimeProvider = Provider<String>((ref) {
  final schedule = ref.watch(currentScheduleProvider);
  return schedule?.dinnerTime ?? "18:00";
});
