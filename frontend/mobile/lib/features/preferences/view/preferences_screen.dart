import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../providers/preferences_providers.dart';
import '../models/preferences_models.dart';
import '../../../core/app_router.dart';

/// Preferences screen for managing user preferences
class PreferencesScreen extends ConsumerStatefulWidget {
  const PreferencesScreen({super.key});

  @override
  ConsumerState<PreferencesScreen> createState() => _PreferencesScreenState();
}

class _PreferencesScreenState extends ConsumerState<PreferencesScreen> {
  late Preferences _tempPreferences;
  bool _hasChanges = false;

  @override
  void initState() {
    super.initState();
    _tempPreferences = Preferences.empty();
  }

  /// Update temp preferences
  void _updateTempPreferences(Preferences preferences) {
    setState(() {
      _tempPreferences = preferences;
      _hasChanges = true;
    });
  }

  /// Save preferences
  Future<void> _savePreferences() async {
    try {
      await ref.read(preferencesStateProvider.notifier).updatePreferences(_tempPreferences);
      
      setState(() {
        _hasChanges = false;
      });
      
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Preferences saved successfully'),
            behavior: SnackBarBehavior.floating,
          ),
        );
        AppNavigation.pop(context);
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Failed to save preferences: $e'),
            backgroundColor: Theme.of(context).colorScheme.error,
            behavior: SnackBarBehavior.floating,
          ),
        );
      }
    }
  }

  /// Show unsaved changes dialog
  Future<bool> _showUnsavedChangesDialog() async {
    if (!_hasChanges) return true;

    final result = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Unsaved Changes'),
        content: const Text('You have unsaved changes. Do you want to save them?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(false),
            child: const Text('Discard'),
          ),
          TextButton(
            onPressed: () => Navigator.of(context).pop(true),
            child: const Text('Save'),
          ),
        ],
      ),
    );

    if (result == true) {
      await _savePreferences();
    }

    return true;
  }

  @override
  Widget build(BuildContext context) {
    final preferencesState = ref.watch(preferencesStateProvider);

    // Update temp preferences when state changes
    preferencesState.whenData((preferences) {
      if (preferences != null && !_hasChanges) {
        _tempPreferences = preferences;
      }
    });

    return WillPopScope(
      onWillPop: _showUnsavedChangesDialog,
      child: Scaffold(
        appBar: AppBar(
          title: const Text('Preferences'),
          actions: [
            if (_hasChanges)
              TextButton(
                onPressed: _savePreferences,
                child: const Text('Save'),
              ),
          ],
        ),
        body: preferencesState.when(
          data: (preferences) => _buildPreferencesForm(),
          loading: () => const Center(
            child: CircularProgressIndicator(),
          ),
          error: (error, stack) => Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Icon(
                  Icons.error_outline,
                  size: 64,
                  color: Colors.red,
                ),
                const SizedBox(height: 16),
                Text(
                  'Failed to load preferences',
                  style: Theme.of(context).textTheme.headlineSmall,
                ),
                const SizedBox(height: 8),
                Text(
                  error.toString(),
                  style: Theme.of(context).textTheme.bodyMedium,
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 24),
                FilledButton(
                  onPressed: () {
                    ref.read(preferencesStateProvider.notifier).refresh();
                  },
                  child: const Text('Retry'),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  /// Build preferences form
  Widget _buildPreferencesForm() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Cuisine preferences
          _buildSection(
            title: 'Preferred Cuisines',
            subtitle: 'Select your favorite types of cuisine',
            child: _buildCuisineChips(),
          ),
          
          const SizedBox(height: 24),
          
          // Allergen avoidance
          _buildSection(
            title: 'Allergens to Avoid',
            subtitle: 'Select allergens you want to avoid',
            child: _buildAllergenChips(),
          ),
          
          const SizedBox(height: 24),
          
          // Budget preferences
          _buildSection(
            title: 'Budget Range',
            subtitle: 'Set your preferred price range (in Thai Baht)',
            child: _buildBudgetSliders(),
          ),
          
          const SizedBox(height: 24),
          
          // Excluded meal types
          _buildSection(
            title: 'Excluded Meal Types',
            subtitle: 'Select meal types you don\'t want suggestions for',
            child: _buildMealTypeChips(),
          ),
          
          const SizedBox(height: 32),
          
          // Save button
          SizedBox(
            width: double.infinity,
            child: FilledButton(
              onPressed: _hasChanges ? _savePreferences : null,
              child: const Text('Save Preferences'),
            ),
          ),
        ],
      ),
    );
  }

  /// Build section wrapper
  Widget _buildSection({
    required String title,
    required String subtitle,
    required Widget child,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          title,
          style: Theme.of(context).textTheme.titleLarge?.copyWith(
            fontWeight: FontWeight.w600,
          ),
        ),
        const SizedBox(height: 4),
        Text(
          subtitle,
          style: Theme.of(context).textTheme.bodyMedium?.copyWith(
            color: Theme.of(context).colorScheme.onSurface.withOpacity(0.6),
          ),
        ),
        const SizedBox(height: 12),
        child,
      ],
    );
  }

  /// Build cuisine chips
  Widget _buildCuisineChips() {
    return Wrap(
      spacing: 8,
      runSpacing: 8,
      children: CuisineOptions.options.map((cuisine) {
        final isSelected = _tempPreferences.cuisines.contains(cuisine);
        return FilterChip(
          label: Text(cuisine),
          selected: isSelected,
          onSelected: (selected) {
            final cuisines = List<String>.from(_tempPreferences.cuisines);
            if (selected) {
              cuisines.add(cuisine);
            } else {
              cuisines.remove(cuisine);
            }
            _updateTempPreferences(_tempPreferences.copyWith(cuisines: cuisines));
          },
        );
      }).toList(),
    );
  }

  /// Build allergen chips
  Widget _buildAllergenChips() {
    return Wrap(
      spacing: 8,
      runSpacing: 8,
      children: AllergenOptions.options.map((allergen) {
        final isSelected = _tempPreferences.allergensAvoid.contains(allergen);
        return FilterChip(
          label: Text(allergen),
          selected: isSelected,
          onSelected: (selected) {
            final allergensAvoid = List<String>.from(_tempPreferences.allergensAvoid);
            if (selected) {
              allergensAvoid.add(allergen);
            } else {
              allergensAvoid.remove(allergen);
            }
            _updateTempPreferences(_tempPreferences.copyWith(allergensAvoid: allergensAvoid));
          },
        );
      }).toList(),
    );
  }

  /// Build budget sliders
  Widget _buildBudgetSliders() {
    final budgetMin = _tempPreferences.budgetMin ?? 50;
    final budgetMax = _tempPreferences.budgetMax ?? 200;

    return Column(
      children: [
        // Budget min
        Row(
          children: [
            Expanded(
              child: Text(
                'Minimum: ฿$budgetMin',
                style: Theme.of(context).textTheme.bodyMedium,
              ),
            ),
            Expanded(
              flex: 3,
              child: Slider(
                value: budgetMin.toDouble(),
                min: 0,
                max: 500,
                divisions: 50,
                onChanged: (value) {
                  _updateTempPreferences(_tempPreferences.copyWith(
                    budgetMin: value.round(),
                  ));
                },
              ),
            ),
          ],
        ),
        
        // Budget max
        Row(
          children: [
            Expanded(
              child: Text(
                'Maximum: ฿$budgetMax',
                style: Theme.of(context).textTheme.bodyMedium,
              ),
            ),
            Expanded(
              flex: 3,
              child: Slider(
                value: budgetMax.toDouble(),
                min: budgetMin.toDouble(),
                max: 1000,
                divisions: 50,
                onChanged: (value) {
                  _updateTempPreferences(_tempPreferences.copyWith(
                    budgetMax: value.round(),
                  ));
                },
              ),
            ),
          ],
        ),
        
        // Clear budget button
        Align(
          alignment: Alignment.centerRight,
          child: TextButton(
            onPressed: () {
              _updateTempPreferences(_tempPreferences.copyWith(
                budgetMin: null,
                budgetMax: null,
              ));
            },
            child: const Text('Clear Budget'),
          ),
        ),
      ],
    );
  }

  /// Build meal type chips
  Widget _buildMealTypeChips() {
    const mealTypes = ['breakfast', 'lunch', 'dinner'];
    
    return Wrap(
      spacing: 8,
      runSpacing: 8,
      children: mealTypes.map((mealType) {
        final isSelected = _tempPreferences.excludedMealTypes.contains(mealType);
        return FilterChip(
          label: Text(mealType.capitalize()),
          selected: isSelected,
          onSelected: (selected) {
            final excludedMealTypes = List<String>.from(_tempPreferences.excludedMealTypes);
            if (selected) {
              excludedMealTypes.add(mealType);
            } else {
              excludedMealTypes.remove(mealType);
            }
            _updateTempPreferences(_tempPreferences.copyWith(excludedMealTypes: excludedMealTypes));
          },
        );
      }).toList(),
    );
  }
}

/// String extension for capitalization
extension StringExtension on String {
  String capitalize() {
    return "${this[0].toUpperCase()}${substring(1).toLowerCase()}";
  }
}
