import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../core/constants/app_colors.dart';
import '../../core/utils/formatters.dart';
import '../../models/product_model.dart';
import '../../models/review_model.dart';
import '../../providers/cart_provider.dart';
import '../../providers/product_provider.dart';
import '../../providers/wishlist_provider.dart';
import '../../widgets/badge_pill.dart';
import '../../widgets/custom_button.dart';
import '../../widgets/rating_stars.dart';

class ProductDetailScreen extends StatefulWidget {
  final Product product;

  const ProductDetailScreen({super.key, required this.product});

  @override
  State<ProductDetailScreen> createState() => _ProductDetailScreenState();
}

class _ProductDetailScreenState extends State<ProductDetailScreen> {
  int _selectedImageIndex = 0;
  int _quantity = 1;
  final String? _selectedOption = null;
  List<Review> _reviews = [];
  bool _isLoadingReviews = true;

  @override
  void initState() {
    super.initState();
    _loadReviews();
  }

  Future<void> _loadReviews() async {
    final reviews = await context.read<ProductProvider>().getProductReviews(widget.product.id);
    if (mounted) {
      setState(() {
        _reviews = reviews;
        _isLoadingReviews = false;
      });
    }
  }

  void _showAddReviewModal() {
    final nameController = TextEditingController();
    final commentController = TextEditingController();
    int rating = 5;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Theme.of(context).cardTheme.color,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (ctx) {
        return StatefulBuilder(
          builder: (context, setModalState) {
            return Padding(
              padding: EdgeInsets.only(
                bottom: MediaQuery.of(context).viewInsets.bottom + 20,
                left: 20,
                right: 20,
                top: 20,
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Write a Review',
                    style: GoogleFonts.cormorantGaramond(fontSize: 22, fontWeight: FontWeight.w700),
                  ),
                  const SizedBox(height: 12),
                  Row(
                    children: List.generate(5, (index) {
                      return IconButton(
                        icon: Icon(
                          index < rating ? Icons.star_rounded : Icons.star_outline_rounded,
                          color: AppColors.accent,
                          size: 32,
                        ),
                        onPressed: () => setModalState(() => rating = index + 1),
                      );
                    }),
                  ),
                  const SizedBox(height: 12),
                  TextField(
                    controller: nameController,
                    decoration: const InputDecoration(labelText: 'Your Name'),
                  ),
                  const SizedBox(height: 12),
                  TextField(
                    controller: commentController,
                    maxLines: 3,
                    decoration: const InputDecoration(labelText: 'Review Comments'),
                  ),
                  const SizedBox(height: 20),
                  CustomButton(
                    text: 'Submit Review',
                    onPressed: () async {
                      if (nameController.text.trim().isEmpty || commentController.text.trim().isEmpty) return;
                      final prodProvider = context.read<ProductProvider>();
                      final messenger = ScaffoldMessenger.of(context);
                      Navigator.pop(ctx);
                      final success = await prodProvider.addReview(
                        productId: widget.product.id,
                        authorName: nameController.text.trim(),
                        rating: rating,
                        comment: commentController.text.trim(),
                      );
                      if (success) {
                        _loadReviews();
                        if (mounted) {
                          messenger.showSnackBar(
                            const SnackBar(content: Text('Thank you for your review!')),
                          );
                        }
                      }
                    },
                  ),
                ],
              ),
            );
          },
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final product = widget.product;
    final wishlistProvider = context.watch<WishlistProvider>();
    final isFav = wishlistProvider.isFavorite(product.id);

    final allImages = product.images.isNotEmpty
        ? product.images
        : (product.image.isNotEmpty ? [product.image] : <String>[]);

    return Scaffold(
      appBar: AppBar(
        title: Text(
          product.name,
          style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
          maxLines: 1,
          overflow: TextOverflow.ellipsis,
        ),
        actions: [
          IconButton(
            icon: Icon(
              isFav ? Icons.favorite_rounded : Icons.favorite_border_rounded,
              color: isFav ? AppColors.badgeSale : null,
            ),
            onPressed: () => wishlistProvider.toggleFavorite(product),
          ),
          const SizedBox(width: 8),
        ],
      ),
      body: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Gallery
            if (allImages.isNotEmpty) ...[
              SizedBox(
                height: 340,
                child: PageView.builder(
                  itemCount: allImages.length,
                  onPageChanged: (idx) => setState(() => _selectedImageIndex = idx),
                  itemBuilder: (context, idx) {
                    return CachedNetworkImage(
                      imageUrl: allImages[idx],
                      fit: BoxFit.cover,
                      placeholder: (context, url) => Container(color: Colors.grey[800]),
                      errorWidget: (context, url, error) => const Icon(Icons.broken_image, size: 60),
                    );
                  },
                ),
              ),
              if (allImages.length > 1) ...[
                const SizedBox(height: 10),
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: List.generate(
                    allImages.length,
                    (idx) => Container(
                      width: _selectedImageIndex == idx ? 18 : 6,
                      height: 6,
                      margin: const EdgeInsets.symmetric(horizontal: 3),
                      decoration: BoxDecoration(
                        color: _selectedImageIndex == idx ? AppColors.primary : Colors.grey.withValues(alpha: 0.4),
                        borderRadius: BorderRadius.circular(3),
                      ),
                    ),
                  ),
                ),
              ],
            ],

            // Content
            Padding(
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Category & Badge
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        (product.categoryName ?? product.categorySlug).toUpperCase(),
                        style: TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.w700,
                          letterSpacing: 1.2,
                          color: isDark ? AppColors.primary : AppColors.primaryDark,
                        ),
                      ),
                      if (product.badge != null && product.badge!.isNotEmpty)
                        BadgePill(text: product.badge!),
                    ],
                  ),
                  const SizedBox(height: 8),

                  // Title
                  Text(
                    product.name,
                    style: GoogleFonts.cormorantGaramond(
                      fontSize: 26,
                      fontWeight: FontWeight.w700,
                      color: isDark ? AppColors.darkText : AppColors.lightText,
                    ),
                  ),
                  const SizedBox(height: 10),

                  // Rating & Reviews count
                  Row(
                    children: [
                      RatingStars(rating: product.rating, size: 16),
                      const SizedBox(width: 8),
                      Text(
                        '${product.rating.toStringAsFixed(1)} (${product.reviewCount} reviews)',
                        style: TextStyle(
                          fontSize: 13,
                          color: isDark ? AppColors.darkTextSecondary : AppColors.lightTextSecondary,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),

                  // Price block
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.baseline,
                    textBaseline: TextBaseline.alphabetic,
                    children: [
                      Text(
                        Formatters.formatPrice(product.price),
                        style: TextStyle(
                          fontSize: 24,
                          fontWeight: FontWeight.w700,
                          color: isDark ? AppColors.primary : AppColors.lightText,
                        ),
                      ),
                      if (product.hasDiscount) ...[
                        const SizedBox(width: 10),
                        Text(
                          Formatters.formatPrice(product.originalPrice),
                          style: TextStyle(
                            fontSize: 16,
                            decoration: TextDecoration.lineThrough,
                            color: isDark ? AppColors.darkTextSecondary : AppColors.lightTextSecondary,
                          ),
                        ),
                        const SizedBox(width: 8),
                        BadgePill(
                          text: '-${product.discountPercent.toInt()}%',
                          backgroundColor: AppColors.badgeSale,
                        ),
                      ],
                    ],
                  ),
                  const SizedBox(height: 12),

                  // Stock Status
                  Row(
                    children: [
                      Icon(
                        product.stock > 0 ? Icons.check_circle_outline : Icons.highlight_off,
                        size: 16,
                        color: product.stock > 0 ? AppColors.success : AppColors.error,
                      ),
                      const SizedBox(width: 6),
                      Text(
                        product.stock > 0 ? 'In stock (${product.stock} available)' : 'Sold Out',
                        style: TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.w500,
                          color: product.stock > 0 ? AppColors.success : AppColors.error,
                        ),
                      ),
                    ],
                  ),
                  const Divider(height: 32),

                  // Description
                  Text(
                    'Product Description',
                    style: GoogleFonts.cormorantGaramond(fontSize: 18, fontWeight: FontWeight.w700),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    product.description.isNotEmpty ? product.description : 'No detailed description available.',
                    style: TextStyle(
                      fontSize: 14,
                      height: 1.5,
                      color: isDark ? AppColors.darkTextSecondary : AppColors.lightTextSecondary,
                    ),
                  ),

                  // Features list
                  if (product.features.isNotEmpty) ...[
                    const SizedBox(height: 16),
                    Text(
                      'Highlights & Details',
                      style: GoogleFonts.cormorantGaramond(fontSize: 18, fontWeight: FontWeight.w700),
                    ),
                    const SizedBox(height: 8),
                    ...product.features.map(
                      (f) => Padding(
                        padding: const EdgeInsets.only(bottom: 6),
                        child: Row(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Icon(Icons.circle, size: 6, color: AppColors.primary),
                            const SizedBox(width: 8),
                            Expanded(
                              child: Text(
                                f,
                                style: TextStyle(
                                  fontSize: 13,
                                  color: isDark ? AppColors.darkTextSecondary : AppColors.lightTextSecondary,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ],

                  const Divider(height: 32),

                  // Reviews section
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        'Customer Reviews (${_reviews.length})',
                        style: GoogleFonts.cormorantGaramond(fontSize: 18, fontWeight: FontWeight.w700),
                      ),
                      TextButton(
                        onPressed: _showAddReviewModal,
                        child: const Text('+ Write a Review', style: TextStyle(color: AppColors.primary)),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  if (_isLoadingReviews)
                    const Center(child: CircularProgressIndicator(color: AppColors.primary))
                  else if (_reviews.isEmpty)
                    Text(
                      'No reviews yet. Be the first to share your thoughts on this piece!',
                      style: TextStyle(
                        fontSize: 13,
                        color: isDark ? AppColors.darkTextSecondary : AppColors.lightTextSecondary,
                      ),
                    )
                  else
                    ..._reviews.take(3).map(
                      (r) => Container(
                        margin: const EdgeInsets.only(bottom: 12),
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: isDark ? AppColors.darkSurface : AppColors.lightSurface,
                          borderRadius: BorderRadius.circular(10),
                          border: Border.all(color: isDark ? AppColors.darkBorder : AppColors.lightBorder),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Text(r.authorName, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13)),
                                RatingStars(rating: r.rating.toDouble(), size: 12),
                              ],
                            ),
                            const SizedBox(height: 4),
                            Text(
                              r.comment,
                              style: TextStyle(
                                fontSize: 13,
                                color: isDark ? AppColors.darkTextSecondary : AppColors.lightTextSecondary,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),

                  const SizedBox(height: 100), // Space for sticky bottom bar
                ],
              ),
            ),
          ],
        ),
      ),

      // Sticky Bottom Bar: Quantity & Add to Cart
      bottomSheet: Container(
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
        decoration: BoxDecoration(
          color: isDark ? AppColors.darkSurface : AppColors.lightSurface,
          border: Border(
            top: BorderSide(
              color: isDark ? AppColors.darkBorder : AppColors.lightBorder,
            ),
          ),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.05),
              blurRadius: 10,
              offset: const Offset(0, -4),
            ),
          ],
        ),
        child: SafeArea(
          child: Row(
            children: [
              // Quantity selector
              Container(
                decoration: BoxDecoration(
                  border: Border.all(color: isDark ? AppColors.darkBorder : AppColors.lightBorder),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Row(
                  children: [
                    IconButton(
                      icon: const Icon(Icons.remove, size: 16),
                      onPressed: _quantity > 1 ? () => setState(() => _quantity--) : null,
                    ),
                    Text('$_quantity', style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 15)),
                    IconButton(
                      icon: const Icon(Icons.add, size: 16),
                      onPressed: () => setState(() => _quantity++),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 12),

              // Add to Cart Button
              Expanded(
                child: CustomButton(
                  text: 'Add to Bag • ${Formatters.formatPrice(product.price * _quantity)}',
                  icon: Icons.shopping_bag_outlined,
                  onPressed: product.stock > 0
                      ? () {
                          context.read<CartProvider>().addToCart(
                                product,
                                quantity: _quantity,
                                selectedOptions: _selectedOption,
                              );
                          ScaffoldMessenger.of(context).showSnackBar(
                            SnackBar(
                              content: Text('Added $quantity item(s) to bag'),
                              duration: const Duration(seconds: 2),
                              behavior: SnackBarBehavior.floating,
                            ),
                          );
                        }
                      : null,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  int get quantity => _quantity;
}
