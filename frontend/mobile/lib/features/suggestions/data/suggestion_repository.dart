import 'package:dio/dio.dart';
import 'dart:convert';
import '../../../config/env.dart';
import '../../../core/dio_client.dart';
import '../../../core/result.dart';
import '../models/suggestion_models.dart';

/// Suggestion repository
class SuggestionRepository {
  final Dio _dio = DioClient.instance;

  /// Generate today's meal suggestions
  Future<Result<void>> generateToday() async {
    try {
      print('🌐 Generating today\'s suggestions from: ${Env.baseUrl}${Env.generateTodayEndpoint}');
      final response = await _dio.post(
        Env.generateTodayEndpoint,
        data: jsonEncode({}), // Send empty JSON object
      );

      print('📥 Generate response status: ${response.statusCode}');
      print('📥 Generate response data: ${response.data}');

      if (response.statusCode == 201 || response.statusCode == 200) {
        return const Ok(null);
      } else {
        return const Error('Failed to generate today\'s suggestions');
      }
    } on DioException catch (e) {
      print('❌ Generate suggestion error: ${e.message}');
      return Error(_handleDioError(e));
    } catch (e) {
      print('💥 Generate suggestion exception: $e');
      return Error('Unexpected error: $e');
    }
  }

  /// Get today's meal suggestions
  Future<Result<TodaySuggestion>> getToday() async {
    try {
      print('🌐 Getting today\'s suggestions from: ${Env.baseUrl}${Env.todayEndpoint}');
      final response = await _dio.get(Env.todayEndpoint);

      print('📥 Suggestions response status: ${response.statusCode}');
      print('📥 Suggestions response data: ${response.data}');

      if (response.statusCode == 200) {
        // Handle null response (no suggestions for today)
        if (response.data == null) {
          print('⚠️ No suggestions available for today');
          return const Error('No suggestions available for today');
        }
        final suggestion = TodaySuggestion.fromJson(response.data);
        return Ok(suggestion);
      } else {
        return const Error('Failed to get today\'s suggestions');
      }
    } on DioException catch (e) {
      return Error(_handleDioError(e));
    } catch (e) {
      return Error('Unexpected error: $e');
    }
  }

  /// Reroll a specific meal type
  Future<Result<void>> reroll(MealType mealType) async {
    try {
      final request = RerollRequest(mealType: mealType);
      final response = await _dio.post(
        Env.rerollEndpoint,
        data: request.toJson(),
      );

      if (response.statusCode == 200 || response.statusCode == 201) {
        return const Ok(null);
      } else {
        return Error('Failed to reroll ${mealType.displayName}');
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
          return 'Invalid request data';
        } else if (statusCode == 404) {
          return 'Suggestions not found';
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
