import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../core/constants/app_colors.dart';
import '../../core/utils/formatters.dart';
import '../../models/order_model.dart';
import '../../widgets/custom_button.dart';
import '../main_nav_screen.dart';
import '../orders/order_detail_screen.dart';

class OrderSuccessScreen extends StatelessWidget {
  final OrderModel order;

  const OrderSuccessScreen({super.key, required this.order});

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Spacer(),

              // Success Icon Circle
              Container(
                width: 90,
                height: 90,
                decoration: BoxDecoration(
                  color: AppColors.success.withValues(alpha: 0.15),
                  shape: BoxShape.circle,
                ),
                child: const Center(
                  child: Icon(
                    Icons.check_circle_rounded,
                    size: 60,
                    color: AppColors.success,
                  ),
                ),
              ),
              const SizedBox(height: 24),

              Text(
                'Thank You for Your Order!',
                textAlign: TextAlign.center,
                style: GoogleFonts.cormorantGaramond(
                  fontSize: 28,
                  fontWeight: FontWeight.w700,
                  color: isDark ? AppColors.darkText : AppColors.lightText,
                ),
              ),
              const SizedBox(height: 8),

              Text(
                'Your order has been confirmed. A receipt and tracking details have been sent to:\n${order.customerEmail}',
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontSize: 14,
                  height: 1.4,
                  color: isDark ? AppColors.darkTextSecondary : AppColors.lightTextSecondary,
                ),
              ),
              const SizedBox(height: 24),

              // Order Details Card
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: isDark ? AppColors.darkSurface : AppColors.lightSurface,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: isDark ? AppColors.darkBorder : AppColors.lightBorder),
                ),
                child: Column(
                  children: [
                    _buildRow('Order Reference', '#${order.orderNumber}', isBold: true),
                    const Divider(height: 16),
                    _buildRow('Total Amount', Formatters.formatPrice(order.total), isBold: true, color: AppColors.primary),
                    const Divider(height: 16),
                    _buildRow('Payment Method', order.paymentMethod.toUpperCase()),
                    const Divider(height: 16),
                    _buildRow('Order Status', Formatters.formatOrderStatus(order.status), color: AppColors.success),
                  ],
                ),
              ),

              const Spacer(),

              // Action Buttons
              CustomButton(
                text: 'View Order Details',
                icon: Icons.receipt_long_outlined,
                onPressed: () {
                  Navigator.of(context).push(
                    MaterialPageRoute(builder: (_) => OrderDetailScreen(order: order)),
                  );
                },
              ),
              const SizedBox(height: 12),
              CustomButton(
                text: 'Back to Store',
                isOutlined: true,
                onPressed: () {
                  Navigator.of(context).pushAndRemoveUntil(
                    MaterialPageRoute(builder: (_) => const MainNavScreen(initialIndex: 0)),
                    (route) => false,
                  );
                },
              ),
              const SizedBox(height: 16),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildRow(String label, String value, {bool isBold = false, Color? color}) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(label, style: const TextStyle(fontSize: 13, color: Colors.grey)),
        Text(
          value,
          style: TextStyle(
            fontSize: 13,
            fontWeight: isBold ? FontWeight.w700 : FontWeight.w500,
            color: color,
          ),
        ),
      ],
    );
  }
}
