import 'package:dio/dio.dart';
import '../../../config/env.dart';
import '../../../core/dio_client.dart';
import '../../../core/result.dart';
import '../models/schedule_models.dart';

/// Schedule repository
class ScheduleRepository {
  final Dio _dio = DioClient.instance;

  /// Get current user schedule
  Future<Result<Schedule>> getMe() async {
    try {
      final response = await _dio.get(Env.schedulesMeEndpoint);

      if (response.statusCode == 200) {
        final schedule = Schedule.fromJson(response.data);
        return Ok(schedule);
      } else {
        return const Error('Failed to get schedule');
      }
    } on DioException catch (e) {
      return Error(_handleDioError(e));
    } catch (e) {
      return Error('Unexpected error: $e');
    }
  }

  /// Update current user schedule
  Future<Result<Schedule>> updateMe(Schedule schedule) async {
    try {
      final response = await _dio.patch(
        Env.schedulesMeEndpoint,
        data: schedule.toJson(),
      );

      if (response.statusCode == 200) {
        final updatedSchedule = Schedule.fromJson(response.data);
        return Ok(updatedSchedule);
      } else {
        return const Error('Failed to update schedule');
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
          return 'Invalid schedule data';
        } else if (statusCode == 404) {
          return 'Schedule not found';
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
