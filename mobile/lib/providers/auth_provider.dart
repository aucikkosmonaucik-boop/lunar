import 'package:flutter/foundation.dart';
import 'package:google_sign_in/google_sign_in.dart';
import 'package:sign_in_with_apple/sign_in_with_apple.dart';
import 'package:flutter_facebook_auth/flutter_facebook_auth.dart';
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
      throw ApiException('Unexpected server response');
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
      throw ApiException('Unexpected server response');
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
      throw ApiException('Failed to update profile');
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

  Future<bool> resetPassword({
    required String token,
    required String newPassword,
  }) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      await ApiService.post(
        ApiConstants.authResetPassword,
        body: {
          'token': token.trim(),
          'password': newPassword,
        },
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

  Future<bool> resendVerification(String email) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      await ApiService.post(
        ApiConstants.authResendVerification,
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

  final GoogleSignIn _googleSignIn = GoogleSignIn(
    scopes: ['email', 'profile'],
  );

  Future<bool> loginWithGoogle() async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final GoogleSignInAccount? account = await _googleSignIn.signIn();
      if (account == null) {
        // User cancelled Google sign-in
        _isLoading = false;
        notifyListeners();
        return false;
      }

      final GoogleSignInAuthentication auth = await account.authentication;

      return await _submitSocialLogin(
        provider: 'google',
        email: account.email,
        name: account.displayName,
        providerId: account.id,
        token: auth.idToken ?? auth.accessToken,
      );
    } catch (e) {
      _isLoading = false;
      _errorMessage = 'Google Sign-In failed: ${e.toString()}';
      notifyListeners();
      return false;
    }
  }

  Future<bool> loginWithApple() async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final credential = await SignInWithApple.getAppleIDCredential(
        scopes: [
          AppleIDAuthorizationScopes.email,
          AppleIDAuthorizationScopes.fullName,
        ],
      );

      final email = credential.email ??
          (credential.userIdentifier != null
              ? '${credential.userIdentifier}@privaterelay.appleid.com'
              : null);

      if (email == null) {
        throw Exception('No email received from Apple.');
      }

      final fullNameParts = <String>[];
      if (credential.givenName != null && credential.givenName!.isNotEmpty) {
        fullNameParts.add(credential.givenName!);
      }
      if (credential.familyName != null && credential.familyName!.isNotEmpty) {
        fullNameParts.add(credential.familyName!);
      }
      final fullName = fullNameParts.isNotEmpty ? fullNameParts.join(' ') : 'Apple User';

      return await _submitSocialLogin(
        provider: 'apple',
        email: email,
        name: fullName,
        providerId: credential.userIdentifier,
        token: credential.identityToken,
      );
    } catch (e) {
      _isLoading = false;
      final str = e.toString();
      if (str.toLowerCase().contains('cancel')) {
        notifyListeners();
        return false;
      }
      _errorMessage = 'Apple Sign-In failed: $str';
      notifyListeners();
      return false;
    }
  }

  Future<bool> loginWithFacebook() async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final LoginResult result = await FacebookAuth.instance.login(
        permissions: ['email', 'public_profile'],
      );

      if (result.status == LoginStatus.success && result.accessToken != null) {
        final userData = await FacebookAuth.instance.getUserData(fields: 'name,email,id');
        final email = userData['email']?.toString();
        final name = userData['name']?.toString();
        final id = userData['id']?.toString();

        if (email == null || email.isEmpty) {
          throw Exception('No email address provided by Facebook.');
        }

        return await _submitSocialLogin(
          provider: 'facebook',
          email: email,
          name: name,
          providerId: id,
          token: result.accessToken?.tokenString,
        );
      } else if (result.status == LoginStatus.cancelled) {
        _isLoading = false;
        notifyListeners();
        return false;
      } else {
        throw Exception(result.message ?? 'Facebook login failed');
      }
    } catch (e) {
      _isLoading = false;
      _errorMessage = 'Facebook login failed: ${e.toString()}';
      notifyListeners();
      return false;
    }
  }

  Future<bool> _submitSocialLogin({
    required String provider,
    required String email,
    String? name,
    String? providerId,
    String? token,
  }) async {
    try {
      final res = await ApiService.post(
        ApiConstants.authSocialLogin,
        body: {
          'provider': provider,
          'email': email.trim(),
          'name': name?.trim(),
          'providerId': providerId,
          'token': token,
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
        _errorMessage = null;
        notifyListeners();
        return true;
      }
      throw ApiException('Unexpected server response');
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
    try {
      await _googleSignIn.signOut();
    } catch (_) {}
    try {
      await FacebookAuth.instance.logOut();
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
