import 'package:flutter/material.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../core/constants/app_colors.dart';
import '../../core/utils/formatters.dart';
import '../../models/order_model.dart';

class OrderDetailScreen extends StatelessWidget {
  final OrderModel order;

  const OrderDetailScreen({super.key, required this.order});

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      appBar: AppBar(
        title: Text(
          '#${order.orderNumber}',
          style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w700),
        ),
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          // Status Timeline
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: isDark ? AppColors.darkSurface : AppColors.lightSurface,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: isDark ? AppColors.darkBorder : AppColors.lightBorder),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Status zamówienia',
                  style: GoogleFonts.cormorantGaramond(fontSize: 18, fontWeight: FontWeight.w700),
                ),
                const SizedBox(height: 16),
                _buildTimeline(order.status),
              ],
            ),
          ),

          const SizedBox(height: 16),

          // Items
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: isDark ? AppColors.darkSurface : AppColors.lightSurface,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: isDark ? AppColors.darkBorder : AppColors.lightBorder),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Zamówione produkty (${order.items.length})',
                  style: GoogleFonts.cormorantGaramond(fontSize: 18, fontWeight: FontWeight.w700),
                ),
                const SizedBox(height: 12),
                ...order.items.map((item) {
                  return Padding(
                    padding: const EdgeInsets.only(bottom: 12),
                    child: Row(
                      children: [
                        ClipRRect(
                          borderRadius: BorderRadius.circular(8),
                          child: SizedBox(
                            width: 50,
                            height: 50,
                            child: CachedNetworkImage(
                              imageUrl: item.image,
                              fit: BoxFit.cover,
                              errorWidget: (_, __, ___) => Container(color: Colors.grey[800]),
                            ),
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(item.name, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13)),
                              if (item.selectedOptions != null)
                                Text(item.selectedOptions!, style: const TextStyle(fontSize: 11, color: Colors.grey)),
                              Text('${item.quantity} × ${Formatters.formatPrice(item.price)}',
                                  style: const TextStyle(fontSize: 12, color: Colors.grey)),
                            ],
                          ),
                        ),
                        Text(
                          Formatters.formatPrice(item.price * item.quantity),
                          style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 13),
                        ),
                      ],
                    ),
                  );
                }),
              ],
            ),
          ),

          const SizedBox(height: 16),

          // Shipping Address
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: isDark ? AppColors.darkSurface : AppColors.lightSurface,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: isDark ? AppColors.darkBorder : AppColors.lightBorder),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Adres dostawy',
                  style: GoogleFonts.cormorantGaramond(fontSize: 18, fontWeight: FontWeight.w700),
                ),
                const SizedBox(height: 12),
                Text(order.customerName, style: const TextStyle(fontWeight: FontWeight.w600)),
                const SizedBox(height: 2),
                Text(order.shippingStreet),
                const SizedBox(height: 2),
                Text('${order.shippingPostalCode} ${order.shippingCity}, ${order.shippingCountry}'),
                if (order.shippingPhone != null) ...[
                  const SizedBox(height: 4),
                  Text('Tel: ${order.shippingPhone}', style: const TextStyle(color: Colors.grey)),
                ],
                const SizedBox(height: 2),
                Text('Email: ${order.customerEmail}', style: const TextStyle(color: Colors.grey)),
              ],
            ),
          ),

          const SizedBox(height: 16),

          // Financial Summary
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: isDark ? AppColors.darkSurface : AppColors.lightSurface,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: isDark ? AppColors.darkBorder : AppColors.lightBorder),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Płatność i podsumowanie',
                  style: GoogleFonts.cormorantGaramond(fontSize: 18, fontWeight: FontWeight.w700),
                ),
                const SizedBox(height: 12),
                _buildRow('Wartość produktów', Formatters.formatPrice(order.subtotal)),
                if (order.discountAmount > 0) ...[
                  const SizedBox(height: 6),
                  _buildRow('Rabat (${order.discountCode ?? ""})', '-${Formatters.formatPrice(order.discountAmount)}', color: AppColors.success),
                ],
                const SizedBox(height: 6),
                _buildRow('Dostawa', order.shippingFee == 0 ? 'Darmowa' : Formatters.formatPrice(order.shippingFee)),
                const SizedBox(height: 6),
                _buildRow('Metoda płatności', order.paymentMethod.toUpperCase()),
                const SizedBox(height: 6),
                _buildRow('Status płatności', Formatters.formatPaymentStatus(order.paymentStatus)),
                const Divider(height: 20),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text('Suma', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700)),
                    Text(
                      Formatters.formatPrice(order.total),
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

          const SizedBox(height: 32),
        ],
      ),
    );
  }

  Widget _buildTimeline(String currentStatus) {
    final statuses = ['Pending', 'Processing', 'Shipped', 'Delivered'];
    final labels = ['Przyjęte', 'W realizacji', 'Wysłane', 'Doręczone'];

    int currentIndex = statuses.indexOf(currentStatus);
    if (currentIndex == -1) currentIndex = 1;

    return Row(
      children: List.generate(statuses.length, (index) {
        final isCompleted = index <= currentIndex;
        final isLast = index == statuses.length - 1;

        return Expanded(
          child: Column(
            children: [
              Row(
                children: [
                  Expanded(
                    child: Container(
                      height: 2,
                      color: index == 0
                          ? Colors.transparent
                          : (isCompleted ? AppColors.primary : Colors.grey.withValues(alpha: 0.3)),
                    ),
                  ),
                  Container(
                    width: 24,
                    height: 24,
                    decoration: BoxDecoration(
                      color: isCompleted ? AppColors.primary : Colors.grey.withValues(alpha: 0.3),
                      shape: BoxShape.circle,
                    ),
                    child: Center(
                      child: Icon(
                        isCompleted ? Icons.check : Icons.circle,
                        size: 12,
                        color: Colors.white,
                      ),
                    ),
                  ),
                  Expanded(
                    child: Container(
                      height: 2,
                      color: isLast
                          ? Colors.transparent
                          : (index < currentIndex ? AppColors.primary : Colors.grey.withValues(alpha: 0.3)),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 6),
              Text(
                labels[index],
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontSize: 11,
                  fontWeight: isCompleted ? FontWeight.w600 : FontWeight.normal,
                  color: isCompleted ? AppColors.primary : Colors.grey,
                ),
              ),
            ],
          ),
        );
      }),
    );
  }

  Widget _buildRow(String label, String value, {Color? color}) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(label, style: const TextStyle(fontSize: 13, color: Colors.grey)),
        Text(value, style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: color)),
      ],
    );
  }
}
