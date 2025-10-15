import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../providers/schedule_providers.dart';
import '../models/schedule_models.dart';
import '../../../core/app_router.dart';

/// Schedule screen for managing meal times
class ScheduleScreen extends ConsumerStatefulWidget {
  const ScheduleScreen({super.key});

  @override
  ConsumerState<ScheduleScreen> createState() => _ScheduleScreenState();
}

class _ScheduleScreenState extends ConsumerState<ScheduleScreen> {
  late Schedule _tempSchedule;
  bool _hasChanges = false;

  @override
  void initState() {
    super.initState();
    _tempSchedule = Schedule.defaultSchedule();
  }

  /// Update temp schedule
  void _updateTempSchedule(Schedule schedule) {
    setState(() {
      _tempSchedule = schedule;
      _hasChanges = true;
    });
  }

  /// Save schedule
  Future<void> _saveSchedule() async {
    try {
      await ref.read(scheduleStateProvider.notifier).updateSchedule(_tempSchedule);
      
      setState(() {
        _hasChanges = false;
      });
      
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Schedule saved successfully'),
            behavior: SnackBarBehavior.floating,
          ),
        );
        AppNavigation.pop(context);
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Failed to save schedule: $e'),
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
      await _saveSchedule();
    }

    return true;
  }

  /// Show time picker
  Future<void> _showTimePicker(int index) async {
    final currentTime = _tempSchedule.getTimeByIndex(index);
    final timeParts = currentTime.split(':');
    final hour = int.parse(timeParts[0]);
    final minute = int.parse(timeParts[1]);

    final time = await showTimePicker(
      context: context,
      initialTime: TimeOfDay(hour: hour, minute: minute),
      builder: (context, child) {
        return Theme(
          data: Theme.of(context).copyWith(
            timePickerTheme: TimePickerThemeData(
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(16),
              ),
            ),
          ),
          child: child!,
        );
      },
    );

    if (time != null) {
      final newTime = Schedule.formatTime(time.hour, time.minute);
      final times = List<String>.from(_tempSchedule.times);
      times[index] = newTime;
      _updateTempSchedule(_tempSchedule.copyWith(times: times));
    }
  }

  @override
  Widget build(BuildContext context) {
    final scheduleState = ref.watch(scheduleStateProvider);

    // Update temp schedule when state changes
    scheduleState.whenData((schedule) {
      if (schedule != null && !_hasChanges) {
        _tempSchedule = schedule;
      }
    });

    return WillPopScope(
      onWillPop: _showUnsavedChangesDialog,
      child: Scaffold(
        appBar: AppBar(
          title: const Text('Meal Schedule'),
          actions: [
            if (_hasChanges)
              TextButton(
                onPressed: _saveSchedule,
                child: const Text('Save'),
              ),
          ],
        ),
        body: scheduleState.when(
          data: (schedule) => _buildScheduleForm(),
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
                  'Failed to load schedule',
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
                    ref.read(scheduleStateProvider.notifier).refresh();
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

  /// Build schedule form
  Widget _buildScheduleForm() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Info card
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Icon(
                        Icons.info_outline,
                        color: Theme.of(context).colorScheme.primary,
                      ),
                      const SizedBox(width: 8),
                      Text(
                        'Meal Schedule',
                        style: Theme.of(context).textTheme.titleMedium?.copyWith(
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Set your preferred meal times. You\'ll receive notifications at these times with your daily meal suggestions.',
                    style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                      color: Theme.of(context).colorScheme.onSurface.withOpacity(0.6),
                    ),
                  ),
                ],
              ),
            ),
          ),
          
          const SizedBox(height: 24),
          
          // Meal times
          _buildMealTimeCard('Breakfast', 0, Icons.wb_sunny_outlined),
          _buildMealTimeCard('Lunch', 1, Icons.wb_sunny),
          _buildMealTimeCard('Dinner', 2, Icons.nightlight_outlined),
          
          const SizedBox(height: 24),
          
          // Timezone info
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Timezone',
                    style: Theme.of(context).textTheme.titleMedium?.copyWith(
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Row(
                    children: [
                      Icon(
                        Icons.access_time,
                        size: 20,
                        color: Theme.of(context).colorScheme.onSurface.withOpacity(0.6),
                      ),
                      const SizedBox(width: 8),
                      Text(
                        _tempSchedule.timezone,
                        style: Theme.of(context).textTheme.bodyMedium,
                      ),
                    ],
                  ),
                  const SizedBox(height: 4),
                  Text(
                    'Times are displayed in your device\'s local timezone',
                    style: Theme.of(context).textTheme.bodySmall?.copyWith(
                      color: Theme.of(context).colorScheme.onSurface.withOpacity(0.6),
                    ),
                  ),
                ],
              ),
            ),
          ),
          
          const SizedBox(height: 32),
          
          // Save button
          SizedBox(
            width: double.infinity,
            child: FilledButton(
              onPressed: _hasChanges ? _saveSchedule : null,
              child: const Text('Save Schedule'),
            ),
          ),
          
          const SizedBox(height: 16),
          
          // Reset to default button
          SizedBox(
            width: double.infinity,
            child: OutlinedButton(
              onPressed: () {
                _updateTempSchedule(Schedule.defaultSchedule());
              },
              child: const Text('Reset to Default'),
            ),
          ),
        ],
      ),
    );
  }

  /// Build meal time card
  Widget _buildMealTimeCard(String title, int index, IconData icon) {
    final time = _tempSchedule.getTimeByIndex(index);
    final mealColors = [
      const Color(0xFFFFB74D), // Orange for breakfast
      const Color(0xFF81C784), // Green for lunch
      const Color(0xFF64B5F6), // Blue for dinner
    ];
    
    final color = mealColors[index % mealColors.length];

    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Row(
          children: [
            // Icon
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: color.withOpacity(0.1),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Icon(
                icon,
                color: color,
                size: 24,
              ),
            ),
            
            const SizedBox(width: 16),
            
            // Title and time
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: Theme.of(context).textTheme.titleMedium?.copyWith(
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    time,
                    style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                      color: color,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ],
              ),
            ),
            
            // Edit button
            IconButton(
              onPressed: () => _showTimePicker(index),
              icon: const Icon(Icons.edit_outlined),
              tooltip: 'Edit time',
            ),
          ],
        ),
      ),
    );
  }
}
