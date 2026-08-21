class User {
  final String id;
  final String email;
  final String? name;
  final String? phone;
  final String? street;
  final String? city;
  final String? postalCode;
  final String? country;
  final String role;
  final int loyaltyPoints;

  User({
    required this.id,
    required this.email,
    this.name,
    this.phone,
    this.street,
    this.city,
    this.postalCode,
    this.country = 'Ireland',
    this.role = 'USER',
    this.loyaltyPoints = 0,
  });

  bool get isAdmin => role.toUpperCase() == 'ADMIN';

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id']?.toString() ?? '',
      email: json['email']?.toString() ?? '',
      name: json['name']?.toString(),
      phone: json['phone']?.toString(),
      street: json['street']?.toString(),
      city: json['city']?.toString(),
      postalCode: json['postalCode']?.toString(),
      country: json['country']?.toString() ?? 'Ireland',
      role: json['role']?.toString() ?? 'USER',
      loyaltyPoints: (json['loyaltyPoints'] as num?)?.toInt() ?? 0,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'email': email,
      'name': name,
      'phone': phone,
      'street': street,
      'city': city,
      'postalCode': postalCode,
      'country': country,
      'role': role,
      'loyaltyPoints': loyaltyPoints,
    };
  }

  User copyWith({
    String? name,
    String? phone,
    String? street,
    String? city,
    String? postalCode,
    String? country,
    int? loyaltyPoints,
  }) {
    return User(
      id: id,
      email: email,
      name: name ?? this.name,
      phone: phone ?? this.phone,
      street: street ?? this.street,
      city: city ?? this.city,
      postalCode: postalCode ?? this.postalCode,
      country: country ?? this.country,
      role: role,
      loyaltyPoints: loyaltyPoints ?? this.loyaltyPoints,
    );
  }
}
