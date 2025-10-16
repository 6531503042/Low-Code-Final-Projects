import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../providers/preferences_providers.dart';
import '../models/preferences_models.dart';

/// Preferences screen with modern minimal design
class PreferencesScreen extends ConsumerStatefulWidget {
  const PreferencesScreen({super.key});

  @override
  ConsumerState<PreferencesScreen> createState() => _PreferencesScreenState();
}

class _PreferencesScreenState extends ConsumerState<PreferencesScreen> {
  late Preferences _tempPreferences;
  bool _hasChanges = false;
  bool _isSaving = false;

  @override
  void initState() {
    super.initState();
    _tempPreferences = Preferences.empty();
    
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(preferencesStateProvider.notifier).fetchPreferences();
    });
  }

  void _updateTempPreferences(Preferences preferences) {
    setState(() {
      _tempPreferences = preferences;
      _hasChanges = true;
    });
  }

  Future<void> _savePreferences() async {
    if (_isSaving) return;
    
    setState(() => _isSaving = true);
    HapticFeedback.mediumImpact();
    
    try {
      await ref.read(preferencesStateProvider.notifier).updatePreferences(_tempPreferences);
      
      setState(() {
        _hasChanges = false;
        _isSaving = false;
      });
      
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: const Text('✓ Preferences saved successfully'),
            backgroundColor: const Color(0xFF4ECDC4),
            behavior: SnackBarBehavior.floating,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          ),
        );
        context.pop();
      }
    } catch (e) {
      setState(() => _isSaving = false);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Failed to save: $e'),
            backgroundColor: const Color(0xFFFF6B6B),
            behavior: SnackBarBehavior.floating,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final preferencesState = ref.watch(preferencesStateProvider);

    return PopScope(
      canPop: !_hasChanges,
      onPopInvokedWithResult: (didPop, result) {
        if (!didPop && _hasChanges) {
          _showUnsavedDialog();
        }
      },
      child: Scaffold(
        backgroundColor: const Color(0xFFF8F9FA),
        appBar: AppBar(
          backgroundColor: Colors.white,
          elevation: 0,
          leading: IconButton(
            icon: Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: Colors.grey[100],
                borderRadius: BorderRadius.circular(12),
              ),
              child: const Icon(Icons.arrow_back, color: Colors.black87, size: 20),
            ),
            onPressed: () {
              if (_hasChanges) {
                _showUnsavedDialog();
              } else {
                if (context.canPop()) {
                  context.pop();
                } else {
                  context.go('/dashboard');
                }
              }
            },
          ),
          title: const Text(
            'Preferences',
            style: TextStyle(
              color: Colors.black87,
              fontWeight: FontWeight.bold,
              fontSize: 20,
            ),
          ),
          centerTitle: true,
        ),
        body: preferencesState.when(
          data: (preferences) {
            if (_tempPreferences.cuisines.isEmpty && preferences != null) {
              WidgetsBinding.instance.addPostFrameCallback((_) {
                if (mounted) {
                  setState(() {
                    _tempPreferences = preferences;
                  });
                }
              });
            }
            
            return _buildContent();
          },
          loading: () => const Center(child: CircularProgressIndicator()),
          error: (error, _) => Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Icon(Icons.error_outline, size: 64, color: Color(0xFFFF6B6B)),
                const SizedBox(height: 16),
                Text(
                  error.toString(),
                  textAlign: TextAlign.center,
                  style: TextStyle(color: Colors.grey[600]),
                ),
              ],
            ),
          ),
        ),
        bottomNavigationBar: _hasChanges
            ? Container(
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: Colors.white,
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withOpacity(0.05),
                      blurRadius: 10,
                      offset: const Offset(0, -5),
                    ),
                  ],
                ),
                child: SafeArea(
                  child: ElevatedButton(
                    onPressed: _isSaving ? null : _savePreferences,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF667eea),
                      padding: const EdgeInsets.symmetric(vertical: 16),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(16),
                      ),
                      elevation: 0,
                    ),
                    child: _isSaving
                        ? const SizedBox(
                            height: 20,
                            width: 20,
                            child: CircularProgressIndicator(
                              strokeWidth: 2,
                              valueColor: AlwaysStoppedAnimation(Colors.white),
                            ),
                          )
                        : const Text(
                            'Save Preferences',
                            style: TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.bold,
                              color: Colors.white,
                            ),
                          ),
                  ),
                ),
              )
            : null,
      ),
    );
  }

  Widget _buildContent() {
    return SingleChildScrollView(
      physics: const BouncingScrollPhysics(),
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildSection(
            'Preferred Cuisines',
            'Select your favorite types of cuisine',
            _buildCuisineChips(),
          ),
          const SizedBox(height: 24),
          _buildSection(
            'Allergens to Avoid',
            'Select allergens you want to avoid',
            _buildAllergenChips(),
          ),
          const SizedBox(height: 24),
          _buildSection(
            'Budget Range',
            'Set your preferred price range (in Thai Baht)',
            _buildBudgetSlider(),
          ),
          const SizedBox(height: 100),
        ],
      ),
    );
  }

  Widget _buildSection(String title, String subtitle, Widget child) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.03),
            blurRadius: 10,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            title,
            style: const TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: Colors.black87,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            subtitle,
            style: TextStyle(
              fontSize: 13,
              color: Colors.grey[600],
            ),
          ),
          const SizedBox(height: 16),
          child,
        ],
      ),
    );
  }

  Widget _buildCuisineChips() {
    final cuisines = [
      'Thai', 'Japanese', 'Chinese', 'Korean', 'Western',
      'Italian', 'Indian', 'Mexican', 'Vietnamese', 'French',
      'Mediterranean', 'American', 'German', 'Spanish', 'Middle Eastern',
    ];

    return Wrap(
      spacing: 8,
      runSpacing: 8,
      children: cuisines.map((cuisine) {
        final isSelected = _tempPreferences.cuisines.contains(cuisine);
        return _buildChip(
          cuisine,
          isSelected,
          const Color(0xFF667eea),
          () {
            HapticFeedback.lightImpact();
            final newCuisines = List<String>.from(_tempPreferences.cuisines);
            if (isSelected) {
              newCuisines.remove(cuisine);
            } else {
              newCuisines.add(cuisine);
            }
            _updateTempPreferences(_tempPreferences.copyWith(cuisines: newCuisines));
          },
        );
      }).toList(),
    );
  }

  Widget _buildAllergenChips() {
    final allergens = [
      'peanut', 'tree nuts', 'dairy', 'eggs', 'soy',
      'wheat', 'gluten', 'fish', 'shellfish', 'sesame',
      'mustard', 'sulfites',
    ];

    return Wrap(
      spacing: 8,
      runSpacing: 8,
      children: allergens.map((allergen) {
        final isSelected = _tempPreferences.allergensAvoid.contains(allergen);
        return _buildChip(
          allergen,
          isSelected,
          const Color(0xFFFF6B6B),
          () {
            HapticFeedback.lightImpact();
            final newAllergens = List<String>.from(_tempPreferences.allergensAvoid);
            if (isSelected) {
              newAllergens.remove(allergen);
            } else {
              newAllergens.add(allergen);
            }
            _updateTempPreferences(_tempPreferences.copyWith(allergensAvoid: newAllergens));
          },
        );
      }).toList(),
    );
  }

  Widget _buildChip(String label, bool isSelected, Color color, VoidCallback onTap) {
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
        decoration: BoxDecoration(
          color: isSelected ? color : Colors.grey[100],
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: isSelected ? color : Colors.grey[300]!,
            width: 1.5,
          ),
        ),
        child: Text(
          label,
          style: TextStyle(
            color: isSelected ? Colors.white : Colors.grey[700],
            fontWeight: isSelected ? FontWeight.w600 : FontWeight.w500,
            fontSize: 14,
          ),
        ),
      ),
    );
  }

  Widget _buildBudgetSlider() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              '฿${_tempPreferences.budgetMin}',
              style: const TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.bold,
                color: Color(0xFF667eea),
              ),
            ),
            const Text(
              '—',
              style: TextStyle(color: Colors.grey),
            ),
            Text(
              '฿${_tempPreferences.budgetMax}',
              style: const TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.bold,
                color: Color(0xFF667eea),
              ),
            ),
          ],
        ),
        const SizedBox(height: 16),
        RangeSlider(
          values: RangeValues(
            (_tempPreferences.budgetMin ?? 0).toDouble(),
            (_tempPreferences.budgetMax ?? 500).toDouble(),
          ),
          min: 0,
          max: 500,
          divisions: 50,
          activeColor: const Color(0xFF667eea),
          inactiveColor: Colors.grey[200],
          onChanged: (RangeValues values) {
            HapticFeedback.selectionClick();
            _updateTempPreferences(
              _tempPreferences.copyWith(
                budgetMin: values.start.round(),
                budgetMax: values.end.round(),
              ),
            );
          },
        ),
      ],
    );
  }

  Future<void> _showUnsavedDialog() async {
    final result = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: const Text('Unsaved Changes'),
        content: const Text('You have unsaved changes. Do you want to save them?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: Text(
              'Discard',
              style: TextStyle(color: Colors.grey[600]),
            ),
          ),
          ElevatedButton(
            onPressed: () => Navigator.pop(context, true),
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF667eea),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            ),
            child: const Text('Save'),
          ),
        ],
      ),
    );

    if (result == true) {
      await _savePreferences();
    } else if (result == false) {
      if (mounted) context.pop();
    }
  }
}
