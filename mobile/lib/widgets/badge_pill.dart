import 'package:flutter/material.dart';
import '../core/constants/app_colors.dart';

class BadgePill extends StatelessWidget {
  final String text;
  final Color? backgroundColor;
  final Color? textColor;

  const BadgePill({
    super.key,
    required this.text,
    this.backgroundColor,
    this.textColor,
  });

  @override
  Widget build(BuildContext context) {
    Color bg = AppColors.primary;
    Color fg = Colors.white;

    final upper = text.toUpperCase();
    if (upper == 'NEW') {
      bg = const Color(0xFF1A1A1A);
      fg = Colors.white;
    } else if (upper == 'SALE' || upper.contains('%')) {
      bg = AppColors.badgeSale;
      fg = Colors.white;
    } else if (upper == 'BESTSELLER') {
      bg = AppColors.primaryDark;
      fg = Colors.white;
    } else if (upper == 'BRIDAL') {
      bg = const Color(0xFF7D6B8E);
      fg = Colors.white;
    } else if (upper == 'SOLD OUT') {
      bg = const Color(0xFF757575);
      fg = Colors.white;
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(
        color: backgroundColor ?? bg,
        borderRadius: BorderRadius.circular(4),
      ),
      child: Text(
        text.toUpperCase(),
        style: TextStyle(
          color: textColor ?? fg,
          fontSize: 10,
          fontWeight: FontWeight.w700,
          letterSpacing: 0.8,
        ),
      ),
    );
  }
}
