import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../core/constants/app_colors.dart';
import '../../core/utils/formatters.dart';
import '../../models/product_model.dart';
import '../../models/review_model.dart';
import '../../providers/auth_provider.dart';
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
  bool _showAllReviews = false;

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
    final authUser = context.read<AuthProvider>().user;
    final nameController = TextEditingController(text: authUser?.name ?? '');
    final titleController = TextEditingController();
    final commentController = TextEditingController();
    int rating = 5;
    bool isSubmitting = false;
    String? formError;

    final ratingDescriptions = {
      5: '5 Stars — Exceptional quality & craftsmanship',
      4: '4 Stars — Very Good, exceeded expectations',
      3: '3 Stars — Average, satisfactory piece',
      2: '2 Stars — Below expectations',
      1: '1 Star — Unsatisfactory',
    };

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
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        'Write a Review',
                        style: GoogleFonts.cormorantGaramond(fontSize: 22, fontWeight: FontWeight.w700),
                      ),
                      IconButton(
                        icon: const Icon(Icons.close, size: 20),
                        onPressed: () => Navigator.pop(ctx),
                      ),
                    ],
                  ),
                  if (formError != null) ...[
                    const SizedBox(height: 8),
                    Container(
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: Colors.red.withValues(alpha: 0.1),
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(color: Colors.red.withValues(alpha: 0.3)),
                      ),
                      child: Text(
                        formError!,
                        style: const TextStyle(color: Colors.red, fontSize: 12),
                      ),
                    ),
                  ],
                  const SizedBox(height: 12),
                  Row(
                    children: List.generate(5, (index) {
                      return IconButton(
                        icon: Icon(
                          index < rating ? Icons.star_rounded : Icons.star_outline_rounded,
                          color: AppColors.accent,
                          size: 32,
                        ),
                        onPressed: isSubmitting ? null : () => setModalState(() => rating = index + 1),
                      );
                    }),
                  ),
                  Text(
                    ratingDescriptions[rating] ?? '',
                    style: const TextStyle(fontSize: 11, color: AppColors.accent, fontWeight: FontWeight.w500),
                  ),
                  const SizedBox(height: 12),
                  TextField(
                    controller: nameController,
                    enabled: !isSubmitting,
                    decoration: const InputDecoration(
                      labelText: 'Your Name *',
                      hintText: 'e.g. Charlotte Vance',
                    ),
                  ),
                  const SizedBox(height: 12),
                  TextField(
                    controller: titleController,
                    enabled: !isSubmitting,
                    decoration: const InputDecoration(
                      labelText: 'Review Headline (Optional)',
                      hintText: 'e.g. Exquisite quality',
                    ),
                  ),
                  const SizedBox(height: 12),
                  TextField(
                    controller: commentController,
                    enabled: !isSubmitting,
                    maxLines: 3,
                    decoration: const InputDecoration(
                      labelText: 'Your Review Comments *',
                      hintText: 'Describe quality, scent, shine, or unboxing...',
                    ),
                  ),
                  const SizedBox(height: 20),
                  CustomButton(
                    text: isSubmitting ? 'Submitting...' : 'Submit Review',
                    isLoading: isSubmitting,
                    onPressed: isSubmitting
                        ? null
                        : () async {
                            final name = nameController.text.trim();
                            final comment = commentController.text.trim();
                            final title = titleController.text.trim();

                            if (name.isEmpty) {
                              setModalState(() => formError = 'Please enter your name.');
                              return;
                            }
                            if (comment.isEmpty) {
                              setModalState(() => formError = 'Please enter your review comments.');
                              return;
                            }

                            setModalState(() {
                              isSubmitting = true;
                              formError = null;
                            });

                            final prodProvider = context.read<ProductProvider>();
                            final messenger = ScaffoldMessenger.of(context);

                            final success = await prodProvider.addReview(
                              productId: widget.product.id,
                              authorName: name,
                              rating: rating,
                              comment: comment,
                              title: title.isNotEmpty ? title : null,
                            );

                            if (ctx.mounted) {
                              Navigator.pop(ctx);
                            }

                            if (success) {
                              await _loadReviews();
                              if (mounted) {
                                messenger.showSnackBar(
                                  const SnackBar(
                                    content: Text('Thank you! Your review has been published under this piece.'),
                                    backgroundColor: Colors.black87,
                                    behavior: SnackBarBehavior.floating,
                                  ),
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
                      if (product.isSoldOut)
                        const BadgePill(text: 'SOLD OUT')
                      else if (product.badge != null && product.badge!.isNotEmpty)
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

                  // Rating snippet
                  Row(
                    children: [
                      RatingStars(rating: product.rating, reviewCount: product.reviewCount, size: 14),
                      const SizedBox(width: 8),
                      Text(
                        '${product.rating.toStringAsFixed(1)} (${product.reviewCount} reviews)',
                        style: TextStyle(
                          fontSize: 12,
                          color: isDark ? AppColors.darkTextSecondary : AppColors.lightTextSecondary,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 14),

                  // Price
                  Row(
                    children: [
                      Text(
                        Formatters.formatPrice(product.price),
                        style: TextStyle(
                          fontSize: 22,
                          fontWeight: FontWeight.w800,
                          color: isDark ? AppColors.primary : AppColors.lightText,
                        ),
                      ),
                      if (product.hasDiscount) ...[
                        const SizedBox(width: 10),
                        Text(
                          Formatters.formatPrice(product.originalPrice),
                          style: TextStyle(
                            fontSize: 15,
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
                  const SizedBox(height: 16),

                  // Stock Status
                  Row(
                    children: [
                      Icon(
                        !product.isSoldOut ? Icons.check_circle_outline : Icons.highlight_off,
                        size: 16,
                        color: !product.isSoldOut ? AppColors.success : AppColors.error,
                      ),
                      const SizedBox(width: 6),
                      Text(
                        !product.isSoldOut ? 'In stock (${product.stock} available)' : 'Sold Out',
                        style: TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.w500,
                          color: !product.isSoldOut ? AppColors.success : AppColors.error,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 20),

                  // Quantity Selector row
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        'Quantity',
                        style: TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w600,
                          color: isDark ? AppColors.darkText : AppColors.lightText,
                        ),
                      ),
                      Container(
                        decoration: BoxDecoration(
                          color: isDark ? AppColors.darkSurface : AppColors.lightSurface,
                          border: Border.all(color: isDark ? AppColors.darkBorder : AppColors.lightBorder),
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: Row(
                          children: [
                            IconButton(
                              icon: const Icon(Icons.remove, size: 16),
                              onPressed: (!product.isSoldOut && _quantity > 1) ? () => setState(() => _quantity--) : null,
                            ),
                            Padding(
                              padding: const EdgeInsets.symmetric(horizontal: 8),
                              child: Text('$_quantity', style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 16)),
                            ),
                            IconButton(
                              icon: const Icon(Icons.add, size: 16),
                              onPressed: (!product.isSoldOut && (product.stock <= 0 || _quantity < product.stock))
                                  ? () => setState(() => _quantity++)
                                  : null,
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),

                  // Full-width Add to Bag Button
                  CustomButton(
                    width: double.infinity,
                    height: 52,
                    text: !product.isSoldOut
                        ? 'Add to Bag • ${Formatters.formatPrice(product.price * _quantity)}'
                        : 'Sold Out',
                    icon: Icons.shopping_bag_outlined,
                    onPressed: !product.isSoldOut
                        ? () {
                            context.read<CartProvider>().addToCart(
                                  product,
                                  quantity: _quantity,
                                  selectedOptions: _selectedOption,
                                );
                            ScaffoldMessenger.of(context).showSnackBar(
                              SnackBar(
                                content: Text('Added $_quantity item(s) to bag'),
                                duration: const Duration(seconds: 2),
                                behavior: SnackBarBehavior.floating,
                              ),
                            );
                          }
                        : null,
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
                      TextButton.icon(
                        onPressed: _showAddReviewModal,
                        icon: const Icon(Icons.rate_review_outlined, size: 16, color: AppColors.primary),
                        label: const Text('+ Write a Review', style: TextStyle(color: AppColors.primary, fontWeight: FontWeight.w600)),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  if (_isLoadingReviews)
                    const Padding(
                      padding: EdgeInsets.symmetric(vertical: 24),
                      child: Center(child: CircularProgressIndicator(color: AppColors.primary)),
                    )
                  else if (_reviews.isEmpty)
                    Container(
                      width: double.infinity,
                      padding: const EdgeInsets.all(20),
                      decoration: BoxDecoration(
                        color: isDark ? AppColors.darkSurface : AppColors.lightSurface,
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: isDark ? AppColors.darkBorder : AppColors.lightBorder),
                      ),
                      child: Column(
                        children: [
                          const Icon(Icons.star_outline_rounded, size: 36, color: AppColors.accent),
                          const SizedBox(height: 8),
                          Text(
                            'No reviews yet',
                            style: GoogleFonts.cormorantGaramond(fontSize: 16, fontWeight: FontWeight.w700),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            'Be the first to share your thoughts on this exquisite piece!',
                            textAlign: TextAlign.center,
                            style: TextStyle(
                              fontSize: 12,
                              color: isDark ? AppColors.darkTextSecondary : AppColors.lightTextSecondary,
                            ),
                          ),
                          const SizedBox(height: 12),
                          OutlinedButton(
                            onPressed: _showAddReviewModal,
                            style: OutlinedButton.styleFrom(
                              side: const BorderSide(color: AppColors.primary),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                            ),
                            child: const Text('Write First Review', style: TextStyle(color: AppColors.primary, fontSize: 12)),
                          ),
                        ],
                      ),
                    )
                  else ...[
                    ...(_showAllReviews ? _reviews : _reviews.take(3)).map((r) {
                      final initials = r.authorName.trim().isNotEmpty
                          ? r.authorName.trim().split(' ').map((e) => e.isNotEmpty ? e[0] : '').take(2).join().toUpperCase()
                          : 'U';
                      final dateStr = r.createdAt != null
                          ? '${r.createdAt!.day.toString().padLeft(2, '0')}.${r.createdAt!.month.toString().padLeft(2, '0')}.${r.createdAt!.year}'
                          : '';

                      return Container(
                        margin: const EdgeInsets.only(bottom: 12),
                        padding: const EdgeInsets.all(14),
                        decoration: BoxDecoration(
                          color: isDark ? AppColors.darkSurface : AppColors.lightSurface,
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: isDark ? AppColors.darkBorder : AppColors.lightBorder),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              crossAxisAlignment: CrossAxisAlignment.center,
                              children: [
                                CircleAvatar(
                                  radius: 16,
                                  backgroundColor: AppColors.primary.withValues(alpha: 0.15),
                                  child: Text(
                                    initials,
                                    style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: AppColors.primary),
                                  ),
                                ),
                                const SizedBox(width: 10),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Row(
                                        children: [
                                          Flexible(
                                            child: Text(
                                              r.authorName,
                                              style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13),
                                              overflow: TextOverflow.ellipsis,
                                            ),
                                          ),
                                          if (r.verified) ...[
                                            const SizedBox(width: 6),
                                            Container(
                                              padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 1.5),
                                              decoration: BoxDecoration(
                                                color: Colors.green.withValues(alpha: 0.1),
                                                borderRadius: BorderRadius.circular(4),
                                                border: Border.all(color: Colors.green.withValues(alpha: 0.3)),
                                              ),
                                              child: const Row(
                                                mainAxisSize: MainAxisSize.min,
                                                children: [
                                                  Icon(Icons.verified, size: 10, color: Colors.green),
                                                  SizedBox(width: 3),
                                                  Text('Verified', style: TextStyle(fontSize: 9, color: Colors.green, fontWeight: FontWeight.w600)),
                                                ],
                                              ),
                                            ),
                                          ],
                                        ],
                                      ),
                                      if (dateStr.isNotEmpty)
                                        Text(
                                          dateStr,
                                          style: TextStyle(
                                            fontSize: 10,
                                            color: isDark ? AppColors.darkTextSecondary : AppColors.lightTextSecondary,
                                          ),
                                        ),
                                    ],
                                  ),
                                ),
                                RatingStars(rating: r.rating.toDouble(), size: 12),
                              ],
                            ),
                            if (r.title != null && r.title!.trim().isNotEmpty) ...[
                              const SizedBox(height: 8),
                              Text(
                                r.title!,
                                style: GoogleFonts.cormorantGaramond(fontSize: 15, fontWeight: FontWeight.w700),
                              ),
                            ],
                            const SizedBox(height: 6),
                            Text(
                              r.comment,
                              style: TextStyle(
                                fontSize: 13,
                                height: 1.4,
                                color: isDark ? AppColors.darkText : AppColors.lightText,
                              ),
                            ),
                          ],
                        ),
                      );
                    }),
                    if (_reviews.length > 3) ...[
                      const SizedBox(height: 4),
                      Center(
                        child: TextButton(
                          onPressed: () => setState(() => _showAllReviews = !_showAllReviews),
                          child: Text(
                            _showAllReviews
                                ? 'Show Fewer Reviews'
                                : 'Show All ${_reviews.length} Reviews',
                            style: const TextStyle(color: AppColors.primary, fontWeight: FontWeight.w600),
                          ),
                        ),
                      ),
                    ],
                  ],

                  const SizedBox(height: 30),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  int get quantity => _quantity;
}
