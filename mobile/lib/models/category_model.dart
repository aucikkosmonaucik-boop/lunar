class CategoryModel {
  final String id;
  final String name;
  final String slug;
  final String? description;
  final String? image;
  final String? badge;
  final int displayOrder;
  final String? parentId;
  final List<CategoryModel> children;
  final int productCount;

  CategoryModel({
    required this.id,
    required this.name,
    required this.slug,
    this.description,
    this.image,
    this.badge,
    this.displayOrder = 0,
    this.parentId,
    this.children = const [],
    this.productCount = 0,
  });

  factory CategoryModel.fromJson(Map<String, dynamic> json) {
    List<CategoryModel> parsedChildren = [];
    if (json['children'] is List) {
      parsedChildren = (json['children'] as List)
          .map((c) => CategoryModel.fromJson(c as Map<String, dynamic>))
          .toList();
    }

    int count = 0;
    if (json['_count'] is Map && json['_count']['products'] != null) {
      count = (json['_count']['products'] as num).toInt();
    }

    return CategoryModel(
      id: json['id']?.toString() ?? '',
      name: json['name']?.toString() ?? '',
      slug: json['slug']?.toString() ?? '',
      description: json['description']?.toString(),
      image: json['image']?.toString(),
      badge: json['badge']?.toString(),
      displayOrder: (json['displayOrder'] as num?)?.toInt() ?? 0,
      parentId: json['parentId']?.toString(),
      children: parsedChildren,
      productCount: count,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'slug': slug,
      'description': description,
      'image': image,
      'badge': badge,
      'displayOrder': displayOrder,
      'parentId': parentId,
      'children': children.map((c) => c.toJson()).toList(),
    };
  }
}
