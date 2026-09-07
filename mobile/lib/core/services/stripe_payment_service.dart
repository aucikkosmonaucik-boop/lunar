import 'package:flutter/material.dart';
import 'package:flutter_stripe/flutter_stripe.dart';
import 'package:url_launcher/url_launcher.dart';
import '../constants/api_constants.dart';
import '../services/api_service.dart';
import '../../models/cart_item_model.dart';
import '../../models/order_model.dart';

class StripePaymentService {
  /// Initiates and processes a native Stripe PaymentIntent with PaymentSheet
  static Future<OrderModel?> processPayment({
    required BuildContext context,
    required List<CartItem> items,
    required double total,
    required String name,
    required String email,
    required String phone,
    required String street,
    required String city,
    required String postalCode,
    required String country,
    String? carrier,
    String? carrierName,
    String? estimatedDelivery,
    String? discountCode,
    bool isDark = true,
  }) async {
    try {
      // 1. Create PaymentIntent on the backend
      final payload = {
        'items': items.map((i) => i.toJson()).toList(),
        'customerEmail': email.trim(),
        'discountCode': discountCode,
        'carrier': carrier ?? 'AN_POST',
        'carrierName': carrierName ?? 'An Post',
        'estimatedDelivery': estimatedDelivery ?? '1 – 3 Business Days',
        'shippingAddress': {
          'name': name.trim(),
          'email': email.trim(),
          'phone': phone.trim(),
          'street': street.trim(),
          'city': city.trim(),
          'postalCode': postalCode.trim(),
          'country': country.trim(),
        },
      };

      final response = await ApiService.post(
        ApiConstants.stripeIntent,
        body: payload,
      );

      if (response is! Map || response['clientSecret'] == null) {
        final errorMsg = response is Map && response['message'] != null
            ? response['message']
            : 'Failed to create payment intent.';
        throw ApiException(errorMsg.toString());
      }

      final clientSecret = response['clientSecret'] as String;
      final paymentIntentId = response['paymentIntentId'] as String;

      // 2. Initialize native Stripe PaymentSheet with Material design parameters
      final isoCountry = _toIsoCountry(country);
      await Stripe.instance.initPaymentSheet(
        paymentSheetParameters: SetupPaymentSheetParameters(
          paymentIntentClientSecret: clientSecret,
          merchantDisplayName: 'LUNAR Store',
          style: isDark ? ThemeMode.dark : ThemeMode.light,
          allowsDelayedPaymentMethods: false,
          returnURL: 'lunar://stripe-redirect',
          billingDetails: BillingDetails(
            name: name.trim(),
            email: email.trim(),
            phone: phone.trim(),
            address: Address(
              line1: street.trim(),
              city: city.trim(),
              postalCode: postalCode.trim(),
              country: isoCountry,
              line2: null,
              state: null,
            ),
          ),
          appearance: PaymentSheetAppearance(
            colors: PaymentSheetAppearanceColors(
              primary: const Color(0xFFC1A98F),
              background: isDark ? const Color(0xFF121212) : Colors.white,
              componentBackground: isDark ? const Color(0xFF1E1E1E) : const Color(0xFFF9F9F9),
              componentText: isDark ? const Color(0xFFF5F5F5) : const Color(0xFF1A1A1A),
              primaryText: isDark ? const Color(0xFF121212) : Colors.white,
              secondaryText: isDark ? const Color(0xFFAAAAAA) : const Color(0xFF6B7280),
              placeholderText: isDark ? const Color(0xFF777777) : const Color(0xFF9CA3AF),
            ),
          ),
        ),
      );

      // 3. Present Payment Sheet to the user
      await Stripe.instance.presentPaymentSheet();

      // 4. Verify payment completion and get finalized order
      try {
        final verifyRes = await ApiService.get(
          '/api/stripe/verify-payment-intent?payment_intent_id=${Uri.encodeComponent(paymentIntentId)}',
        );

        if (verifyRes is Map && verifyRes['order'] != null) {
          return OrderModel.fromJson(verifyRes['order'] as Map<String, dynamic>);
        }
      } catch (verifyError) {
        debugPrint('Stripe order verification API note: $verifyError');
      }

      // Fallback: Return constructed order model if verification endpoint returned raw confirmation
      return OrderModel(
        id: paymentIntentId,
        orderNumber: response['orderNumber']?.toString() ?? 'LUNAR-${DateTime.now().millisecondsSinceEpoch}',
        customerName: name,
        customerEmail: email,
        shippingPhone: phone,
        shippingStreet: street,
        shippingCity: city,
        shippingPostalCode: postalCode,
        shippingCountry: country,
        subtotal: total,
        total: total,
        status: 'Paid',
        paymentStatus: 'paid',
        paymentMethod: 'stripe_card',
        carrier: carrier ?? 'AN_POST',
        carrierName: carrierName ?? 'An Post',
        estimatedDelivery: estimatedDelivery ?? '1 – 3 Business Days',
        items: items
            .map((i) => OrderItemModel(
                  id: i.product.id,
                  productId: i.product.id,
                  name: i.product.name,
                  price: i.product.price,
                  quantity: i.quantity,
                  image: i.product.image,
                  selectedOptions: i.selectedOptions,
                ))
            .toList(),
      );
    } on StripeException catch (e) {
      if (e.error.code == FailureCode.Canceled) {
        // User closed or canceled the native payment sheet
        return null;
      }
      debugPrint('Native Stripe PaymentSheet error (${e.error.code}): ${e.error.localizedMessage}');
      if (!context.mounted) return null;
      // Fallback to hosted checkout if native sheet had an error
      return await _fallbackToHostedCheckout(
        context: context,
        items: items,
        total: total,
        name: name,
        email: email,
        phone: phone,
        street: street,
        city: city,
        postalCode: postalCode,
        country: country,
        carrier: carrier,
        carrierName: carrierName,
        estimatedDelivery: estimatedDelivery,
        discountCode: discountCode,
      );
    } catch (e) {
      debugPrint('Native Stripe error: $e');
      final errStr = e.toString().toLowerCase();
      if (errStr.contains('canceled') || errStr.contains('cancelled')) {
        return null;
      }
      if (!context.mounted) return null;
      // Fallback to hosted checkout
      return await _fallbackToHostedCheckout(
        context: context,
        items: items,
        total: total,
        name: name,
        email: email,
        phone: phone,
        street: street,
        city: city,
        postalCode: postalCode,
        country: country,
        carrier: carrier,
        carrierName: carrierName,
        estimatedDelivery: estimatedDelivery,
        discountCode: discountCode,
      );
    }
  }

