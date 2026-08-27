import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../core/constants/app_colors.dart';
import '../../models/product_model.dart';
import '../../providers/notification_provider.dart';
import '../../providers/product_provider.dart';
import '../../providers/theme_provider.dart';
import '../../widgets/banner_carousel.dart';
import '../../widgets/product_card.dart';
import '../notifications/notifications_screen.dart';
import '../product/product_detail_screen.dart';
import '../shop/shop_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  final TextEditingController _searchController = TextEditingController();

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  void _handleSearch(BuildContext context, String query) {
    final trimmed = query.trim();
    if (trimmed.isEmpty) {
      Navigator.of(context).push(
        MaterialPageRoute(builder: (_) => const ShopScreen()),
      );
    } else {
      context.read<ProductProvider>().setSearchQuery(trimmed);
      Navigator.of(context).push(
        MaterialPageRoute(
          builder: (_) => ShopScreen(initialSearch: trimmed),
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final productProvider = context.watch<ProductProvider>();

    final sampleBanners = [
      BannerItem(
        title: 'Spring / Summer Collection',
        subtitle: 'Discover minimalist gold & silver jewelry',
        imageUrl: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&q=80&w=1200',
        badge: 'NEW',
        onTap: () {
          Navigator.of(context).push(
            MaterialPageRoute(
              builder: (_) => const ShopScreen(initialBadge: 'NEW'),
            ),
          );
        },
      ),
      BannerItem(
        title: 'Bridal Collection',
        subtitle: 'Distinctive accents for your memorable moments',
        imageUrl: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&q=80&w=1200',
        badge: 'BRIDAL',
        onTap: () {
          Navigator.of(context).push(
            MaterialPageRoute(
              builder: (_) => const ShopScreen(initialCategory: 'bridal'),
            ),
          );
        },
      ),
      BannerItem(
        title: 'Lunar Bestsellers',
        subtitle: 'Most cherished designs chosen by our patrons',
        imageUrl: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=1200',
        badge: 'BESTSELLER',
        onTap: () {
          Navigator.of(context).push(
            MaterialPageRoute(
              builder: (_) => const ShopScreen(initialBadge: 'BESTSELLER'),
            ),
          );
        },
      ),
    ];

    // Collect all available products for the leftward sliding showcase
    final List<Product> allProducts = () {
      if (productProvider.products.isNotEmpty) {
        return productProvider.products;
      }
      final combined = <Product>[
        ...productProvider.featuredProducts,
        ...productProvider.bestsellers,
        ...productProvider.newArrivals,
      ];
      final seen = <String>{};
      return combined.where((p) => seen.add(p.id)).toList();
    }();

    final List<BannerItem> allProductBanners = allProducts.isNotEmpty
        ? allProducts.map((product) {
            final categoryDisplay = product.categoryName?.isNotEmpty == true
                ? product.categoryName!
                : (product.categorySlug.isNotEmpty
                    ? product.categorySlug.replaceAll('-', ' ')
                    : 'Luxury Piece');

            final subtitleText = product.price > 0
                ? '$categoryDisplay • \$${product.price.toStringAsFixed(2)}'
                : (product.description.isNotEmpty
                    ? (product.description.length > 50
                        ? '${product.description.substring(0, 47)}...'
                        : product.description)
                    : categoryDisplay);

            return BannerItem(
              title: product.name,
              subtitle: subtitleText,
              imageUrl: product.image,
              badge: product.badge?.isNotEmpty == true ? product.badge : 'LUNAR',
              onTap: () {
                Navigator.of(context).push(
                  MaterialPageRoute(
                    builder: (_) => ProductDetailScreen(product: product),
                  ),
                );
              },
            );
          }).toList()
        : sampleBanners;

    return Scaffold(
      appBar: AppBar(
        title: Text(
          'L U N A R',
          style: GoogleFonts.cormorantGaramond(
            fontSize: 24,
            fontWeight: FontWeight.w700,
            letterSpacing: 4.0,
            color: isDark ? AppColors.primary : AppColors.lightText,
          ),
        ),
        actions: [
          IconButton(
            icon: Icon(isDark ? Icons.light_mode_outlined : Icons.dark_mode_outlined),
            tooltip: 'Toggle Theme',
            onPressed: () => context.read<ThemeProvider>().toggleTheme(),
          ),
          IconButton(
            icon: const Icon(Icons.search_rounded),
            tooltip: 'Search',
            onPressed: () {
              Navigator.of(context).push(
                MaterialPageRoute(builder: (_) => const ShopScreen()),
              );
            },
          ),
          Consumer<NotificationProvider>(
            builder: (context, notifProvider, _) {
              final unread = notifProvider.unreadCount;
              return IconButton(
                icon: Badge(
                  isLabelVisible: unread > 0,
                  label: Text(unread > 9 ? '9+' : '$unread'),
                  backgroundColor: AppColors.accent,
                  textColor: Colors.black,
                  textStyle: const TextStyle(fontSize: 10, fontWeight: FontWeight.w700),
                  child: const Icon(Icons.notifications_outlined),
                ),
                tooltip: 'Notifications',
                onPressed: () {
                  Navigator.of(context).push(
                    MaterialPageRoute(builder: (_) => const NotificationsScreen()),
                  );
                },
              );
            },
          ),
          const SizedBox(width: 4),
        ],
      ),
      body: RefreshIndicator(
        color: AppColors.primary,
        onRefresh: () => productProvider.loadInitialData(),
        child: ListView(
          padding: const EdgeInsets.symmetric(vertical: 8),
          children: [
            // Banners Carousel (Powiększone, automatycznie przesuwające się w lewo ze wszystkimi produktami)
            BannerCarousel(banners: allProductBanners),
            const SizedBox(height: 20),

            // Loyalty Promotion Banner
            Container(
              margin: const EdgeInsets.symmetric(horizontal: 16),
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: isDark
                      ? [const Color(0xFF2A241E), const Color(0xFF1E1E1E)]
                      : [const Color(0xFFFAF2E9), const Color(0xFFF3E7D8)],
                ),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(
                  color: isDark ? AppColors.darkBorder : AppColors.primary.withValues(alpha: 0.4),
                ),
              ),
              child: Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: AppColors.primary.withValues(alpha: 0.2),
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(Icons.card_giftcard_rounded, color: AppColors.primary, size: 28),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'LUNAR Club',
                          style: GoogleFonts.cormorantGaramond(
                            fontSize: 18,
                            fontWeight: FontWeight.w700,
                            color: isDark ? AppColors.primary : AppColors.lightText,
                          ),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          'Earn rewards on every purchase and redeem for exclusive vouchers.',
                          style: TextStyle(
                            fontSize: 12,
                            color: isDark ? AppColors.darkTextSecondary : AppColors.lightTextSecondary,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 18),

            // Search Bar (w miejsce usuniętego CATEGORIES)
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Container(
                decoration: BoxDecoration(
                  color: isDark ? AppColors.darkSurfaceElevated : AppColors.lightSurface,
                  borderRadius: BorderRadius.circular(28),
                  border: Border.all(
                    color: isDark
                        ? AppColors.darkBorder
                        : AppColors.primary.withValues(alpha: 0.35),
                    width: 1.2,
                  ),
                  boxShadow: [
                    BoxShadow(
                      color: isDark
                          ? Colors.black.withValues(alpha: 0.35)
                          : AppColors.primary.withValues(alpha: 0.1),
                      blurRadius: 10,
                      offset: const Offset(0, 3),
                    ),
                  ],
                ),
                child: TextField(
                  controller: _searchController,
                  textInputAction: TextInputAction.search,
                  onSubmitted: (query) => _handleSearch(context, query),
                  style: TextStyle(
                    fontSize: 14,
                    color: isDark ? AppColors.darkText : AppColors.lightText,
                  ),
                  decoration: InputDecoration(
                    hintText: 'Search jewelry, rings, necklaces, perfumes...',
                    hintStyle: TextStyle(
                      fontSize: 13.5,
                      color: isDark ? AppColors.darkTextSecondary : AppColors.lightTextSecondary,
                    ),
                    prefixIcon: const Icon(
                      Icons.search_rounded,
                      color: AppColors.primary,
                      size: 22,
                    ),
                    suffixIcon: ValueListenableBuilder<TextEditingValue>(
                      valueListenable: _searchController,
                      builder: (context, value, _) {
                        if (value.text.isNotEmpty) {
                          return IconButton(
                            icon: const Icon(Icons.clear_rounded, size: 20),
                            onPressed: () {
                              _searchController.clear();
                            },
                          );
                        }
                        return IconButton(
                          icon: const Icon(
                            Icons.arrow_forward_rounded,
                            color: AppColors.primary,
                            size: 20,
                          ),
                          tooltip: 'Search',
                          onPressed: () => _handleSearch(context, _searchController.text),
                        );
                      },
                    ),
                    border: InputBorder.none,
                    enabledBorder: InputBorder.none,
                    focusedBorder: InputBorder.none,
                    contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                  ),
                ),
              ),
            ),
            const SizedBox(height: 22),

            // All Products Collection (Siatka 2-kolumnowa, scroll w dół bez duplikatów)
            if (allProducts.isNotEmpty) ...[
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      'All Products Collection',
                      style: GoogleFonts.cormorantGaramond(
                        fontSize: 22,
                        fontWeight: FontWeight.w700,
                        color: isDark ? AppColors.darkText : AppColors.lightText,
                      ),
                    ),
                    Text(
                      '${allProducts.length} items',
                      style: TextStyle(
                        fontSize: 12,
                        color: isDark ? AppColors.darkTextSecondary : AppColors.lightTextSecondary,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 14),
              _buildProductGrid(context, allProducts),
              const SizedBox(height: 24),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildProductGrid(BuildContext context, List<Product> products) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: GridView.builder(
        shrinkWrap: true,
        physics: const NeverScrollableScrollPhysics(),
        itemCount: products.length,
        gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
          crossAxisCount: 2,
          mainAxisSpacing: 14,
          crossAxisSpacing: 14,
          childAspectRatio: 0.58,
        ),
        itemBuilder: (context, index) {
          return ProductCard(product: products[index]);
        },
      ),
    );
  }
}
