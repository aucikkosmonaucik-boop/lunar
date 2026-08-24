import 'package:flutter/foundation.dart';
import '../core/constants/api_constants.dart';
import '../core/services/api_service.dart';
import '../models/cart_item_model.dart';
import '../models/product_model.dart';
import '../models/promo_code_model.dart';

class CartProvider extends ChangeNotifier {
  final List<CartItem> _items = [];
  PromoCode? _appliedPromo;
  double _loyaltyDiscount = 0.0;
  bool _isApplyingPromo = false;
  String? _promoError;

  List<CartItem> get items => _items;
  PromoCode? get appliedPromo => _appliedPromo;
  double get loyaltyDiscount => _loyaltyDiscount;
  bool get isApplyingPromo => _isApplyingPromo;
  String? get promoError => _promoError;

  int get itemCount => _items.fold(0, (sum, item) => sum + item.quantity);

  double get subtotal => _items.fold(0.0, (sum, item) => sum + item.totalPrice);

  double get promoDiscountAmount {
    if (_appliedPromo == null) return 0.0;
    return _appliedPromo!.calculateDiscount(subtotal);
  }

  double get shippingFee {
    if (subtotal == 0) return 0.0;
    if (subtotal >= 100.0) return 0.0; // Free shipping above €100
    return 5.0; // Standard shipping fee €5.00
  }

  double get total {
    final rawTotal = subtotal - promoDiscountAmount - _loyaltyDiscount + shippingFee;
    return rawTotal > 0 ? rawTotal : 0.0;
  }

  void addToCart(Product product, {int quantity = 1, String? selectedOptions}) {
    if (product.isSoldOut || quantity <= 0) return;

    final maxStock = product.stock > 0 ? product.stock : 999;
    final existingIndex = _items.indexWhere(
      (item) => item.product.id == product.id && item.selectedOptions == selectedOptions,
    );

    if (existingIndex != -1) {
      final currentQty = _items[existingIndex].quantity;
      _items[existingIndex].quantity = (currentQty + quantity).clamp(1, maxStock);
    } else {
      _items.add(CartItem(
        product: product,
        quantity: quantity.clamp(1, maxStock),
        selectedOptions: selectedOptions,
      ));
    }
    notifyListeners();
  }

  void updateQuantity(CartItem item, int newQuantity) {
    if (newQuantity <= 0) {
      removeFromCart(item);
    } else {
      final maxStock = item.product.stock > 0 ? item.product.stock : 999;
      item.quantity = newQuantity.clamp(1, maxStock);
      notifyListeners();
    }
  }

  void removeFromCart(CartItem item) {
    _items.remove(item);
    notifyListeners();
  }

  void clearCart() {
    _items.clear();
    _appliedPromo = null;
    _loyaltyDiscount = 0.0;
    _promoError = null;
    notifyListeners();
  }

  Future<bool> applyPromoCode(String code) async {
    final trimmed = code.trim().toUpperCase();
    if (trimmed.isEmpty) return false;

    _isApplyingPromo = true;
    _promoError = null;
    notifyListeners();

    try {
      final res = await ApiService.get(
        ApiConstants.promos,
        queryParams: {'code': trimmed},
      );

      if (res is Map && res['promo'] != null) {
        final promo = PromoCode.fromJson(res['promo'] as Map<String, dynamic>);
        if (subtotal < promo.minOrderValue) {
          _promoError = 'Minimum order value required: €${promo.minOrderValue.toStringAsFixed(2)}';
          _isApplyingPromo = false;
          notifyListeners();
          return false;
        }

        _appliedPromo = promo;
        _isApplyingPromo = false;
        notifyListeners();
        return true;
      }
      
      _promoError = 'Invalid or inactive promo code';
      _isApplyingPromo = false;
      notifyListeners();
      return false;
    } catch (e) {
      _promoError = 'Promo verification error: $e';
      _isApplyingPromo = false;
      notifyListeners();
      return false;
    }
  }

  void removePromoCode() {
    _appliedPromo = null;
    _promoError = null;
    notifyListeners();
  }

  void applyLoyaltyPointsDiscount(int points, double pointsValue) {
    _loyaltyDiscount = pointsValue;
    notifyListeners();
  }

  void removeLoyaltyDiscount() {
    _loyaltyDiscount = 0.0;
    notifyListeners();
  }
}