  /// Automated fallback opening official Stripe Checkout session in browser
  static Future<OrderModel?> _fallbackToHostedCheckout({
    required BuildContext context,
    required List<CartItem> items,
    required double total,
    required String name,
    required String email,
    required String phone,
    required String street,
    required String city,
    required String postalCode,
    required String country,
    String? carrier,
    String? carrierName,
    String? estimatedDelivery,
    String? discountCode,
  }) async {
    try {
      final payload = {
        'items': items.map((i) => i.toJson()).toList(),
        'customerEmail': email.trim(),
        'discountCode': discountCode,
        'carrier': carrier ?? 'AN_POST',
        'carrierName': carrierName ?? 'An Post',
        'estimatedDelivery': estimatedDelivery ?? '1 – 3 Business Days',
        'shippingAddress': {
          'name': name.trim(),
          'email': email.trim(),
          'phone': phone.trim(),
          'street': street.trim(),
          'city': city.trim(),
          'postalCode': postalCode.trim(),
          'country': country.trim(),
        },
      };

      final response = await ApiService.post(
        '/api/stripe/create-checkout-session',
        body: payload,
      );

      if (response is! Map || response['url'] == null) {
        final errorMsg = response is Map && response['message'] != null
            ? response['message']
            : 'Could not open secure checkout.';
        throw ApiException(errorMsg.toString());
      }

      final checkoutUrl = response['url'] as String;
      final sessionId = response['sessionId'] as String?;
      final orderNumber = response['orderNumber'] as String? ?? 'LUNAR-${DateTime.now().millisecondsSinceEpoch}';

      // Launch Stripe Checkout URL in external browser
      final uri = Uri.parse(checkoutUrl);
      final launched = await launchUrl(uri, mode: LaunchMode.externalApplication);
      if (!launched) {
        throw ApiException('Could not launch payment browser for $checkoutUrl');
      }

      if (!context.mounted) return null;

      final bool? confirmed = await showDialog<bool>(
        context: context,
        barrierDismissible: false,
        builder: (ctx) => AlertDialog(
          backgroundColor: const Color(0xFF1E1E1E),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          title: const Row(
            children: [
              Icon(Icons.lock_outline, color: Color(0xFFC1A98F), size: 24),
              SizedBox(width: 8),
              Text(
                'Stripe Secure Checkout',
                style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold),
              ),
            ],
          ),
          content: const Text(
            'We opened the official Stripe Secure Checkout in your browser to complete your payment.\n\nOnce completed, please tap "I Have Completed Payment" below.',
            style: TextStyle(color: Color(0xFFCCCCCC), fontSize: 14, height: 1.4),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(ctx).pop(false),
              child: const Text('Cancel', style: TextStyle(color: Colors.grey)),
            ),
            ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFFC1A98F),
                foregroundColor: Colors.black,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
              ),
              onPressed: () => Navigator.of(ctx).pop(true),
              child: const Text('I Have Completed Payment', style: TextStyle(fontWeight: FontWeight.bold)),
            ),
          ],
        ),
      );

      if (confirmed != true) {
        return null;
      }

      // If session ID is available, try verifying with the backend
      if (sessionId != null) {
        try {
          final verifyRes = await ApiService.get('/api/stripe/verify-session?session_id=${Uri.encodeComponent(sessionId)}');
          if (verifyRes is Map && verifyRes['order'] != null) {
            return OrderModel.fromJson(verifyRes['order'] as Map<String, dynamic>);
          }
        } catch (_) {}
      }

      // Return confirmed order model
      return OrderModel(
        id: sessionId ?? 'ord_${DateTime.now().millisecondsSinceEpoch}',
        orderNumber: orderNumber,
        customerName: name,
        customerEmail: email,
        shippingPhone: phone,
        shippingStreet: street,
        shippingCity: city,
        shippingPostalCode: postalCode,
        shippingCountry: country,
        subtotal: total,
        total: total,
        status: 'Processing',
        paymentStatus: 'pending',
        paymentMethod: 'stripe_checkout',
        carrier: carrier ?? 'AN_POST',
        carrierName: carrierName ?? 'An Post',
        estimatedDelivery: estimatedDelivery ?? '1 – 3 Business Days',
        items: items
            .map((i) => OrderItemModel(
                  id: i.product.id,
                  productId: i.product.id,
                  name: i.product.name,
                  price: i.product.price,
                  quantity: i.quantity,
                  image: i.product.image,
                  selectedOptions: i.selectedOptions,
                ))
            .toList(),
      );
    } catch (fallbackError) {
      if (fallbackError is ApiException) rethrow;
      throw ApiException('Payment error: $fallbackError');
    }
  }

  /// Maps country strings to standard ISO 3166-1 alpha-2 codes required by Stripe
  static String _toIsoCountry(String country) {
    final clean = country.trim().toUpperCase();
    if (clean.length == 2) return clean;
    switch (clean) {
      case 'IRELAND':
      case 'IRLANDIA':
        return 'IE';
      case 'POLAND':
      case 'POLSKA':
        return 'PL';
      case 'UNITED KINGDOM':
      case 'GREAT BRITAIN':
      case 'ENGLAND':
      case 'UK':
        return 'GB';
      case 'UNITED STATES':
      case 'UNITED STATES OF AMERICA':
      case 'USA':
        return 'US';
      case 'GERMANY':
      case 'DEUTSCHLAND':
      case 'NIEMCY':
        return 'DE';
      case 'FRANCE':
      case 'FRANCJA':
        return 'FR';
      case 'SPAIN':
      case 'HISZPANIA':
      case 'ESPANA':
        return 'ES';
      case 'ITALY':
      case 'ITALIA':
      case 'WŁOCHY':
        return 'IT';
      case 'NETHERLANDS':
      case 'HOLANDIA':
        return 'NL';
      case 'BELGIUM':
      case 'BELGIA':
        return 'BE';
      case 'AUSTRIA':
        return 'AT';
      case 'SWITZERLAND':
      case 'SZWAJCARIA':
        return 'CH';
      case 'SWEDEN':
      case 'SZWECJA':
        return 'SE';
      case 'NORWAY':
      case 'NORWEGIA':
        return 'NO';
      case 'DENMARK':
      case 'DANIA':
        return 'DK';
      case 'FINLAND':
      case 'FINLANDIA':
        return 'FI';
      case 'PORTUGAL':
      case 'PORTUGALIA':
        return 'PT';
      default:
        return 'IE';
    }
  }
}
