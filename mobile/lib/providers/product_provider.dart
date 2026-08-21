import 'package:flutter/foundation.dart';
import '../core/constants/api_constants.dart';
import '../core/services/api_service.dart';
import '../models/product_model.dart';
import '../models/category_model.dart';
import '../models/review_model.dart';

class ProductProvider extends ChangeNotifier {
  List<Product> _products = [];
  List<Product> _featuredProducts = [];
  List<Product> _newArrivals = [];
  List<Product> _bestsellers = [];
  List<CategoryModel> _categories = [];
  
  bool _isLoading = false;
  bool _isLoadingMore = false;
  String? _errorMessage;

  // Filters & State
  String? _selectedCategory;
  String? _selectedBadge;
  String _selectedSort = 'featured'; // 'featured', 'price-asc', 'price-desc', 'rating', 'newest'
  String _searchQuery = '';
  int _totalCount = 0;
  int _offset = 0;
  final int _limit = 20;

  List<Product> get products => _products;
  List<Product> get featuredProducts => _featuredProducts;
  List<Product> get newArrivals => _newArrivals;
  List<Product> get bestsellers => _bestsellers;
  List<CategoryModel> get categories => _categories;
  bool get isLoading => _isLoading;
  bool get isLoadingMore => _isLoadingMore;
  String? get errorMessage => _errorMessage;
  String? get selectedCategory => _selectedCategory;
  String? get selectedBadge => _selectedBadge;
  String get selectedSort => _selectedSort;
  String get searchQuery => _searchQuery;
  int get totalCount => _totalCount;
  bool get hasMore => _products.length < _totalCount;

  ProductProvider() {
    loadInitialData();
  }

  Future<void> loadInitialData() async {
    await Future.wait([
      fetchCategories(),
      fetchFeaturedProducts(),
      fetchNewArrivals(),
      fetchBestsellers(),
      fetchProducts(refresh: true),
    ]);
  }

  Future<void> fetchCategories() async {
    try {
      final res = await ApiService.get(ApiConstants.categories);
      if (res is Map && res['categories'] is List) {
        _categories = (res['categories'] as List)
            .map((c) => CategoryModel.fromJson(c as Map<String, dynamic>))
            .toList();
        notifyListeners();
      }
    } catch (e) {
      debugPrint('Error fetching categories: $e');
    }
  }

  Future<void> fetchFeaturedProducts() async {
    try {
      final res = await ApiService.get(
        ApiConstants.products,
        queryParams: {'featured': 'true', 'limit': '8'},
      );
      if (res is Map && res['products'] is List) {
        _featuredProducts = (res['products'] as List)
            .map((p) => Product.fromJson(p as Map<String, dynamic>))
            .toList();
        notifyListeners();
      }
    } catch (e) {
      debugPrint('Error fetching featured products: $e');
    }
  }

  Future<void> fetchNewArrivals() async {
    try {
      final res = await ApiService.get(
        ApiConstants.products,
        queryParams: {'badge': 'NEW', 'limit': '8'},
      );
      if (res is Map && res['products'] is List) {
        _newArrivals = (res['products'] as List)
            .map((p) => Product.fromJson(p as Map<String, dynamic>))
            .toList();
        notifyListeners();
      }
    } catch (e) {
      debugPrint('Error fetching new arrivals: $e');
    }
  }

  Future<void> fetchBestsellers() async {
    try {
      final res = await ApiService.get(
        ApiConstants.products,
        queryParams: {'badge': 'BESTSELLER', 'limit': '8'},
      );
      if (res is Map && res['products'] is List) {
        _bestsellers = (res['products'] as List)
            .map((p) => Product.fromJson(p as Map<String, dynamic>))
            .toList();
        notifyListeners();
      }
    } catch (e) {
      debugPrint('Error fetching bestsellers: $e');
    }
  }

  Future<void> fetchProducts({bool refresh = false}) async {
    if (refresh) {
      _offset = 0;
      _isLoading = true;
      _errorMessage = null;
      notifyListeners();
    } else {
      if (_isLoadingMore || !hasMore) return;
      _isLoadingMore = true;
      notifyListeners();
    }

    try {
      final queryParams = <String, dynamic>{
        'limit': _limit,
        'offset': _offset,
      };

      if (_selectedCategory != null && _selectedCategory!.isNotEmpty && _selectedCategory != 'all') {
        queryParams['category'] = _selectedCategory;
      }
      if (_selectedBadge != null && _selectedBadge!.isNotEmpty) {
        queryParams['badge'] = _selectedBadge;
      }
      if (_selectedSort.isNotEmpty && _selectedSort != 'featured') {
        queryParams['sort'] = _selectedSort;
      }
      if (_searchQuery.trim().isNotEmpty) {
        queryParams['search'] = _searchQuery.trim();
      }

      final res = await ApiService.get(
        ApiConstants.products,
        queryParams: queryParams,
      );

      if (res is Map && res['products'] is List) {
        final List<Product> fetched = (res['products'] as List)
            .map((p) => Product.fromJson(p as Map<String, dynamic>))
            .toList();

        _totalCount = (res['totalCount'] as num?)?.toInt() ?? fetched.length;

        if (refresh) {
          _products = fetched;
        } else {
          _products.addAll(fetched);
        }

        _offset = _products.length;
      }
    } catch (e) {
      _errorMessage = e.toString();
    } finally {
      _isLoading = false;
      _isLoadingMore = false;
      notifyListeners();
    }
  }

  void setCategory(String? categorySlug) {
    if (_selectedCategory == categorySlug) return;
    _selectedCategory = categorySlug;
    fetchProducts(refresh: true);
  }

  void setBadge(String? badge) {
    if (_selectedBadge == badge) return;
    _selectedBadge = badge;
    fetchProducts(refresh: true);
  }

  void setSort(String sort) {
    if (_selectedSort == sort) return;
    _selectedSort = sort;
    fetchProducts(refresh: true);
  }

  void setSearchQuery(String query) {
    _searchQuery = query;
    fetchProducts(refresh: true);
  }

  void clearFilters() {
    _selectedCategory = null;
    _selectedBadge = null;
    _selectedSort = 'featured';
    _searchQuery = '';
    fetchProducts(refresh: true);
  }

  Future<Product?> getProductDetails(String idOrSlug) async {
    try {
      final res = await ApiService.get(
        ApiConstants.products,
        queryParams: {'id': idOrSlug},
      );
      if (res is Map && res['product'] != null) {
        return Product.fromJson(res['product'] as Map<String, dynamic>);
      }
    } catch (e) {
      debugPrint('Error fetching product detail: $e');
    }
    return null;
  }

  Future<List<Review>> getProductReviews(String productId) async {
    try {
      final res = await ApiService.get(
        ApiConstants.reviews,
        queryParams: {'productId': productId},
      );
      if (res is Map && res['reviews'] is List) {
        return (res['reviews'] as List)
            .map((r) => Review.fromJson(r as Map<String, dynamic>))
            .toList();
      }
    } catch (e) {
      debugPrint('Error fetching reviews: $e');
    }
    return [];
  }

  Future<bool> addReview({
    required String productId,
    required String authorName,
    required int rating,
    required String comment,
    String? title,
  }) async {
    try {
      await ApiService.post(
        ApiConstants.reviews,
        body: {
          'productId': productId,
          'authorName': authorName,
          'rating': rating,
          'comment': comment,
          'title': title,
        },
      );
      return true;
    } catch (e) {
      debugPrint('Error adding review: $e');
      return false;
    }
  }
}
