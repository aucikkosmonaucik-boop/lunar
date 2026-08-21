import 'package:flutter/foundation.dart';
import '../core/constants/api_constants.dart';
import '../core/services/api_service.dart';
import '../models/cart_item_model.dart';
import '../models/order_model.dart';

class OrderProvider extends ChangeNotifier {
  List<OrderModel> _orders = [];
  bool _isLoading = false;
  String? _errorMessage;

  List<OrderModel> get orders => _orders;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;

  Future<void> fetchUserOrders() async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final res = await ApiService.get(ApiConstants.ordersList);
      if (res is Map && res['orders'] is List) {
        _orders = (res['orders'] as List)
            .map((o) => OrderModel.fromJson(o as Map<String, dynamic>))
            .toList();
      }
    } catch (e) {
      _errorMessage = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<OrderModel?> createOrder({
    required List<CartItem> items,
    required double total,
    required double subtotal,
    required String paymentMethod,
    required String name,
    required String email,
    required String street,
    required String city,
    required String postalCode,
    String country = 'Polska',
    String? phone,
    String? orderNotes,
    String? discountCode,
    double discountAmount = 0.0,
    double shippingFee = 0.0,
  }) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final payload = {
        'items': items.map((i) => i.toJson()).toList(),
        'total': total,
        'subtotal': subtotal,
        'paymentMethod': paymentMethod,
        'discountCode': discountCode,
        'discountAmount': discountAmount,
        'shippingFee': shippingFee,
        'orderNotes': orderNotes,
        'shippingAddress': {
          'name': name.trim(),
          'email': email.trim(),
          'phone': phone?.trim(),
          'street': street.trim(),
          'city': city.trim(),
          'postalCode': postalCode.trim(),
          'country': country.trim(),
        },
      };

      final res = await ApiService.post(
        ApiConstants.ordersCreate,
        body: payload,
      );

      _isLoading = false;
      notifyListeners();

      if (res is Map && res['order'] != null) {
        final newOrder = OrderModel.fromJson(res['order'] as Map<String, dynamic>);
        _orders.insert(0, newOrder);
        notifyListeners();
        return newOrder;
      }
      throw ApiException('Nie udało się utworzyć zamówienia');
    } catch (e) {
      _isLoading = false;
      _errorMessage = e.toString();
      notifyListeners();
      return null;
    }
  }

  Future<OrderModel?> trackOrder({required String orderNumber, required String email}) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final res = await ApiService.get(
        ApiConstants.ordersList,
        queryParams: {
          'orderNumber': orderNumber.trim(),
          'email': email.trim(),
        },
      );

      _isLoading = false;
      notifyListeners();

      if (res is Map && res['order'] != null) {
        return OrderModel.fromJson(res['order'] as Map<String, dynamic>);
      }
      throw ApiException('Nie znaleziono zamówienia');
    } catch (e) {
      _isLoading = false;
      _errorMessage = e.toString();
      notifyListeners();
      return null;
    }
  }
}
