class NotificationModel {
  final String id;
  final String userId;
  final String title;
  final String message;
  final String type; // ORDER, SHIPPING, PAYMENT, LOYALTY, PROMO
  final String? orderId;
  final String? orderNumber;
  final String? linkUrl;
  bool isRead;
  final DateTime createdAt;

  NotificationModel({
    required this.id,
    required this.userId,
    required this.title,
    required this.message,
    required this.type,
    this.orderId,
    this.orderNumber,
    this.linkUrl,
    required this.isRead,
    required this.createdAt,
  });

  factory NotificationModel.fromJson(Map<String, dynamic> json) {
    return NotificationModel(
      id: json['id']?.toString() ?? '',
      userId: json['userId']?.toString() ?? '',
      title: json['title']?.toString() ?? '',
      message: json['message']?.toString() ?? '',
      type: json['type']?.toString() ?? 'ORDER',
      orderId: json['orderId']?.toString(),
      orderNumber: json['orderNumber']?.toString(),
      linkUrl: json['linkUrl']?.toString(),
      isRead: json['isRead'] == true,
      createdAt: json['createdAt'] != null
          ? DateTime.tryParse(json['createdAt'].toString()) ?? DateTime.now()
          : DateTime.now(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'userId': userId,
      'title': title,
      'message': message,
      'type': type,
      'orderId': orderId,
      'orderNumber': orderNumber,
      'linkUrl': linkUrl,
      'isRead': isRead,
      'createdAt': createdAt.toIso8601String(),
    };
  }
}
