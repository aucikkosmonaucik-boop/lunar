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
import '../shop/shop_screen.dart';

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

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
          padding: const EdgeInsets.symmetric(vertical: 12),
          children: [
            // 1. Banners Carousel (Slajd zdjęć)
            BannerCarousel(banners: sampleBanners),
            const SizedBox(height: 14),

            // 2. Search Bar (Idealnie pomiędzy slajdem zdjęć a nowym All Categories)
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: GestureDetector(
                onTap: () {
                  Navigator.of(context).push(
                    MaterialPageRoute(builder: (_) => const ShopScreen()),
                  );
                },
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                  decoration: BoxDecoration(
                    color: isDark ? AppColors.darkSurface : AppColors.lightSurface,
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(
                      color: isDark ? AppColors.darkBorder : AppColors.lightBorder,
                    ),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withValues(alpha: isDark ? 0.25 : 0.04),
                        blurRadius: 10,
                        offset: const Offset(0, 2),
                      ),
                    ],
                  ),
                  child: Row(
                    children: [
                      Icon(
                        Icons.search_rounded,
                        size: 20,
                        color: isDark ? AppColors.primary : const Color(0xFF8C6D4F),
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: Text(
                          'Search jewelry, earrings, rings, perfumes...',
                          style: TextStyle(
                            fontSize: 13,
                            color: isDark ? AppColors.darkTextSecondary : const Color(0xFF8E8E93),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
            const SizedBox(height: 18),

            // 3. Categories Bar (Tylko hamburger menu i obok napis "CATEGORIES" bez kółka i zbędnych ikonek)
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: InkWell(
                onTap: () => ShopScreen.showCategoriesBottomSheet(context),
                borderRadius: BorderRadius.circular(10),
                child: Padding(
                  padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 4),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Row(
                        children: [
                          Icon(
                            Icons.menu_rounded,
                            size: 22,
                            color: isDark ? AppColors.primary : AppColors.lightText,
                          ),
                          const SizedBox(width: 10),
                          Text(
                            'CATEGORIES',
                            style: GoogleFonts.cormorantGaramond(
                              fontSize: 21,
                              fontWeight: FontWeight.w700,
                              letterSpacing: 2.0,
                              color: isDark ? AppColors.darkText : AppColors.lightText,
                            ),
                          ),
                        ],
                      ),
                      Row(
                        children: [
                          Text(
                            'All',
                            style: TextStyle(
                              fontSize: 12,
                              fontWeight: FontWeight.w600,
                              color: isDark ? AppColors.primary : AppColors.primaryDark,
                            ),
                          ),
                          const SizedBox(width: 4),
                          Icon(
                            Icons.chevron_right_rounded,
                            size: 18,
                            color: isDark ? AppColors.primary : AppColors.primaryDark,
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
            ),
            const SizedBox(height: 16),

            // Featured Products Section
            if (productProvider.featuredProducts.isNotEmpty) ...[
              _buildSectionHeader(
                context,
                title: 'Featured Pieces',
                onViewAll: () {
                  Navigator.of(context).push(
                    MaterialPageRoute(builder: (_) => const ShopScreen()),
                  );
                },
              ),
              const SizedBox(height: 12),
              _buildProductHorizontalList(context, productProvider.featuredProducts),
              const SizedBox(height: 28),
            ],

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
            const SizedBox(height: 28),

            // New Arrivals Section
            if (productProvider.newArrivals.isNotEmpty) ...[
              _buildSectionHeader(
                context,
                title: 'New Arrivals',
                onViewAll: () {
                  Navigator.of(context).push(
                    MaterialPageRoute(builder: (_) => const ShopScreen(initialBadge: 'NEW')),
                  );
                },
              ),
              const SizedBox(height: 12),
              _buildProductHorizontalList(context, productProvider.newArrivals),
              const SizedBox(height: 28),
            ],

            // Bestsellers Section
            if (productProvider.bestsellers.isNotEmpty) ...[
              _buildSectionHeader(
                context,
                title: 'Bestsellers',
                onViewAll: () {
                  Navigator.of(context).push(
                    MaterialPageRoute(builder: (_) => const ShopScreen(initialBadge: 'BESTSELLER')),
                  );
                },
              ),
              const SizedBox(height: 12),
              _buildProductHorizontalList(context, productProvider.bestsellers),
              const SizedBox(height: 16),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildSectionHeader(BuildContext context, {required String title, required VoidCallback onViewAll}) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            title,
            style: GoogleFonts.cormorantGaramond(
              fontSize: 22,
              fontWeight: FontWeight.w700,
              color: isDark ? AppColors.darkText : AppColors.lightText,
            ),
          ),
          TextButton(
            onPressed: onViewAll,
            child: Text(
              'View all >',
              style: TextStyle(
                fontSize: 12,
                color: isDark ? AppColors.primary : AppColors.primaryDark,
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildProductHorizontalList(BuildContext context, List<Product> products) {
    return SizedBox(
      height: 275,
      child: ListView.separated(
        padding: const EdgeInsets.symmetric(horizontal: 16),
        scrollDirection: Axis.horizontal,
        itemCount: products.length,
        separatorBuilder: (_, __) => const SizedBox(width: 12),
        itemBuilder: (context, index) {
          return SizedBox(
            width: 170,
            child: ProductCard(product: products[index]),
          );
        },
      ),
    );
  }
}
