import 'package:flutter_secure_storage/flutter_secure_storage.dart';

/// Secure storage service for handling tokens and user data
class StorageService {
  static const _storage = FlutterSecureStorage(
    aOptions: AndroidOptions(
      encryptedSharedPreferences: true,
    ),
    iOptions: IOSOptions(
      accessibility: KeychainAccessibility.first_unlock_this_device,
    ),
  );

  // Storage keys
  static const String _accessTokenKey = 'access_token';
  static const String _refreshTokenKey = 'refresh_token';
  static const String _userJsonKey = 'user_json';

  /// Get access token
  static Future<String?> getAccessToken() async {
    return await _storage.read(key: _accessTokenKey);
  }

  /// Set access token
  static Future<void> setAccessToken(String token) async {
    await _storage.write(key: _accessTokenKey, value: token);
  }

  /// Get refresh token
  static Future<String?> getRefreshToken() async {
    return await _storage.read(key: _refreshTokenKey);
  }

  /// Set refresh token
  static Future<void> setRefreshToken(String token) async {
    await _storage.write(key: _refreshTokenKey, value: token);
  }

  /// Get user JSON
  static Future<String?> getUserJson() async {
    return await _storage.read(key: _userJsonKey);
  }

  /// Set user JSON
  static Future<void> setUserJson(String userJson) async {
    await _storage.write(key: _userJsonKey, value: userJson);
  }

  /// Check if user is logged in (has access token)
  static Future<bool> isLoggedIn() async {
    final token = await getAccessToken();
    return token != null && token.isNotEmpty;
  }

  /// Clear all stored data (logout)
  static Future<void> clearAll() async {
    await _storage.deleteAll();
  }

  /// Clear specific key
  static Future<void> clearKey(String key) async {
    await _storage.delete(key: key);
  }
}
