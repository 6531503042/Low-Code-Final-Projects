import 'package:dio/dio.dart';
import '../../../config/env.dart';
import '../../../core/dio_client.dart';
import '../../../core/result.dart';
import '../models/preferences_models.dart';

/// Preferences repository
class PreferencesRepository {
  final Dio _dio = DioClient.instance;

  /// Get current user preferences
  Future<Result<Preferences>> getMe() async {
    try {
      final response = await _dio.get(Env.preferencesMeEndpoint);

      if (response.statusCode == 200) {
        final preferences = Preferences.fromJson(response.data);
        return Ok(preferences);
      } else {
        return const Error('Failed to get preferences');
      }
    } on DioException catch (e) {
      return Error(_handleDioError(e));
    } catch (e) {
      return Error('Unexpected error: $e');
    }
  }

  /// Update current user preferences
  Future<Result<Preferences>> updateMe(Preferences preferences) async {
    try {
      final response = await _dio.patch(
        Env.preferencesMeEndpoint,
        data: preferences.toJson(),
      );

      if (response.statusCode == 200) {
        final updatedPreferences = Preferences.fromJson(response.data);
        return Ok(updatedPreferences);
      } else {
        return const Error('Failed to update preferences');
      }
    } on DioException catch (e) {
      return Error(_handleDioError(e));
    } catch (e) {
      return Error('Unexpected error: $e');
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
          return 'Authentication required';
        } else if (statusCode == 400) {
          return 'Invalid preferences data';
        } else if (statusCode == 404) {
          return 'Preferences not found';
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
