import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../core/constants/app_colors.dart';
import '../../models/product_model.dart';
import '../../providers/product_provider.dart';
import '../../providers/theme_provider.dart';
import '../../widgets/banner_carousel.dart';
import '../../widgets/product_card.dart';
import '../shop/shop_screen.dart';

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final productProvider = context.watch<ProductProvider>();

    final sampleBanners = [
      BannerItem(
        title: 'Nowa Kolekcja Wiosna / Lato',
        subtitle: 'Odkryj minimalistyczną biżuterię ze złota i srebra',
        imageUrl: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&q=80&w=1200',
        badge: 'NOWOŚCI',
        onTap: () {
          Navigator.of(context).push(
            MaterialPageRoute(
              builder: (_) => const ShopScreen(initialBadge: 'NEW'),
            ),
          );
        },
      ),
      BannerItem(
        title: 'Kolekcja Ślubna Bridal',
        subtitle: 'Wyjątkowe akcenty na Twój najważniejszy dzień',
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
        title: 'Bestsellery Lunar',
        subtitle: 'Najczęściej wybierane przez nasze klientki',
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
            tooltip: 'Zmień motyw',
            onPressed: () => context.read<ThemeProvider>().toggleTheme(),
          ),
          IconButton(
            icon: const Icon(Icons.search_rounded),
            tooltip: 'Szukaj',
            onPressed: () {
              Navigator.of(context).push(
                MaterialPageRoute(builder: (_) => const ShopScreen()),
              );
            },
          ),
          const SizedBox(width: 6),
        ],
      ),
      body: RefreshIndicator(
        color: AppColors.primary,
        onRefresh: () => productProvider.loadInitialData(),
        child: ListView(
          padding: const EdgeInsets.symmetric(vertical: 12),
          children: [
            // Banners Carousel
            BannerCarousel(banners: sampleBanners),
            const SizedBox(height: 24),

            // Categories horizontal list
            if (productProvider.categories.isNotEmpty) ...[
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      'Kategorie',
                      style: GoogleFonts.cormorantGaramond(
                        fontSize: 20,
                        fontWeight: FontWeight.w700,
                        color: isDark ? AppColors.darkText : AppColors.lightText,
                      ),
                    ),
                    TextButton(
                      onPressed: () {
                        Navigator.of(context).push(
                          MaterialPageRoute(builder: (_) => const ShopScreen()),
                        );
                      },
                      child: Text(
                        'Zobacz wszystkie',
                        style: TextStyle(
                          fontSize: 12,
                          color: isDark ? AppColors.primary : AppColors.primaryDark,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 8),
              SizedBox(
                height: 90,
                child: ListView.separated(
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  scrollDirection: Axis.horizontal,
                  itemCount: productProvider.categories.length,
                  separatorBuilder: (_, __) => const SizedBox(width: 12),
                  itemBuilder: (context, index) {
                    final cat = productProvider.categories[index];
                    return GestureDetector(
                      onTap: () {
                        Navigator.of(context).push(
                          MaterialPageRoute(
                            builder: (_) => ShopScreen(initialCategory: cat.slug),
                          ),
                        );
                      },
                      child: Column(
                        children: [
                          Container(
                            width: 60,
                            height: 60,
                            decoration: BoxDecoration(
                              shape: BoxShape.circle,
                              color: isDark ? AppColors.darkSurface : AppColors.primaryLight.withValues(alpha: 0.3),
                              border: Border.all(
                                color: isDark ? AppColors.darkBorder : AppColors.primary.withValues(alpha: 0.3),
                              ),
                            ),
                            child: Center(
                              child: Icon(
                                _getCategoryIcon(cat.slug),
                                color: isDark ? AppColors.primary : AppColors.primaryDark,
                                size: 26,
                              ),
                            ),
                          ),
                          const SizedBox(height: 6),
                          Text(
                            cat.name,
                            style: TextStyle(
                              fontSize: 11,
                              fontWeight: FontWeight.w500,
                              color: isDark ? AppColors.darkText : AppColors.lightText,
                            ),
                          ),
                        ],
                      ),
                    );
                  },
                ),
              ),
              const SizedBox(height: 24),
            ],

            // Featured Products Section
            if (productProvider.featuredProducts.isNotEmpty) ...[
              _buildSectionHeader(
                context,
                title: 'Polecane produkty',
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
                          'Klub LUNAR',
                          style: GoogleFonts.cormorantGaramond(
                            fontSize: 18,
                            fontWeight: FontWeight.w700,
                            color: isDark ? AppColors.primary : AppColors.lightText,
                          ),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          'Zbieraj punkty za każde zakupy i wymieniaj na rabaty.',
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
                title: 'Nowości',
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
                title: 'Bestsellery',
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
              'Wszystkie >',
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

  IconData _getCategoryIcon(String slug) {
    final lower = slug.toLowerCase();
    if (lower.contains('earring') || lower.contains('kolczyki')) {
      return Icons.flare_rounded;
    } else if (lower.contains('ring') || lower.contains('pierscionki')) {
      return Icons.trip_origin_rounded;
    } else if (lower.contains('necklace') || lower.contains('naszyjniki')) {
      return Icons.all_inclusive_rounded;
    } else if (lower.contains('bracelet') || lower.contains('bransoletki')) {
      return Icons.donut_large_rounded;
    } else if (lower.contains('bridal') || lower.contains('slub')) {
      return Icons.diamond_rounded;
    } else if (lower.contains('perfume') || lower.contains('perfumy')) {
      return Icons.water_drop_outlined;
    }
    return Icons.auto_awesome_rounded;
  }
}
