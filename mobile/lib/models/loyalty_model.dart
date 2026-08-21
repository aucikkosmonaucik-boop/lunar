class LoyaltyReward {
  final String id;
  final String title;
  final String? description;
  final int pointsCost;
  final String discountType; // "PERCENTAGE" | "FIXED"
  final double discountValue;
  final double minOrderValue;
  final bool isActive;

  LoyaltyReward({
    required this.id,
    required this.title,
    this.description,
    required this.pointsCost,
    this.discountType = 'FIXED',
    required this.discountValue,
    this.minOrderValue = 0,
    this.isActive = true,
  });

  factory LoyaltyReward.fromJson(Map<String, dynamic> json) {
    return LoyaltyReward(
      id: json['id']?.toString() ?? '',
      title: json['title']?.toString() ?? '',
      description: json['description']?.toString(),
      pointsCost: (json['pointsCost'] as num?)?.toInt() ?? 0,
      discountType: json['discountType']?.toString() ?? 'FIXED',
      discountValue: (json['discountValue'] as num?)?.toDouble() ?? 0.0,
      minOrderValue: (json['minOrderValue'] as num?)?.toDouble() ?? 0.0,
      isActive: json['isActive'] == null ? true : (json['isActive'] as bool),
    );
  }
}

class UserCoupon {
  final String id;
  final String userId;
  final String code;
  final String discountType;
  final double discountValue;
  final double minOrderValue;
  final bool isUsed;
  final DateTime? expiresAt;

  UserCoupon({
    required this.id,
    required this.userId,
    required this.code,
    this.discountType = 'FIXED',
    required this.discountValue,
    this.minOrderValue = 0,
    this.isUsed = false,
    this.expiresAt,
  });

  factory UserCoupon.fromJson(Map<String, dynamic> json) {
    return UserCoupon(
      id: json['id']?.toString() ?? '',
      userId: json['userId']?.toString() ?? '',
      code: json['code']?.toString() ?? '',
      discountType: json['discountType']?.toString() ?? 'FIXED',
      discountValue: (json['discountValue'] as num?)?.toDouble() ?? 0.0,
      minOrderValue: (json['minOrderValue'] as num?)?.toDouble() ?? 0.0,
      isUsed: json['isUsed'] == true,
      expiresAt: json['expiresAt'] != null ? DateTime.tryParse(json['expiresAt'].toString()) : null,
    );
  }
}
