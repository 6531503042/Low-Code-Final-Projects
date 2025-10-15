import 'package:dio/dio.dart';
import '../../../config/env.dart';
import '../../../core/dio_client.dart';
import '../../../core/result.dart';
import '../../../core/storage.dart';

/// User model
class User {
  final String id;
  final String email;
  final String name;
  final String role;
  final String timezone;

  const User({
    required this.id,
    required this.email,
    required this.name,
    required this.role,
    required this.timezone,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    // Handle MongoDB ObjectId format - convert buffer to hex string
    String userId = '';
    if (json['id'] != null) {
      if (json['id'] is Map && json['id']['buffer'] != null) {
        // MongoDB ObjectId format - convert buffer data to hex
        final buffer = json['id']['buffer']['data'] as List<dynamic>;
        userId = buffer.map((e) => (e as int).toRadixString(16).padLeft(2, '0')).join('');
      } else {
        userId = json['id'].toString();
      }
    } else if (json['_id'] != null) {
      userId = json['_id'].toString();
    }
    
    return User(
      id: userId,
      email: json['email'] ?? '',
      name: json['name'] ?? '',
      role: json['role'] ?? 'user',
      timezone: json['timezone'] ?? 'Asia/Bangkok',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'email': email,
      'name': name,
      'role': role,
      'timezone': timezone,
    };
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is User && other.id == id;
  }

  @override
  int get hashCode => id.hashCode;

  @override
  String toString() {
    return 'User(id: $id, email: $email, name: $name, role: $role)';
  }
}

/// Login request model
class LoginRequest {
  final String email;
  final String password;

  const LoginRequest({
    required this.email,
    required this.password,
  });

  Map<String, dynamic> toJson() {
    return {
      'email': email,
      'password': password,
    };
  }
}

/// Login response model
class LoginResponse {
  final String accessToken;
  final User user;

  const LoginResponse({
    required this.accessToken,
    required this.user,
  });

  factory LoginResponse.fromJson(Map<String, dynamic> json) {
    return LoginResponse(
      accessToken: json['accessToken'] ?? '',
      user: User.fromJson(json['user'] ?? {}),
    );
  }
}

/// Authentication repository
class AuthRepository {
  final Dio _dio = DioClient.instance;

  /// Login user
  Future<Result<LoginResponse>> login(LoginRequest request) async {
    try {
      print('🌐 Making login request to: ${Env.baseUrl}${Env.loginEndpoint}');
      print('📤 Request data: ${request.toJson()}');
      
      final response = await _dio.post(
        Env.loginEndpoint,
        data: request.toJson(),
      );

      print('📥 Response status: ${response.statusCode}');
      print('📥 Response data: ${response.data}');

      if (response.statusCode == 200 || response.statusCode == 201) {
        final loginResponse = LoginResponse.fromJson(response.data);
        
        // Store token and user data
        await StorageService.setAccessToken(loginResponse.accessToken);
        await StorageService.setUserJson(loginResponse.user.toJson().toString());
        
        return Ok(loginResponse);
      } else {
        return const Error('Login failed');
      }
    } on DioException catch (e) {
      return Error(_handleDioError(e));
    } catch (e) {
      return Error('Unexpected error: $e');
    }
  }

  /// Get current user profile
  Future<Result<User>> getMe() async {
    try {
      final response = await _dio.get(Env.meEndpoint);

      if (response.statusCode == 200) {
        final user = User.fromJson(response.data);
        
        // Update stored user data
        await StorageService.setUserJson(user.toJson().toString());
        
        return Ok(user);
      } else {
        return const Error('Failed to get user profile');
      }
    } on DioException catch (e) {
      return Error(_handleDioError(e));
    } catch (e) {
      return Error('Unexpected error: $e');
    }
  }

  /// Logout user
  Future<Result<void>> logout() async {
    try {
      // Clear stored data
      await StorageService.clearAll();
      return const Ok(null);
    } catch (e) {
      return Error('Logout failed: $e');
    }
  }

  /// Check if user is logged in
  Future<bool> isLoggedIn() async {
    return await StorageService.isLoggedIn();
  }

  /// Get stored user data
  Future<User?> getStoredUser() async {
    try {
      final userJson = await StorageService.getUserJson();
      if (userJson != null) {
        // Parse JSON string to Map
        // Note: This is a simplified approach. In production, use proper JSON parsing
        return null; // Will be handled by providers
      }
      return null;
    } catch (e) {
      return null;
    }
  }

  /// Handle Dio errors
  String _handleDioError(DioException error) {
    switch (error.type) {
      case DioExceptionType.connectionTimeout:
      case DioExceptionType.sendTimeout:
      case DioExceptionType.receiveTimeout:
        return 'Connection timeout. Please check your internet connection.';
      case DioExceptionType.badResponse:
        final statusCode = error.response?.statusCode;
        final data = error.response?.data;
        
        if (statusCode == 401) {
          return 'Invalid email or password';
        } else if (statusCode == 400) {
          return 'Invalid request data';
        } else if (statusCode == 404) {
          return 'Service not found';
        } else if (statusCode == 500) {
          return 'Server error. Please try again later.';
        } else if (data is Map<String, dynamic> && data['message'] != null) {
          return data['message'];
        } else {
          return 'Request failed with status $statusCode';
        }
      case DioExceptionType.cancel:
        return 'Request was cancelled';
      case DioExceptionType.connectionError:
        return 'No internet connection. Please check your network.';
      case DioExceptionType.badCertificate:
        return 'Security certificate error';
      case DioExceptionType.unknown:
        return 'Network error. Please try again.';
    }
  }
}
