import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../data/preferences_repository.dart';
import '../models/preferences_models.dart';
import '../../../core/result.dart';

/// Preferences repository provider
final preferencesRepositoryProvider = Provider<PreferencesRepository>((ref) {
  return PreferencesRepository();
});

/// Preferences state notifier
class PreferencesStateNotifier extends StateNotifier<AsyncValue<Preferences?>> {
  final PreferencesRepository _preferencesRepository;

  PreferencesStateNotifier(this._preferencesRepository) : super(const AsyncValue.loading()) {
    loadPreferences();
  }

  /// Load user preferences
  Future<void> loadPreferences() async {
    state = const AsyncValue.loading();
    
    try {
      final result = await _preferencesRepository.getMe();
      
      result.when(
        onSuccess: (preferences) {
          state = AsyncValue.data(preferences);
        },
        onError: (message) {
          // If preferences not found, create empty preferences
          state = AsyncValue.data(Preferences.empty());
        },
      );
    } catch (e) {
      state = AsyncValue.error(e, StackTrace.current);
    }
  }

  /// Update preferences
  Future<void> updatePreferences(Preferences preferences) async {
    state = const AsyncValue.loading();
    
    try {
      final result = await _preferencesRepository.updateMe(preferences);
      
      result.when(
        onSuccess: (updatedPreferences) {
          state = AsyncValue.data(updatedPreferences);
        },
        onError: (message) {
          state = AsyncValue.error(message, StackTrace.current);
        },
      );
    } catch (e) {
      state = AsyncValue.error(e, StackTrace.current);
    }
  }

  /// Update cuisine preferences
  Future<void> updateCuisines(List<String> cuisines) async {
    final currentPreferences = state.valueOrNull ?? Preferences.empty();
    final updatedPreferences = currentPreferences.copyWith(cuisines: cuisines);
    await updatePreferences(updatedPreferences);
  }

  /// Update allergen preferences
  Future<void> updateAllergensAvoid(List<String> allergensAvoid) async {
    final currentPreferences = state.valueOrNull ?? Preferences.empty();
    final updatedPreferences = currentPreferences.copyWith(allergensAvoid: allergensAvoid);
    await updatePreferences(updatedPreferences);
  }

  /// Update budget preferences
  Future<void> updateBudget(int? budgetMin, int? budgetMax) async {
    final currentPreferences = state.valueOrNull ?? Preferences.empty();
    final updatedPreferences = currentPreferences.copyWith(
      budgetMin: budgetMin,
      budgetMax: budgetMax,
    );
    await updatePreferences(updatedPreferences);
  }

  /// Update excluded meal types
  Future<void> updateExcludedMealTypes(List<String> excludedMealTypes) async {
    final currentPreferences = state.valueOrNull ?? Preferences.empty();
    final updatedPreferences = currentPreferences.copyWith(excludedMealTypes: excludedMealTypes);
    await updatePreferences(updatedPreferences);
  }

  /// Toggle cuisine preference
  Future<void> toggleCuisine(String cuisine) async {
    final currentPreferences = state.valueOrNull ?? Preferences.empty();
    final cuisines = List<String>.from(currentPreferences.cuisines);
    
    if (cuisines.contains(cuisine)) {
      cuisines.remove(cuisine);
    } else {
      cuisines.add(cuisine);
    }
    
    await updateCuisines(cuisines);
  }

  /// Toggle allergen avoidance
  Future<void> toggleAllergenAvoid(String allergen) async {
    final currentPreferences = state.valueOrNull ?? Preferences.empty();
    final allergensAvoid = List<String>.from(currentPreferences.allergensAvoid);
    
    if (allergensAvoid.contains(allergen)) {
      allergensAvoid.remove(allergen);
    } else {
      allergensAvoid.add(allergen);
    }
    
    await updateAllergensAvoid(allergensAvoid);
  }

  /// Refresh preferences
  Future<void> refresh() async {
    await loadPreferences();
  }

  /// Get current preferences
  Preferences? get currentPreferences {
    return state.valueOrNull;
  }

  /// Check if preferences are loaded
  bool get hasPreferences {
    return currentPreferences != null;
  }
}

/// Preferences state provider
final preferencesStateProvider = StateNotifierProvider<PreferencesStateNotifier, AsyncValue<Preferences?>>((ref) {
  final preferencesRepository = ref.watch(preferencesRepositoryProvider);
  return PreferencesStateNotifier(preferencesRepository);
});

/// Current preferences provider
final currentPreferencesProvider = Provider<Preferences?>((ref) {
  final preferencesState = ref.watch(preferencesStateProvider);
  return preferencesState.valueOrNull;
});
