import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../core/constants/app_colors.dart';
import '../../core/utils/formatters.dart';
import '../../providers/cart_provider.dart';
import '../../widgets/custom_button.dart';
import '../../widgets/empty_state_view.dart';
import '../checkout/checkout_screen.dart';
import '../shop/shop_screen.dart';

class CartScreen extends StatefulWidget {
  const CartScreen({super.key});

  @override
  State<CartScreen> createState() => _CartScreenState();
}

class _CartScreenState extends State<CartScreen> {
  final TextEditingController _promoController = TextEditingController();

  @override
  void dispose() {
    _promoController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final cartProvider = context.watch<CartProvider>();

    if (cartProvider.items.isEmpty) {
      return Scaffold(
        appBar: AppBar(
          title: Text(
            'Koszyk',
            style: GoogleFonts.cormorantGaramond(fontSize: 22, fontWeight: FontWeight.w700),
          ),
        ),
        body: EmptyStateView(
          icon: Icons.shopping_bag_outlined,
          title: 'Twój koszyk jest pusty',
          message: 'Dodaj do koszyka wyjątkowe produkty z naszej kolekcji.',
          buttonText: 'Przejdź do zakupów',
          onButtonPressed: () {
            Navigator.of(context).push(
              MaterialPageRoute(builder: (_) => const ShopScreen()),
            );
          },
        ),
      );
    }

    return Scaffold(
      appBar: AppBar(
        title: Text(
          'Koszyk (${cartProvider.itemCount})',
          style: GoogleFonts.cormorantGaramond(fontSize: 22, fontWeight: FontWeight.w700),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.delete_sweep_outlined),
            tooltip: 'Wyczyść koszyk',
            onPressed: () {
              showDialog(
                context: context,
                builder: (ctx) => AlertDialog(
                  title: const Text('Wyczyścić koszyk?'),
                  content: const Text('Wszystkie produkty zostaną usunięte z koszyka.'),
                  actions: [
                    TextButton(
                      onPressed: () => Navigator.pop(ctx),
                      child: const Text('Anuluj'),
                    ),
                    TextButton(
                      onPressed: () {
                        cartProvider.clearCart();
                        Navigator.pop(ctx);
                      },
                      child: const Text('Wyczyść', style: TextStyle(color: AppColors.error)),
                    ),
                  ],
                ),
              );
            },
          ),
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        children: [
          // Free Shipping Progress
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: isDark ? AppColors.darkSurface : AppColors.primaryLight.withValues(alpha: 0.25),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: isDark ? AppColors.darkBorder : AppColors.primaryLight),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Icon(
                      cartProvider.subtotal >= 250 ? Icons.check_circle_rounded : Icons.local_shipping_outlined,
                      size: 18,
                      color: cartProvider.subtotal >= 250 ? AppColors.success : AppColors.primary,
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        cartProvider.subtotal >= 250
                            ? 'Gratulacje! Masz darmową dostawę 🎉'
                            : 'Dodaj produkty za ${Formatters.formatPrice(250 - cartProvider.subtotal)}, aby otrzymać darmową dostawę!',
                        style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                ClipRRect(
                  borderRadius: BorderRadius.circular(4),
                  child: LinearProgressIndicator(
                    value: (cartProvider.subtotal / 250.0).clamp(0.0, 1.0),
                    backgroundColor: isDark ? Colors.white10 : Colors.black12,
                    valueColor: AlwaysStoppedAnimation<Color>(
                      cartProvider.subtotal >= 250 ? AppColors.success : AppColors.primary,
                    ),
                    minHeight: 5,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),

          // Items List
          ...cartProvider.items.map((item) {
            return Container(
              margin: const EdgeInsets.only(bottom: 12),
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: isDark ? AppColors.darkSurface : AppColors.lightSurface,
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: isDark ? AppColors.darkBorder : AppColors.lightBorder),
              ),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.center,
                children: [
                  // Product Image
                  ClipRRect(
                    borderRadius: BorderRadius.circular(10),
                    child: SizedBox(
                      width: 75,
                      height: 75,
                      child: CachedNetworkImage(
                        imageUrl: item.product.image,
                        fit: BoxFit.cover,
                        errorWidget: (_, __, ___) => Container(color: Colors.grey[800]),
                      ),
                    ),
                  ),
                  const SizedBox(width: 14),

                  // Info
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          item.product.name,
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                          style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 14),
                        ),
                        if (item.selectedOptions != null) ...[
                          const SizedBox(height: 2),
                          Text(
                            item.selectedOptions!,
                            style: TextStyle(
                              fontSize: 12,
                              color: isDark ? AppColors.darkTextSecondary : AppColors.lightTextSecondary,
                            ),
                          ),
                        ],
                        const SizedBox(height: 6),
                        Text(
                          Formatters.formatPrice(item.product.price),
                          style: TextStyle(
                            fontSize: 14,
                            fontWeight: FontWeight.w700,
                            color: isDark ? AppColors.primary : AppColors.lightText,
                          ),
                        ),
                      ],
                    ),
                  ),

                  // Quantity Controls
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: [
                      IconButton(
                        icon: const Icon(Icons.close_rounded, size: 18),
                        onPressed: () => cartProvider.removeFromCart(item),
                      ),
                      Container(
                        decoration: BoxDecoration(
                          border: Border.all(color: isDark ? AppColors.darkBorder : AppColors.lightBorder),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Row(
                          children: [
                            InkWell(
                              onTap: () => cartProvider.updateQuantity(item, item.quantity - 1),
                              child: const Padding(
                                padding: EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                child: Icon(Icons.remove, size: 14),
                              ),
                            ),
                            Text(
                              '${item.quantity}',
                              style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 13),
                            ),
                            InkWell(
                              onTap: () => cartProvider.updateQuantity(item, item.quantity + 1),
                              child: const Padding(
                                padding: EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                child: Icon(Icons.add, size: 14),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            );
          }),

          const SizedBox(height: 12),

          // Promo Code Input
          Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: isDark ? AppColors.darkSurface : AppColors.lightSurface,
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: isDark ? AppColors.darkBorder : AppColors.lightBorder),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Kod rabatowy',
                  style: TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.w600,
                    color: isDark ? AppColors.darkText : AppColors.lightText,
                  ),
                ),
                const SizedBox(height: 8),
                if (cartProvider.appliedPromo != null) ...[
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Row(
                        children: [
                          const Icon(Icons.discount_rounded, color: AppColors.success, size: 18),
                          const SizedBox(width: 8),
                          Text(
                            cartProvider.appliedPromo!.code,
                            style: const TextStyle(fontWeight: FontWeight.w700, color: AppColors.success),
                          ),
                          const SizedBox(width: 6),
                          Text(
                            '(-${Formatters.formatPrice(cartProvider.promoDiscountAmount)})',
                            style: const TextStyle(color: AppColors.success, fontSize: 13),
                          ),
                        ],
                      ),
                      IconButton(
                        icon: const Icon(Icons.close_rounded, size: 18),
                        onPressed: () => cartProvider.removePromoCode(),
                      ),
                    ],
                  ),
                ] else ...[
                  Row(
                    children: [
                      Expanded(
                        child: TextField(
                          controller: _promoController,
                          textCapitalization: TextCapitalization.characters,
                          decoration: InputDecoration(
                            hintText: 'Wpisz kod (np. LUNAR10)',
                            contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                            isDense: true,
                            errorText: cartProvider.promoError,
                          ),
                        ),
                      ),
                      const SizedBox(width: 10),
                      CustomButton(
                        text: 'Dodaj',
                        width: 80,
                        height: 42,
                        isLoading: cartProvider.isApplyingPromo,
                        onPressed: () {
                          if (_promoController.text.trim().isNotEmpty) {
                            cartProvider.applyPromoCode(_promoController.text.trim());
                          }
                        },
                      ),
                    ],
                  ),
                ],
              ],
            ),
          ),

          const SizedBox(height: 16),

          // Order Summary Card
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: isDark ? AppColors.darkSurface : AppColors.lightSurface,
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: isDark ? AppColors.darkBorder : AppColors.lightBorder),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Podsumowanie zamówienia',
                  style: GoogleFonts.cormorantGaramond(fontSize: 18, fontWeight: FontWeight.w700),
                ),
                const SizedBox(height: 12),
                _buildSummaryRow('Wartość produktów', Formatters.formatPrice(cartProvider.subtotal)),
                if (cartProvider.promoDiscountAmount > 0) ...[
                  const SizedBox(height: 6),
                  _buildSummaryRow(
                    'Rabat z kodu',
                    '-${Formatters.formatPrice(cartProvider.promoDiscountAmount)}',
                    color: AppColors.success,
                  ),
                ],
                const SizedBox(height: 6),
                _buildSummaryRow(
                  'Dostawa',
                  cartProvider.shippingFee == 0 ? 'Darmowa' : Formatters.formatPrice(cartProvider.shippingFee),
                  color: cartProvider.shippingFee == 0 ? AppColors.success : null,
                ),
                const Divider(height: 24),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text('Łącznie do zapłaty', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700)),
                    Text(
                      Formatters.formatPrice(cartProvider.total),
                      style: TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.w700,
                        color: isDark ? AppColors.primary : AppColors.lightText,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),

          const SizedBox(height: 24),

          // Checkout Button
          CustomButton(
            text: 'Przejdź do kasy (${Formatters.formatPrice(cartProvider.total)})',
            icon: Icons.lock_outline_rounded,
            onPressed: () {
              Navigator.of(context).push(
                MaterialPageRoute(builder: (_) => const CheckoutScreen()),
              );
            },
          ),
          const SizedBox(height: 32),
        ],
      ),
    );
  }

  Widget _buildSummaryRow(String label, String value, {Color? color}) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(label, style: const TextStyle(fontSize: 13, color: Colors.grey)),
        Text(
          value,
          style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: color),
        ),
      ],
    );
  }
}
