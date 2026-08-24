import 'package:flutter/foundation.dart';
import '../core/constants/api_constants.dart';
import '../core/services/api_service.dart';
import '../core/services/storage_service.dart';
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

  // --- Customer Reviews with local storage and backend sync ---

  static final List<Review> _seedReviews = [
    Review(
      id: 'rev-101',
      productId: '1',
      authorName: 'Charlotte Vance',
      rating: 5,
      title: 'Pure springtime elegance',
      comment: 'The scent opens with subtle fresh peony and settles into a dreamy, velvety floral aroma. I receive compliments every single day at the gallery. Lasts over 8 hours on my pulse points!',
      verified: true,
      helpfulCount: 24,
      createdAt: DateTime.tryParse('2025-10-18T14:32:00.000Z'),
    ),
    Review(
      id: 'rev-102',
      productId: '1',
      authorName: 'Elena Rostova',
      rating: 5,
      title: 'Compact luxury at its finest',
      comment: 'The 33ml size is ideal for travel and evening clutches. The glass bottle feels weightless yet substantial. A warm, feminine and delightfully romantic aroma.',
      verified: true,
      helpfulCount: 15,
      createdAt: DateTime.tryParse('2025-11-04T09:15:00.000Z'),
    ),
    Review(
      id: 'rev-201',
      productId: '2',
      authorName: 'Genevieve Monet',
      rating: 5,
      title: 'Crisp white lilies and ethereal jasmine',
      comment: 'So fresh and uplifting. It gives an immediate aura of clean sophistication. Packaging and atomiser spray dispersion are top-tier.',
      verified: true,
      helpfulCount: 31,
      createdAt: DateTime.tryParse('2025-09-29T11:20:00.000Z'),
    ),
    Review(
      id: 'rev-301',
      productId: '3',
      authorName: 'Amara Sinclair',
      rating: 5,
      title: 'Sweet cherry blossom with vanilla',
      comment: 'Warm, inviting, and truly captivating. It strikes the perfect balance between fruity floral freshness and sweet warmth.',
      verified: true,
      helpfulCount: 14,
      createdAt: DateTime.tryParse('2025-12-05T18:10:00.000Z'),
    ),
    Review(
      id: 'rev-401',
      productId: '4',
      authorName: 'Natalia Duprès',
      rating: 5,
      title: 'Intense, mysterious, and captivating',
      comment: 'A magnificent blend of dark Turkish rose and warm amber resin. It exudes quiet confidence and elegance. A true head-turner.',
      verified: true,
      helpfulCount: 42,
      createdAt: DateTime.tryParse('2025-08-14T20:11:00.000Z'),
    ),
    Review(
      id: 'rev-501',
      productId: '5',
      authorName: 'Madeleine Thorne',
      rating: 5,
      title: 'Architectural minimalism done to perfection',
      comment: 'The polished 925 sterling silver has a mirror-like sheen. They catch the light effortlessly without pulling down on my earlobes. Featherlight and exceptionally well crafted.',
      verified: true,
      helpfulCount: 38,
      createdAt: DateTime.tryParse('2025-10-02T15:20:00.000Z'),
    ),
    Review(
      id: 'rev-601',
      productId: '6',
      authorName: 'Julianne Ward',
      rating: 5,
      title: 'Warm radiance and breathtaking details',
      comment: 'The sun pendant has intricate tactile rays that radiate luxury. The 18k gold tone is rich and warm, not brassy. The adjustable chain makes it versatile for different necklines.',
      verified: true,
      helpfulCount: 29,
      createdAt: DateTime.tryParse('2025-09-17T14:45:00.000Z'),
    ),
    Review(
      id: 'rev-701',
      productId: '7',
      authorName: 'Seraphina Leighton',
      rating: 5,
      title: 'Mesmerizing brilliance and timeless design',
      comment: 'The emerald-cut zirconia has astonishing clarity and fire. The prong setting feels sturdy and snag-free against knitwear. Truly a staple in my fine jewelry collection.',
      verified: true,
      helpfulCount: 52,
      createdAt: DateTime.tryParse('2025-08-30T10:14:00.000Z'),
    ),
    Review(
      id: 'rev-1001',
      productId: '10',
      authorName: 'Gwendolyn Frost',
      rating: 5,
      title: 'Natural baroque luster is extraordinary',
      comment: 'Each pearl has its own organic contour and stunning orient. The gold huggie clasp snaps securely with a satisfying click. Ideal for special celebrations.',
      verified: true,
      helpfulCount: 47,
      createdAt: DateTime.tryParse('2025-07-22T09:40:00.000Z'),
    ),
    Review(
      id: 'rev-1401',
      productId: '14',
      authorName: 'Vivienne St. Claire',
      rating: 5,
      title: 'Pure fairytale perfection for bridal wear',
      comment: 'I wore this suite on my wedding day in Lake Como. The crystal cascades caught the sunset light magnificently in photos. The craftsmanship is haute couture standard.',
      verified: true,
      helpfulCount: 78,
      createdAt: DateTime.tryParse('2025-06-18T16:20:00.000Z'),
    ),
  ];

  Future<List<Review>> getProductReviews(String productId) async {
    // 1. Load cached reviews from local SharedPreferences
    List<Map<String, dynamic>> stored = StorageService.getStoredReviews();
    if (stored.isEmpty) {
      // Seed default reviews if empty
      stored = _seedReviews.map((r) => r.toJson()).toList();
      await StorageService.saveStoredReviews(stored);
    }

    final localList = stored
        .map((j) => Review.fromJson(j))
        .where((r) => r.productId == productId || r.productId == productId.toString())
        .toList();

    // 2. Try fetching latest reviews from API in background/network
    try {
      final res = await ApiService.get(
        ApiConstants.reviews,
        queryParams: {'productId': productId},
      );
      if (res is Map && res['reviews'] is List) {
        final apiReviews = (res['reviews'] as List)
            .map((r) => Review.fromJson(r as Map<String, dynamic>))
            .toList();

        if (apiReviews.isNotEmpty) {
          // Merge API reviews into local cache avoiding duplicates
          final allCached = StorageService.getStoredReviews().map((j) => Review.fromJson(j)).toList();
          final existingIds = allCached.map((r) => r.id).toSet();

          for (final ar in apiReviews) {
            if (!existingIds.contains(ar.id)) {
              allCached.insert(0, ar);
              existingIds.add(ar.id);
            }
          }
          await StorageService.saveStoredReviews(allCached.map((r) => r.toJson()).toList());

          // Sort descending by date
          apiReviews.sort((a, b) {
            final da = a.createdAt ?? DateTime(2025);
            final db = b.createdAt ?? DateTime(2025);
            return db.compareTo(da);
          });
          return apiReviews;
        }
      }
    } catch (e) {
      debugPrint('Online fetch reviews warning: $e');
    }

    // Sort local reviews by date descending
    localList.sort((a, b) {
      final da = a.createdAt ?? DateTime(2025);
      final db = b.createdAt ?? DateTime(2025);
      return db.compareTo(da);
    });

    return localList;
  }

  Future<bool> addReview({
    required String productId,
    required String authorName,
    required int rating,
    required String comment,
    String? title,
  }) async {
    // 1. Create review object immediately (optimistic update)
    final newReview = Review(
      id: 'rev-${DateTime.now().millisecondsSinceEpoch}',
      productId: productId,
      authorName: authorName,
      rating: rating,
      comment: comment,
      title: title,
      verified: true,
      helpfulCount: 0,
      createdAt: DateTime.now(),
    );

    // 2. Save directly to local persistent storage
    await StorageService.addStoredReview(newReview.toJson());

    // 3. Update in-memory product statistics (rating & review count)
    _updateProductStatsInMemory(productId, rating);
    notifyListeners();

    // 4. Send to backend REST API
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
    } catch (e) {
      debugPrint('Backend review submission warning: $e');
      // Even if network fails, the review is safely persisted locally!
    }

    return true;
  }

  void _updateProductStatsInMemory(String productId, int newRating) {
    void updateList(List<Product> list) {
      final index = list.indexWhere((p) => p.id == productId || p.slug == productId);
      if (index != -1) {
        final p = list[index];
        final newCount = p.reviewCount + 1;
        final newAvg = NumberFormatUtils.calculateNewAverage(p.rating, p.reviewCount, newRating.toDouble());
        list[index] = Product(
          id: p.id,
          name: p.name,
          slug: p.slug,
          description: p.description,
          price: p.price,
          originalPrice: p.originalPrice,
          image: p.image,
          images: p.images,
          categorySlug: p.categorySlug,
          categoryId: p.categoryId,
          categoryName: p.categoryName,
          subcategory: p.subcategory,
          badge: p.badge,
          rating: newAvg,
          reviewCount: newCount,
          stock: p.stock,
          tags: p.tags,
          features: p.features,
          isAvailable: p.isAvailable,
          isFeatured: p.isFeatured,
          createdAt: p.createdAt,
        );
      }
    }

    updateList(_products);
    updateList(_featuredProducts);
    updateList(_bestsellers);
    updateList(_newArrivals);
  }
}

class NumberFormatUtils {
  static double calculateNewAverage(double currentRating, int currentCount, double newRating) {
    if (currentCount <= 0) return newRating;
    final sum = (currentRating * currentCount) + newRating;
    final total = currentCount + 1;
    return double.parse((sum / total).toStringAsFixed(1));
  }
}
