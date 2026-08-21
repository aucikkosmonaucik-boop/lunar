import 'package:flutter/foundation.dart';
import '../core/constants/api_constants.dart';
import '../core/services/api_service.dart';
import '../core/services/storage_service.dart';
import '../models/user_model.dart';

class AuthProvider extends ChangeNotifier {
  User? _user;
  String? _token;
  bool _isLoading = false;
  String? _errorMessage;

  User? get user => _user;
  String? get token => _token;
  bool get isAuthenticated => _user != null && _token != null;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;

  AuthProvider() {
    _initAuth();
  }

  Future<void> _initAuth() async {
    _token = StorageService.getToken();
    final cachedUser = StorageService.getUser();
    if (cachedUser != null) {
      _user = User.fromJson(cachedUser);
    }
    notifyListeners();

    if (_token != null) {
      await verifyAuth();
    }
  }

  Future<bool> verifyAuth() async {
    try {
      final res = await ApiService.get(ApiConstants.authVerify);
      if (res is Map && res['user'] != null) {
        _user = User.fromJson(res['user'] as Map<String, dynamic>);
        await StorageService.setUser(_user!.toJson());
        notifyListeners();
        return true;
      }
    } catch (_) {
      // If token expired or invalid, clear session
      await logout();
    }
    return false;
  }

  Future<bool> login(String email, String password) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final res = await ApiService.post(
        ApiConstants.authLogin,
        body: {'email': email.trim(), 'password': password},
      );

      if (res is Map) {
        if (res['token'] != null) {
          _token = res['token'].toString();
          await StorageService.setToken(_token!);
        }
        if (res['user'] != null) {
          _user = User.fromJson(res['user'] as Map<String, dynamic>);
          await StorageService.setUser(_user!.toJson());
        }
        _isLoading = false;
        notifyListeners();
        return true;
      }
      throw ApiException('Nieoczekiwana odpowiedź serwera');
    } catch (e) {
      _isLoading = false;
      _errorMessage = e.toString();
      notifyListeners();
      return false;
    }
  }

  Future<bool> register({
    required String name,
    required String email,
    required String password,
  }) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final res = await ApiService.post(
        ApiConstants.authRegister,
        body: {
          'name': name.trim(),
          'email': email.trim(),
          'password': password,
        },
      );

      if (res is Map) {
        if (res['token'] != null) {
          _token = res['token'].toString();
          await StorageService.setToken(_token!);
        }
        if (res['user'] != null) {
          _user = User.fromJson(res['user'] as Map<String, dynamic>);
          await StorageService.setUser(_user!.toJson());
        }
        _isLoading = false;
        notifyListeners();
        return true;
      }
      throw ApiException('Nieoczekiwana odpowiedź serwera');
    } catch (e) {
      _isLoading = false;
      _errorMessage = e.toString();
      notifyListeners();
      return false;
    }
  }

  Future<bool> updateProfile({
    String? name,
    String? email,
    String? phone,
    String? street,
    String? city,
    String? postalCode,
    String? country,
    String? password,
  }) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final body = <String, dynamic>{};
      if (name != null) body['name'] = name.trim();
      if (email != null) body['email'] = email.trim();
      if (phone != null) body['phone'] = phone.trim();
      if (street != null) body['street'] = street.trim();
      if (city != null) body['city'] = city.trim();
      if (postalCode != null) body['postalCode'] = postalCode.trim();
      if (country != null) body['country'] = country.trim();
      if (password != null && password.isNotEmpty) body['password'] = password;

      final res = await ApiService.post(
        ApiConstants.authUpdate,
        body: body,
      );

      if (res is Map && res['user'] != null) {
        _user = User.fromJson(res['user'] as Map<String, dynamic>);
        await StorageService.setUser(_user!.toJson());
        _isLoading = false;
        notifyListeners();
        return true;
      }
      throw ApiException('Nie udało się zaktualizować profilu');
    } catch (e) {
      _isLoading = false;
      _errorMessage = e.toString();
      notifyListeners();
      return false;
    }
  }

  Future<bool> forgotPassword(String email) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      await ApiService.post(
        ApiConstants.authForgotPassword,
        body: {'email': email.trim()},
      );
      _isLoading = false;
      notifyListeners();
      return true;
    } catch (e) {
      _isLoading = false;
      _errorMessage = e.toString();
      notifyListeners();
      return false;
    }
  }

  Future<void> logout() async {
    try {
      await ApiService.post(ApiConstants.authLogout);
    } catch (_) {}

    _user = null;
    _token = null;
    await StorageService.clearSession();
    notifyListeners();
  }

  void clearError() {
    _errorMessage = null;
    notifyListeners();
  }
}
