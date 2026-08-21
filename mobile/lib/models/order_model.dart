class OrderItemModel {
  final String id;
  final String? productId;
  final String name;
  final double price;
  final int quantity;
  final String image;
  final String? selectedOptions;

  OrderItemModel({
    required this.id,
    this.productId,
    required this.name,
    required this.price,
    required this.quantity,
    required this.image,
    this.selectedOptions,
  });

  factory OrderItemModel.fromJson(Map<String, dynamic> json) {
    return OrderItemModel(
      id: json['id']?.toString() ?? '',
      productId: json['productId']?.toString(),
      name: json['name']?.toString() ?? 'Produkt',
      price: (json['price'] as num?)?.toDouble() ?? 0.0,
      quantity: (json['quantity'] as num?)?.toInt() ?? 1,
      image: json['image']?.toString() ?? '',
      selectedOptions: json['selectedOptions']?.toString(),
    );
  }
}

class OrderModel {
  final String id;
  final String orderNumber;
  final String customerName;
  final String customerEmail;
  final String? shippingPhone;
  final String shippingStreet;
  final String shippingCity;
  final String shippingPostalCode;
  final String shippingCountry;
  final String? orderNotes;
  final double subtotal;
  final String? discountCode;
  final double discountAmount;
  final double shippingFee;
  final double total;
  final String status;
  final String paymentStatus;
  final String paymentMethod;
  final List<OrderItemModel> items;
  final DateTime? createdAt;

  OrderModel({
    required this.id,
    required this.orderNumber,
    required this.customerName,
    required this.customerEmail,
    this.shippingPhone,
    required this.shippingStreet,
    required this.shippingCity,
    required this.shippingPostalCode,
    this.shippingCountry = 'Ireland',
    this.orderNotes,
    required this.subtotal,
    this.discountCode,
    this.discountAmount = 0,
    this.shippingFee = 0,
    required this.total,
    this.status = 'Processing',
    this.paymentStatus = 'pending',
    this.paymentMethod = 'card',
    this.items = const [],
    this.createdAt,
  });

  factory OrderModel.fromJson(Map<String, dynamic> json) {
    List<OrderItemModel> parsedItems = [];
    if (json['items'] is List) {
      parsedItems = (json['items'] as List)
          .map((i) => OrderItemModel.fromJson(i as Map<String, dynamic>))
          .toList();
    }

    return OrderModel(
      id: json['id']?.toString() ?? '',
      orderNumber: json['orderNumber']?.toString() ?? 'LUNAR-000000',
      customerName: json['customerName']?.toString() ?? '',
      customerEmail: json['customerEmail']?.toString() ?? '',
      shippingPhone: json['shippingPhone']?.toString(),
      shippingStreet: json['shippingStreet']?.toString() ?? '',
      shippingCity: json['shippingCity']?.toString() ?? '',
      shippingPostalCode: json['shippingPostalCode']?.toString() ?? '',
      shippingCountry: json['shippingCountry']?.toString() ?? 'Ireland',
      orderNotes: json['orderNotes']?.toString(),
      subtotal: (json['subtotal'] as num?)?.toDouble() ?? 0.0,
      discountCode: json['discountCode']?.toString(),
      discountAmount: (json['discountAmount'] as num?)?.toDouble() ?? 0.0,
      shippingFee: (json['shippingFee'] as num?)?.toDouble() ?? 0.0,
      total: (json['total'] as num?)?.toDouble() ?? 0.0,
      status: json['status']?.toString() ?? 'Processing',
      paymentStatus: json['paymentStatus']?.toString() ?? 'pending',
      paymentMethod: json['paymentMethod']?.toString() ?? 'card',
      items: parsedItems,
      createdAt: json['createdAt'] != null ? DateTime.tryParse(json['createdAt'].toString()) : null,
    );
  }
}
