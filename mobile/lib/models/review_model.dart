class Review {
  final String id;
  final String productId;
  final String? userId;
  final String authorName;
  final int rating;
  final String? title;
  final String comment;
  final bool verified;
  final int helpfulCount;
  final DateTime? createdAt;

  Review({
    required this.id,
    required this.productId,
    this.userId,
    required this.authorName,
    required this.rating,
    this.title,
    required this.comment,
    this.verified = false,
    this.helpfulCount = 0,
    this.createdAt,
  });

  factory Review.fromJson(Map<String, dynamic> json) {
    return Review(
      id: json['id']?.toString() ?? '',
      productId: json['productId']?.toString() ?? '',
      userId: json['userId']?.toString(),
      authorName: json['authorName']?.toString() ?? 'Klient',
      rating: (json['rating'] as num?)?.toInt() ?? 5,
      title: json['title']?.toString(),
      comment: json['comment']?.toString() ?? '',
      verified: json['verified'] == true,
      helpfulCount: (json['helpfulCount'] as num?)?.toInt() ?? 0,
      createdAt: json['createdAt'] != null ? DateTime.tryParse(json['createdAt'].toString()) : null,
    );
  }
}
