import 'package:flutter/material.dart';
import '../core/constants/app_colors.dart';

class RatingStars extends StatelessWidget {
  final double rating;
  final int? reviewCount;
  final double size;

  const RatingStars({
    super.key,
    required this.rating,
    this.reviewCount,
    this.size = 14,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        ...List.generate(5, (index) {
          if (index < rating.floor()) {
            return Icon(Icons.star_rounded, size: size, color: AppColors.accent);
          } else if (index < rating) {
            return Icon(Icons.star_half_rounded, size: size, color: AppColors.accent);
          } else {
            return Icon(Icons.star_outline_rounded, size: size, color: AppColors.accent.withValues(alpha: 0.4));
          }
        }),
        if (reviewCount != null) ...[
          const SizedBox(width: 4),
          Text(
            '($reviewCount)',
            style: TextStyle(
              fontSize: size * 0.85,
              color: Theme.of(context).brightness == Brightness.dark
                  ? AppColors.darkTextSecondary
                  : AppColors.lightTextSecondary,
            ),
          ),
        ],
      ],
    );
  }
}
