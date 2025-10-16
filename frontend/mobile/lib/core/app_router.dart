import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../features/auth/providers/auth_providers.dart';
import '../features/auth/view/splash_gate.dart';
import '../features/auth/view/login_screen.dart';
import '../features/suggestions/view/dashboard_screen_premium.dart';
import '../features/preferences/view/preferences_screen.dart';
import '../features/schedules/view/schedule_screen.dart';

/// Route paths
class AppRoutes {
  static const String splash = '/';
  static const String login = '/login';
  static const String dashboard = '/dashboard';
  static const String preferences = '/preferences';
  static const String schedules = '/schedules';
}

/// App router configuration
final appRouterProvider = Provider<GoRouter>((ref) {
  final authState = ref.watch(authStateProvider);

  return GoRouter(
    initialLocation: AppRoutes.splash,
    redirect: (context, state) {
      final isLoggedIn = authState.valueOrNull != null;
      final isLoading = authState.isLoading;

      // Show splash while loading
      if (isLoading) {
        return AppRoutes.splash;
      }

      // Redirect to login if not authenticated
      if (!isLoggedIn && state.matchedLocation != AppRoutes.login) {
        return AppRoutes.login;
      }

      // Redirect to dashboard if authenticated and on login/splash
      if (isLoggedIn && 
          (state.matchedLocation == AppRoutes.login || 
           state.matchedLocation == AppRoutes.splash)) {
        return AppRoutes.dashboard;
      }

      return null;
    },
    routes: [
      // Splash screen
      GoRoute(
        path: AppRoutes.splash,
        name: 'splash',
        builder: (context, state) => const SplashGate(),
      ),

      // Login screen
      GoRoute(
        path: AppRoutes.login,
        name: 'login',
        builder: (context, state) => const LoginScreen(),
      ),

      // Dashboard screen
      GoRoute(
        path: AppRoutes.dashboard,
        name: 'dashboard',
        builder: (context, state) => const DashboardScreenPremium(),
      ),

      // Preferences screen
      GoRoute(
        path: AppRoutes.preferences,
        name: 'preferences',
        builder: (context, state) => const PreferencesScreen(),
      ),

      // Schedule screen
      GoRoute(
        path: AppRoutes.schedules,
        name: 'schedules',
        builder: (context, state) => const ScheduleScreen(),
      ),
    ],
    errorBuilder: (context, state) => Scaffold(
      appBar: AppBar(
        title: const Text('Error'),
      ),
      body: Center(
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
              'Page not found',
              style: Theme.of(context).textTheme.headlineSmall,
            ),
            const SizedBox(height: 8),
            Text(
              state.error?.toString() ?? 'Unknown error',
              style: Theme.of(context).textTheme.bodyMedium,
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 24),
            ElevatedButton(
              onPressed: () => context.go(AppRoutes.dashboard),
              child: const Text('Go to Dashboard'),
            ),
          ],
        ),
      ),
    ),
  );
});

/// Navigation helper functions
class AppNavigation {
  /// Navigate to login
  static void goToLogin(BuildContext context) {
    context.go(AppRoutes.login);
  }

  /// Navigate to dashboard
  static void goToDashboard(BuildContext context) {
    context.go(AppRoutes.dashboard);
  }

  /// Navigate to preferences
  static void goToPreferences(BuildContext context) {
    context.go(AppRoutes.preferences);
  }

  /// Navigate to schedules
  static void goToSchedules(BuildContext context) {
    context.go(AppRoutes.schedules);
  }

  /// Push to preferences
  static void pushToPreferences(BuildContext context) {
    context.push(AppRoutes.preferences);
  }

  /// Push to schedules
  static void pushToSchedules(BuildContext context) {
    context.push(AppRoutes.schedules);
  }

  /// Pop current route
  static void pop(BuildContext context) {
    context.pop();
  }

  /// Pop until dashboard
  static void popUntilDashboard(BuildContext context) {
    context.go(AppRoutes.dashboard);
  }
}

/// Route guard for authenticated routes
class AuthGuard extends ConsumerWidget {
  final Widget child;

  const AuthGuard({
    super.key,
    required this.child,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final authState = ref.watch(authStateProvider);

    return authState.when(
      data: (user) {
        if (user == null) {
          WidgetsBinding.instance.addPostFrameCallback((_) {
            AppNavigation.goToLogin(context);
          });
          return const SplashGate();
        }
        return child;
      },
      loading: () => const SplashGate(),
      error: (error, stack) => Scaffold(
        body: Center(
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
                'Authentication Error',
                style: Theme.of(context).textTheme.headlineSmall,
              ),
              const SizedBox(height: 8),
              Text(
                error.toString(),
                style: Theme.of(context).textTheme.bodyMedium,
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 24),
              ElevatedButton(
                onPressed: () => AppNavigation.goToLogin(context),
                child: const Text('Go to Login'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
