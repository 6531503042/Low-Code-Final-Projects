import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../data/auth_repository.dart';
import '../../../core/storage.dart';
import '../../../core/result.dart';

/// Auth repository provider
final authRepositoryProvider = Provider<AuthRepository>((ref) {
  return AuthRepository();
});

/// Auth state notifier
class AuthStateNotifier extends StateNotifier<AsyncValue<User?>> {
  final AuthRepository _authRepository;

  AuthStateNotifier(this._authRepository) : super(const AsyncValue.loading()) {
    _loadUser();
  }

  /// Load user from storage or API
  Future<void> _loadUser() async {
    try {
      final isLoggedIn = await StorageService.isLoggedIn();
      if (isLoggedIn) {
        final result = await _authRepository.getMe();
        result.when(
          onSuccess: (user) => state = AsyncValue.data(user),
          onError: (message) async {
            // Clear invalid token
            await _authRepository.logout();
            state = const AsyncValue.data(null);
          },
        );
      } else {
        state = const AsyncValue.data(null);
      }
    } catch (e) {
      state = AsyncValue.error(e, StackTrace.current);
    }
  }

  /// Login user
  Future<void> login(String email, String password) async {
    print('🔐 Attempting login for: $email');
    state = const AsyncValue.loading();
    
    try {
      final result = await _authRepository.login(
        LoginRequest(email: email, password: password),
      );
      
      result.when(
        onSuccess: (loginResponse) {
          print('✅ Login successful for: ${loginResponse.user.email}');
          state = AsyncValue.data(loginResponse.user);
        },
        onError: (message) {
          print('❌ Login failed: $message');
          state = AsyncValue.error(message, StackTrace.current);
        },
      );
    } catch (e) {
      print('💥 Login exception: $e');
      state = AsyncValue.error(e, StackTrace.current);
    }
  }

  /// Logout user
  Future<void> logout() async {
    state = const AsyncValue.loading();
    
    try {
      await _authRepository.logout();
      state = const AsyncValue.data(null);
    } catch (e) {
      state = AsyncValue.error(e, StackTrace.current);
    }
  }

  /// Refresh user data
  Future<void> refreshUser() async {
    try {
      final result = await _authRepository.getMe();
      result.when(
        onSuccess: (user) => state = AsyncValue.data(user),
        onError: (message) async {
          // Clear invalid token
          await _authRepository.logout();
          state = const AsyncValue.data(null);
        },
      );
    } catch (e) {
      state = AsyncValue.error(e, StackTrace.current);
    }
  }

  /// Get current user
  User? get currentUser {
    return state.valueOrNull;
  }

  /// Check if user is logged in
  bool get isLoggedIn {
    return currentUser != null;
  }
}

/// Auth state provider
final authStateProvider = StateNotifierProvider<AuthStateNotifier, AsyncValue<User?>>((ref) {
  final authRepository = ref.watch(authRepositoryProvider);
  return AuthStateNotifier(authRepository);
});

/// Current user provider
final currentUserProvider = Provider<User?>((ref) {
  final authState = ref.watch(authStateProvider);
  return authState.valueOrNull;
});

/// Is logged in provider
final isLoggedInProvider = Provider<bool>((ref) {
  final currentUser = ref.watch(currentUserProvider);
  return currentUser != null;
});
