import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';
import '../config/env.dart';
import 'storage.dart';

/// Dio HTTP client with authentication and error handling
class DioClient {
  static late final Dio _dio;

  /// Initialize Dio client
  static void init() {
    _dio = Dio(BaseOptions(
      baseUrl: Env.baseUrl,
      connectTimeout: const Duration(seconds: 10),
      receiveTimeout: const Duration(seconds: 10),
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    ));

    // Add interceptors
    _dio.interceptors.add(_AuthInterceptor());
    _dio.interceptors.add(_LoggingInterceptor());
  }

  /// Get Dio instance
  static Dio get instance => _dio;
}

/// Authentication interceptor
class _AuthInterceptor extends Interceptor {
  @override
  void onRequest(RequestOptions options, RequestInterceptorHandler handler) async {
    // Add authorization header if token exists
    final token = await StorageService.getAccessToken();
    if (token != null && token.isNotEmpty) {
      options.headers['Authorization'] = 'Bearer $token';
    }
    handler.next(options);
  }

  @override
  void onError(DioException err, ErrorInterceptorHandler handler) async {
    // Handle 401 Unauthorized
    if (err.response?.statusCode == 401) {
      // Clear stored tokens
      await StorageService.clearAll();
      
      // You might want to navigate to login screen here
      // This will be handled by the app router
    }
    handler.next(err);
  }
}

/// Logging interceptor (debug only)
class _LoggingInterceptor extends Interceptor {
  @override
  void onRequest(RequestOptions options, RequestInterceptorHandler handler) {
    if (kDebugMode) {
      print('🚀 ${options.method} ${options.uri}');
    }
    handler.next(options);
  }

  @override
  void onResponse(Response response, ResponseInterceptorHandler handler) {
    if (kDebugMode) {
      print('✅ ${response.statusCode} ${response.requestOptions.uri}');
    }
    handler.next(response);
  }

  @override
  void onError(DioException err, ErrorInterceptorHandler handler) {
    if (kDebugMode) {
      print('❌ ${err.response?.statusCode ?? 'ERROR'} ${err.requestOptions.uri}');
      print('❌ Error type: ${err.type}');
      print('❌ Error message: ${err.message}');
      if (err.response?.data != null) {
        print('❌ Error data: ${err.response?.data}');
      }
    }
    handler.next(err);
  }
}
