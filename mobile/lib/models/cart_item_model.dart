import 'product_model.dart';

class CartItem {
  final Product product;
  int quantity;
  final String? selectedOptions;

  CartItem({
    required this.product,
    this.quantity = 1,
    this.selectedOptions,
  });

  double get totalPrice => product.price * quantity;

  Map<String, dynamic> toJson() {
    return {
      'product': {
        'id': product.id,
        'name': product.name,
        'price': product.price,
        'image': product.image,
      },
      'quantity': quantity,
      'selectedOptions': selectedOptions,
    };
  }

  factory CartItem.fromJson(Map<String, dynamic> json) {
    return CartItem(
      product: Product.fromJson(json['product'] as Map<String, dynamic>),
      quantity: (json['quantity'] as num?)?.toInt() ?? 1,
      selectedOptions: json['selectedOptions']?.toString(),
    );
  }
}
