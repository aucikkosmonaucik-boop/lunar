class Product {
  final String id;
  final String name;
  final String slug;
  final String description;
  final double price;
  final double? originalPrice;
  final String image;
  final List<String> images;
  final String categorySlug;
  final String? categoryId;
  final String? categoryName;
  final String? subcategory;
  final String? badge;
  final double rating;
  final int reviewCount;
  final int stock;
  final List<String> tags;
  final List<String> features;
  final bool isAvailable;
  final bool isFeatured;
  final DateTime? createdAt;

  Product({
    required this.id,
    required this.name,
    required this.slug,
    required this.description,
    required this.price,
    this.originalPrice,
    required this.image,
    this.images = const [],
    required this.categorySlug,
    this.categoryId,
    this.categoryName,
    this.subcategory,
    this.badge,
    this.rating = 5.0,
    this.reviewCount = 0,
    this.stock = 10,
    this.tags = const [],
    this.features = const [],
    this.isAvailable = true,
    this.isFeatured = false,
    this.createdAt,
  });

  bool get hasDiscount => originalPrice != null && originalPrice! > price;
  
  double get discountPercent {
    if (!hasDiscount || originalPrice == 0) return 0;
    return (((originalPrice! - price) / originalPrice!) * 100).roundToDouble();
  }

  bool get isSoldOut => stock <= 0 || badge?.toUpperCase() == 'SOLD OUT' || !isAvailable;
  bool get inStock => !isSoldOut;

  factory Product.fromJson(Map<String, dynamic> json) {
    List<String> parseList(dynamic val) {
      if (val is List) {
        return val.map((e) => e.toString()).toList();
      }
      return [];
    }

    String? catName;
    if (json['category'] is Map) {
      catName = json['category']['name']?.toString();
    } else if (json['category'] is String) {
      catName = json['category'];
    }

    return Product(
      id: json['id']?.toString() ?? '',
      name: json['name']?.toString() ?? 'Produkt',
      slug: json['slug']?.toString() ?? '',
      description: json['description']?.toString() ?? '',
      price: (json['price'] as num?)?.toDouble() ?? 0.0,
      originalPrice: (json['originalPrice'] as num?)?.toDouble(),
      image: json['image']?.toString() ?? '',
      images: parseList(json['images']),
      categorySlug: json['categorySlug']?.toString() ?? json['category']?.toString() ?? 'jewelry',
      categoryId: json['categoryId']?.toString(),
      categoryName: catName,
      subcategory: json['subcategory']?.toString(),
      badge: json['badge']?.toString(),
      rating: (json['rating'] as num?)?.toDouble() ?? 5.0,
      reviewCount: (json['reviewCount'] as num?)?.toInt() ?? 0,
      stock: (json['stock'] as num?)?.toInt() ?? 10,
      tags: parseList(json['tags']),
      features: parseList(json['features']),
      isAvailable: json['isAvailable'] == null ? true : (json['isAvailable'] as bool),
      isFeatured: json['isFeatured'] == true,
      createdAt: json['createdAt'] != null ? DateTime.tryParse(json['createdAt'].toString()) : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'slug': slug,
      'description': description,
      'price': price,
      'originalPrice': originalPrice,
      'image': image,
      'images': images,
      'categorySlug': categorySlug,
      'categoryId': categoryId,
      'subcategory': subcategory,
      'badge': badge,
      'rating': rating,
      'reviewCount': reviewCount,
      'stock': stock,
      'tags': tags,
      'features': features,
      'isAvailable': isAvailable,
      'isFeatured': isFeatured,
    };
  }
}
