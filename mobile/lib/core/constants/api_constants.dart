class ApiConstants {
  // Default base URL for live deployment
  static const String defaultBaseUrl = 'https://mylunar.shop';

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
  static const String authResetPassword = '/api/auth/reset-password';
  static const String authResendVerification = '/api/auth/resend-verification';
  static const String authSocialLogin = '/api/auth/social-login';

  // Orders endpoints
  static const String ordersCreate = '/api/orders/create';
  static const String ordersList = '/api/orders/list';
  
  // Stripe endpoint
  static const String stripeIntent = '/api/stripe/payment-intent';

  // Notifications endpoints
  static const String notifications = '/api/notifications';
  static const String notificationsMarkRead = '/api/notifications/mark-read';
  static const String notificationsMarkAllRead = '/api/notifications/mark-all-read';
}
