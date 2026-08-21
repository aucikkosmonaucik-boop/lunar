import 'package:flutter/foundation.dart';

class ApiConstants {
  // Default base URL for local development or production
  static String get defaultBaseUrl {
    if (kReleaseMode) {
      return 'https://mylunar.ie'; // Replace with production URL
    }
    
    // In debug mode, handle emulator vs localhost vs desktop vs web
    if (!kIsWeb) {
      if (defaultTargetPlatform == TargetPlatform.android) {
        return 'http://10.0.2.2:3000'; // Android emulator to host localhost:3000
      }
      if (defaultTargetPlatform == TargetPlatform.iOS) {
        return 'http://localhost:3000'; // iOS simulator
      }
    }
    return 'http://localhost:3000';
  }

  static String baseUrl = defaultBaseUrl;

  // Endpoint routes
  static const String products = '/api/products';
  static const String categories = '/api/categories';
  static const String promos = '/api/promos';
  static const String reviews = '/api/reviews';
  static const String loyalty = '/api/loyalty';
  
  // Auth endpoints
  static const String authLogin = '/api/auth/login';
  static const String authRegister = '/api/auth/register';
  static const String authVerify = '/api/auth/verify';
  static const String authUpdate = '/api/auth/update';
  static const String authLogout = '/api/auth/logout';
  static const String authForgotPassword = '/api/auth/forgot-password';

  // Orders endpoints
  static const String ordersCreate = '/api/orders/create';
  static const String ordersList = '/api/orders/list';
  
  // Stripe endpoint
  static const String stripeIntent = '/api/stripe/payment-intent';
}
