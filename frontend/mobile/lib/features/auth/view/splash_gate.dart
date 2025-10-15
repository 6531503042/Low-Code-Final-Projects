import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../providers/auth_providers.dart';
import '../../../core/app_router.dart';
import '../../../core/tz_service.dart';
import '../../../core/notification_service.dart';
import '../../suggestions/providers/suggestion_providers.dart';
import '../../schedules/providers/schedule_providers.dart';

/// Splash gate that decides whether to show login or dashboard
class SplashGate extends ConsumerStatefulWidget {
  const SplashGate({super.key});

  @override
  ConsumerState<SplashGate> createState() => _SplashGateState();
}

class _SplashGateState extends ConsumerState<SplashGate> {
  bool _initialized = false;

  @override
  void initState() {
    super.initState();
    _initializeApp();
  }

  /// Initialize app services
  Future<void> _initializeApp() async {
    if (_initialized) return;

    try {
      // Initialize timezone service
      await TzService.init();

      // Initialize notification service
      await NotificationService.init();

      _initialized = true;

      // If user is logged in, set up notifications
      final isLoggedIn = ref.read(isLoggedInProvider);
      if (isLoggedIn) {
        await _setupNotifications();
      }
    } catch (e) {
      // Handle initialization errors silently
      // App should still work without notifications
    }
  }

  /// Setup notifications for logged in user
  Future<void> _setupNotifications() async {
    try {
      // Generate today's suggestions
      await ref.read(suggestionStateProvider.notifier).generateToday();
      
      // Get suggestions and schedule
      final suggestion = ref.read(currentSuggestionProvider);
      final schedule = ref.read(currentScheduleProvider);
      
      if (suggestion != null && schedule != null) {
        // Schedule meal notifications
        await ref.read(scheduleStateProvider.notifier).scheduleMealNotifications(
          breakfastTitle: suggestion.breakfast?.title,
          lunchTitle: suggestion.lunch?.title,
          dinnerTitle: suggestion.dinner?.title,
        );
      }
    } catch (e) {
      // Handle notification setup errors silently
    }
  }

  @override
  Widget build(BuildContext context) {
    final authState = ref.watch(authStateProvider);

    return Scaffold(
      backgroundColor: Theme.of(context).colorScheme.primary,
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            // App logo/icon
            Container(
              width: 120,
              height: 120,
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(24),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.1),
                    blurRadius: 20,
                    offset: const Offset(0, 10),
                  ),
                ],
              ),
              child: const Icon(
                Icons.restaurant,
                size: 64,
                color: Color(0xFF6750A4),
              ),
            ),
            
            const SizedBox(height: 32),
            
            // App name
            Text(
              'MeeRaiKin',
              style: Theme.of(context).textTheme.headlineLarge?.copyWith(
                color: Colors.white,
                fontWeight: FontWeight.bold,
              ),
            ),
            
            const SizedBox(height: 8),
            
            // App subtitle
            Text(
              'Daily meal suggestions',
              style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                color: Colors.white.withOpacity(0.8),
              ),
            ),
            
            const SizedBox(height: 48),
            
            // Loading indicator
            authState.when(
              data: (user) {
                // Navigate based on auth state
                WidgetsBinding.instance.addPostFrameCallback((_) {
                  if (user != null) {
                    AppNavigation.goToDashboard(context);
                  } else {
                    AppNavigation.goToLogin(context);
                  }
                });
                
                return const CircularProgressIndicator(
                  valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                );
              },
              loading: () => const CircularProgressIndicator(
                valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
              ),
              error: (error, stack) {
                // Show error and navigate to login
                WidgetsBinding.instance.addPostFrameCallback((_) {
                  AppNavigation.goToLogin(context);
                });
                
                return Column(
                  children: [
                    const Icon(
                      Icons.error_outline,
                      color: Colors.white,
                      size: 32,
                    ),
                    const SizedBox(height: 16),
                    Text(
                      'Initialization failed',
                      style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                        color: Colors.white.withOpacity(0.8),
                      ),
                    ),
                  ],
                );
              },
            ),
          ],
        ),
      ),
    );
  }
}
