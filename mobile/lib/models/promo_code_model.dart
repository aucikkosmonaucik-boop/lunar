class PromoCode {
  final String? id;
  final String code;
  final double discountPct;
  final double? discountAmount;
  final double minOrderValue;
  final bool isActive;
  final DateTime? expiresAt;

  PromoCode({
    this.id,
    required this.code,
    this.discountPct = 0,
    this.discountAmount,
    this.minOrderValue = 0,
    this.isActive = true,
    this.expiresAt,
  });

  double calculateDiscount(double subtotal) {
    if (subtotal < minOrderValue) return 0;
    if (discountPct > 0) {
      return (subtotal * (discountPct / 100));
    }
    if (discountAmount != null && discountAmount! > 0) {
      return discountAmount! > subtotal ? subtotal : discountAmount!;
    }
    return 0;
  }

  factory PromoCode.fromJson(Map<String, dynamic> json) {
    return PromoCode(
      id: json['id']?.toString(),
      code: json['code']?.toString() ?? '',
      discountPct: (json['discountPct'] as num?)?.toDouble() ?? 0.0,
      discountAmount: (json['discountAmount'] as num?)?.toDouble(),
      minOrderValue: (json['minOrderValue'] as num?)?.toDouble() ?? 0.0,
      isActive: json['isActive'] == null ? true : (json['isActive'] as bool),
      expiresAt: json['expiresAt'] != null ? DateTime.tryParse(json['expiresAt'].toString()) : null,
    );
  }
}
