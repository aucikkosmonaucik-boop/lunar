import 'package:flutter/material.dart';
import 'package:flutter_stripe/flutter_stripe.dart';
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

      // 2. Initialize native Stripe PaymentSheet with luxury Lunar styling
      await Stripe.instance.initPaymentSheet(
        paymentSheetParameters: SetupPaymentSheetParameters(
          paymentIntentClientSecret: clientSecret,
          merchantDisplayName: 'LUNAR Store',
          style: isDark ? ThemeMode.dark : ThemeMode.light,
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
            shapes: const PaymentSheetShape(
              borderRadius: 0,
              borderWidth: 1,
            ),
          ),
        ),
      );

      // 3. Present Payment Sheet to the user
      await Stripe.instance.presentPaymentSheet();

      // 4. Verify payment completion and get finalized order
      final verifyRes = await ApiService.get(
        '/api/stripe/verify-payment-intent?payment_intent_id=${Uri.encodeComponent(paymentIntentId)}',
      );

      if (verifyRes is Map && verifyRes['order'] != null) {
        return OrderModel.fromJson(verifyRes['order'] as Map<String, dynamic>);
      }

      // Fallback: If verification response doesn't have full order object, return constructed object
      return OrderModel(
        id: paymentIntentId,
        orderNumber: response['orderNumber'] ?? 'LUNAR-${DateTime.now().millisecondsSinceEpoch}',
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
        carrier: carrier,
        carrierName: carrierName,
        estimatedDelivery: estimatedDelivery,
      );
    } on StripeException catch (e) {
      if (e.error.code == FailureCode.Canceled) {
        // User closed or canceled the payment sheet
        return null;
      }
      throw ApiException(e.error.localizedMessage ?? 'Payment failed. Please try again.');
    } catch (e) {
      if (e is ApiException) rethrow;
      throw ApiException(e.toString());
    }
  }
}
