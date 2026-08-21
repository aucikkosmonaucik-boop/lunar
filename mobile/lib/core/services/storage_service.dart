import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';

class StorageService {
  static const String _keyToken = 'auth_token';
  static const String _keyUser = 'auth_user';
  static const String _keyThemeMode = 'theme_mode';
  static const String _keyWishlist = 'wishlist_ids';
  static const String _keyBaseUrl = 'custom_base_url';

  static SharedPreferences? _prefs;

  static Future<void> init() async {
    _prefs ??= await SharedPreferences.getInstance();
  }

  // Token
  static Future<void> setToken(String token) async {
    await _prefs?.setString(_keyToken, token);
  }

  static String? getToken() {
    return _prefs?.getString(_keyToken);
  }

  static Future<void> clearToken() async {
    await _prefs?.remove(_keyToken);
  }

  // User
  static Future<void> setUser(Map<String, dynamic> user) async {
    await _prefs?.setString(_keyUser, jsonEncode(user));
  }

  static Map<String, dynamic>? getUser() {
    final str = _prefs?.getString(_keyUser);
    if (str == null) return null;
    try {
      return jsonDecode(str) as Map<String, dynamic>;
    } catch (_) {
      return null;
    }
  }

  static Future<void> clearUser() async {
    await _prefs?.remove(_keyUser);
  }

  // Theme Mode ('system', 'light', 'dark')
  static Future<void> setThemeMode(String mode) async {
    await _prefs?.setString(_keyThemeMode, mode);
  }

  static String getThemeMode() {
    return _prefs?.getString(_keyThemeMode) ?? 'system';
  }

  // Wishlist product IDs
  static Future<void> setWishlistIds(List<String> ids) async {
    await _prefs?.setStringList(_keyWishlist, ids);
  }

  static List<String> getWishlistIds() {
    return _prefs?.getStringList(_keyWishlist) ?? [];
  }

  // Custom Base URL
  static Future<void> setCustomBaseUrl(String url) async {
    await _prefs?.setString(_keyBaseUrl, url);
  }

  static String? getCustomBaseUrl() {
    return _prefs?.getString(_keyBaseUrl);
  }

  // Clear all session data (Logout)
  static Future<void> clearSession() async {
    await clearToken();
    await clearUser();
  }
}
