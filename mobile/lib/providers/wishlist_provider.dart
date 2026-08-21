import 'package:flutter/foundation.dart';
import '../core/services/storage_service.dart';
import '../models/product_model.dart';

class WishlistProvider extends ChangeNotifier {
  final Set<String> _wishlistIds = {};
  final List<Product> _wishlistProducts = [];

  Set<String> get wishlistIds => _wishlistIds;
  List<Product> get wishlistProducts => _wishlistProducts;
  int get count => _wishlistIds.length;

  WishlistProvider() {
    _loadWishlist();
  }

  void _loadWishlist() {
    final ids = StorageService.getWishlistIds();
    _wishlistIds.addAll(ids);
    notifyListeners();
  }

  bool isFavorite(String productId) {
    return _wishlistIds.contains(productId);
  }

  Future<void> toggleFavorite(Product product) async {
    if (_wishlistIds.contains(product.id)) {
      _wishlistIds.remove(product.id);
      _wishlistProducts.removeWhere((p) => p.id == product.id);
    } else {
      _wishlistIds.add(product.id);
      if (!_wishlistProducts.any((p) => p.id == product.id)) {
        _wishlistProducts.add(product);
      }
    }

    await StorageService.setWishlistIds(_wishlistIds.toList());
    notifyListeners();
  }

  Future<void> removeFavorite(String productId) async {
    if (_wishlistIds.contains(productId)) {
      _wishlistIds.remove(productId);
      _wishlistProducts.removeWhere((p) => p.id == productId);
      await StorageService.setWishlistIds(_wishlistIds.toList());
      notifyListeners();
    }
  }

  Future<void> clearWishlist() async {
    _wishlistIds.clear();
    _wishlistProducts.clear();
    await StorageService.setWishlistIds([]);
    notifyListeners();
  }
}
