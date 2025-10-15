import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../data/suggestion_repository.dart';
import '../models/suggestion_models.dart';
import '../../../core/notification_service.dart';
import '../../../core/result.dart';

/// Suggestion repository provider
final suggestionRepositoryProvider = Provider<SuggestionRepository>((ref) {
  return SuggestionRepository();
});

/// Suggestion state notifier
class SuggestionStateNotifier extends StateNotifier<AsyncValue<TodaySuggestion?>> {
  final SuggestionRepository _suggestionRepository;

  SuggestionStateNotifier(this._suggestionRepository) : super(const AsyncValue.loading());

  /// Generate today's suggestions
  Future<void> generateToday() async {
    state = const AsyncValue.loading();
    
    try {
      final result = await _suggestionRepository.generateToday();
      
      result.when(
        onSuccess: (_) {
          // After generating, fetch the suggestions
          getToday();
        },
        onError: (message) {
          state = AsyncValue.error(message, StackTrace.current);
        },
      );
    } catch (e) {
      state = AsyncValue.error(e, StackTrace.current);
    }
  }

  /// Get today's suggestions
  Future<void> getToday() async {
    state = const AsyncValue.loading();
    
    try {
      final result = await _suggestionRepository.getToday();
      
      result.when(
        onSuccess: (suggestion) {
          state = AsyncValue.data(suggestion);
        },
        onError: (message) {
          state = AsyncValue.error(message, StackTrace.current);
        },
      );
    } catch (e) {
      state = AsyncValue.error(e, StackTrace.current);
    }
  }

  /// Reroll specific meal type
  Future<void> reroll(MealType mealType) async {
    try {
      final result = await _suggestionRepository.reroll(mealType);
      
      result.when(
        onSuccess: (_) {
          // Refresh suggestions after reroll
          getToday();
          
          // Reschedule notification for the rerolled meal
          final currentSuggestion = state.valueOrNull;
          if (currentSuggestion != null) {
            final menu = currentSuggestion.getMenuByType(mealType);
            if (menu != null) {
              NotificationService.rescheduleMealNotification(
                mealType: mealType.displayName,
                mealTitle: menu.title,
              );
            }
          }
        },
        onError: (message) {
          print('❌ Reroll error: $message');
          // Don't change state for reroll errors, just log them
        },
      );
    } catch (e) {
      state = AsyncValue.error(e, StackTrace.current);
    }
  }

  /// Refresh suggestions
  Future<void> refresh() async {
    await getToday();
  }

  /// Get current suggestions
  TodaySuggestion? get currentSuggestion {
    return state.valueOrNull;
  }

  /// Check if suggestions are loaded
  bool get hasSuggestions {
    return currentSuggestion != null;
  }

  /// Check if suggestions are complete
  bool get isComplete {
    return currentSuggestion?.isComplete ?? false;
  }
}

/// Suggestion state provider
final suggestionStateProvider = StateNotifierProvider<SuggestionStateNotifier, AsyncValue<TodaySuggestion?>>((ref) {
  final suggestionRepository = ref.watch(suggestionRepositoryProvider);
  return SuggestionStateNotifier(suggestionRepository);
});

/// Current suggestion provider
final currentSuggestionProvider = Provider<TodaySuggestion?>((ref) {
  final suggestionState = ref.watch(suggestionStateProvider);
  return suggestionState.valueOrNull;
});

/// Menu item provider for specific meal type
final menuItemProvider = Provider.family<MenuItem?, MealType>((ref, mealType) {
  final suggestion = ref.watch(currentSuggestionProvider);
  return suggestion?.getMenuByType(mealType);
});
