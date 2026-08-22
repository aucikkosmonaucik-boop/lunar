import 'dart:async';
import 'package:flutter/material.dart';
import 'package:app_links/app_links.dart';
import '../../screens/auth/reset_password_screen.dart';

class DeepLinkService {
  static final GlobalKey<NavigatorState> navigatorKey = GlobalKey<NavigatorState>();
  static final AppLinks _appLinks = AppLinks();
  static StreamSubscription<Uri>? _sub;

  static void init() {
    _initInitialLink();
    _initIncomingLinks();
  }

  static Future<void> _initInitialLink() async {
    try {
      final uri = await _appLinks.getInitialLink();
      if (uri != null) {
        _handleUri(uri);
      }
    } catch (e) {
      debugPrint('DeepLink initial error: $e');
    }
  }

  static void _initIncomingLinks() {
    _sub = _appLinks.uriLinkStream.listen(
      (uri) {
        _handleUri(uri);
      },
      onError: (err) {
        debugPrint('DeepLink stream error: $err');
      },
    );
  }

  static void _handleUri(Uri uri) {
    debugPrint('Received deep link: $uri');

    // Handle https://mylunar.shop/reset-password or lunar://reset-password
    final isResetPasswordHttp = uri.path.contains('reset-password');
    final isResetPasswordCustomScheme = uri.scheme == 'lunar' && (uri.host == 'reset-password' || uri.path.contains('reset-password'));

    if (isResetPasswordHttp || isResetPasswordCustomScheme) {
      final token = uri.queryParameters['token'];

      // Ensure navigator is ready
      WidgetsBinding.instance.addPostFrameCallback((_) {
        navigatorKey.currentState?.push(
          MaterialPageRoute(
            builder: (_) => ResetPasswordScreen(token: token),
          ),
        );
      });
    }
  }

  static void dispose() {
    _sub?.cancel();
  }
}
