import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../core/constants/app_colors.dart';
import '../../providers/product_provider.dart';
import '../../widgets/empty_state_view.dart';
import '../../widgets/product_card.dart';

class ShopScreen extends StatefulWidget {
  final String? initialCategory;
  final String? initialBadge;
  final String? initialSearch;

  const ShopScreen({
    super.key,
    this.initialCategory,
    this.initialBadge,
    this.initialSearch,
  });

  static void showCategoriesBottomSheet(BuildContext context, {bool navigateToShop = false}) =>
      _ShopScreenState.showCategoriesBottomSheet(context, navigateToShop: navigateToShop);

  static IconData getCategoryIcon(String slug) =>
      _ShopScreenState.getCategoryIcon(slug);

  @override
  State<ShopScreen> createState() => _ShopScreenState();
}

class _ShopScreenState extends State<ShopScreen> {
  final TextEditingController _searchController = TextEditingController();
  final ScrollController _scrollController = ScrollController();
  bool _isSingleColumn = false;

  @override
  void initState() {
    super.initState();
    if (widget.initialSearch != null && widget.initialSearch!.isNotEmpty) {
      _searchController.text = widget.initialSearch!;
    }
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final provider = context.read<ProductProvider>();
      if (widget.initialCategory != null) {
        provider.setCategory(widget.initialCategory);
      }
      if (widget.initialBadge != null) {
        provider.setBadge(widget.initialBadge);
      }
      if (widget.initialSearch != null && widget.initialSearch!.isNotEmpty) {
        provider.setSearchQuery(widget.initialSearch!);
      }
    });

    _scrollController.addListener(() {
      if (_scrollController.position.pixels >= _scrollController.position.maxScrollExtent - 200) {
        context.read<ProductProvider>().fetchProducts();
      }
    });
  }

  @override
  void dispose() {
    _searchController.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  void _showSortBottomSheet(BuildContext context) {
    final provider = context.read<ProductProvider>();
    final isDark = Theme.of(context).brightness == Brightness.dark;

    final sortOptions = [
      {'key': 'featured', 'label': 'Featured'},
      {'key': 'newest', 'label': 'Newest'},
      {'key': 'price-asc', 'label': 'Price: Low to High'},
      {'key': 'price-desc', 'label': 'Price: High to Low'},
      {'key': 'rating', 'label': 'Highest Rated'},
    ];

    showModalBottomSheet(
      context: context,
      backgroundColor: isDark ? AppColors.darkSurface : AppColors.lightSurface,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (ctx) {
        return SafeArea(
          child: Padding(
            padding: const EdgeInsets.symmetric(vertical: 20),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 20),
                  child: Text(
                    'Sort by',
                    style: GoogleFonts.cormorantGaramond(
                      fontSize: 20,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                ),
                const SizedBox(height: 12),
                ...sortOptions.map((opt) {
                  final isSelected = provider.selectedSort == opt['key'];
                  return ListTile(
                    title: Text(
                      opt['label']!,
                      style: TextStyle(
                        fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
                        color: isSelected ? AppColors.primary : null,
                      ),
                    ),
                    trailing: isSelected ? const Icon(Icons.check_rounded, color: AppColors.primary) : null,
                    onTap: () {
                      provider.setSort(opt['key']!);
                      Navigator.pop(ctx);
                    },
                  );
                }),
              ],
            ),
          ),
        );
      },
    );
  }

  static IconData getCategoryIcon(String slug) {
    final s = slug.toLowerCase();
    if (s.contains('ring')) return Icons.diamond_outlined;
    if (s.contains('earring')) return Icons.auto_awesome_outlined;
    if (s.contains('necklace')) return Icons.link_rounded;
    if (s.contains('bracelet')) return Icons.trip_origin_rounded;
    if (s.contains('bridal')) return Icons.favorite_outline_rounded;
    if (s.contains('perfume')) return Icons.local_florist_outlined;
    if (s.contains('gift')) return Icons.card_giftcard_rounded;
    return Icons.spa_outlined;
  }

  static void showCategoriesBottomSheet(BuildContext context, {bool navigateToShop = false}) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) {
        return Container(
          constraints: BoxConstraints(
            maxHeight: MediaQuery.of(ctx).size.height * 0.82,
          ),
          decoration: BoxDecoration(
            color: isDark ? AppColors.darkSurface : AppColors.lightSurface,
            borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
            boxShadow: const [
              BoxShadow(
                color: Colors.black26,
                blurRadius: 20,
                spreadRadius: 2,
              )
            ],
          ),
          child: SafeArea(
            top: false,
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                const SizedBox(height: 12),
                // Drag handle
                Center(
                  child: Container(
                    width: 40,
                    height: 4,
                    decoration: BoxDecoration(
                      color: isDark ? Colors.white24 : Colors.black12,
                      borderRadius: BorderRadius.circular(2),
                    ),
                  ),
                ),
                const SizedBox(height: 16),

                // Header
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 20),
                  child: Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(8),
                        decoration: BoxDecoration(
                          color: isDark ? Colors.white10 : const Color(0xFFFAF6F0),
                          shape: BoxShape.circle,
                          border: Border.all(color: AppColors.primary.withValues(alpha: 0.3)),
                        ),
                        child: const Icon(Icons.menu_rounded, size: 20, color: AppColors.primary),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'All Categories',
                              style: GoogleFonts.cormorantGaramond(
                                fontSize: 22,
                                fontWeight: FontWeight.w700,
                              ),
                            ),
                            Text(
                              'Explore & filter Lunar collections',
                              style: TextStyle(
                                fontSize: 11,
                                color: isDark ? AppColors.darkTextSecondary : AppColors.lightTextSecondary,
                              ),
                            ),
                          ],
                        ),
                      ),
                      IconButton(
                        icon: const Icon(Icons.close_rounded, size: 20),
                        onPressed: () => Navigator.pop(ctx),
                      ),
                    ],
                  ),
                ),

                const Divider(height: 20),

                // Categories List
                Flexible(
                  child: ListView(
                    shrinkWrap: true,
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
                    children: [
                      // 1. ALL CATEGORIES (Special highlighted card)
                      Consumer<ProductProvider>(
                        builder: (context, prod, _) {
                          final isAllSelected = prod.selectedCategory == null || prod.selectedCategory == 'all';
                          return Container(
                            margin: const EdgeInsets.only(bottom: 10),
                            decoration: BoxDecoration(
                              color: isAllSelected
                                  ? (isDark ? AppColors.primary.withValues(alpha: 0.15) : const Color(0xFFFAF6F0))
                                  : (isDark ? AppColors.darkSurfaceElevated : Colors.grey.withValues(alpha: 0.05)),
                              borderRadius: BorderRadius.circular(14),
                              border: Border.all(
                                color: isAllSelected ? AppColors.primary : (isDark ? AppColors.darkBorder : AppColors.lightBorder),
                                width: isAllSelected ? 1.5 : 1.0,
                              ),
                            ),
                            child: ListTile(
                              contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
                              leading: Container(
                                padding: const EdgeInsets.all(8),
                                decoration: BoxDecoration(
                                  color: isAllSelected ? AppColors.primary : (isDark ? Colors.white10 : Colors.white),
                                  shape: BoxShape.circle,
                                ),
                                child: Icon(
                                  Icons.auto_awesome_rounded,
                                  size: 18,
                                  color: isAllSelected ? Colors.black : AppColors.primary,
                                ),
                              ),
                              title: const Text(
                                'All Categories / All Products',
                                style: TextStyle(fontWeight: FontWeight.w700, fontSize: 14),
                              ),
                              subtitle: const Text(
                                'Show entire catalog without category filters',
                                style: TextStyle(fontSize: 11, color: Colors.grey),
                              ),
                              trailing: isAllSelected
                                  ? const Icon(Icons.check_circle_rounded, color: AppColors.primary)
                                  : const Icon(Icons.chevron_right_rounded, color: Colors.grey),
                              onTap: () {
                                prod.setCategory('all');
                                Navigator.pop(ctx);
                                if (navigateToShop) {
                                  Navigator.of(context).push(
                                    MaterialPageRoute(builder: (_) => const ShopScreen()),
                                  );
                                }
                              },
                            ),
                          );
                        },
                      ),

                      // List of individual categories
                      Consumer<ProductProvider>(
                        builder: (context, prod, _) {
                          return Column(
                            children: prod.categories.map((cat) {
                              final isSelected = prod.selectedCategory == cat.slug;
                              final icon = getCategoryIcon(cat.slug);

                              return Container(
                                margin: const EdgeInsets.only(bottom: 8),
                                decoration: BoxDecoration(
                                  color: isSelected
                                      ? (isDark ? AppColors.primary.withValues(alpha: 0.12) : const Color(0xFFFAF6F0))
                                      : (isDark ? AppColors.darkSurface : AppColors.lightSurface),
                                  borderRadius: BorderRadius.circular(12),
                                  border: Border.all(
                                    color: isSelected ? AppColors.primary : (isDark ? AppColors.darkBorder : AppColors.lightBorder),
                                    width: isSelected ? 1.5 : 1.0,
                                  ),
                                ),
                                child: ListTile(
                                  contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 2),
                                  leading: Container(
                                    padding: const EdgeInsets.all(8),
                                    decoration: BoxDecoration(
                                      color: isDark ? Colors.white10 : Colors.black.withValues(alpha: 0.04),
                                      shape: BoxShape.circle,
                                    ),
                                    child: Icon(
                                      icon,
                                      size: 18,
                                      color: isSelected ? AppColors.primary : (isDark ? Colors.white70 : Colors.black87),
                                    ),
                                  ),
                                  title: Text(
                                    cat.name,
                                    style: TextStyle(
                                      fontWeight: isSelected ? FontWeight.w700 : FontWeight.w600,
                                      fontSize: 13.5,
                                    ),
                                  ),
                                  subtitle: cat.description != null && cat.description!.isNotEmpty
                                      ? Text(
                                          cat.description!,
                                          maxLines: 1,
                                          overflow: TextOverflow.ellipsis,
                                          style: const TextStyle(fontSize: 11, color: Colors.grey),
                                        )
                                      : null,
                                  trailing: isSelected
                                      ? const Icon(Icons.check_rounded, color: AppColors.primary)
                                      : const Icon(Icons.chevron_right_rounded, size: 18, color: Colors.grey),
                                  onTap: () {
                                    prod.setCategory(cat.slug);
                                    Navigator.pop(ctx);
                                    if (navigateToShop) {
                                      Navigator.of(context).push(
                                        MaterialPageRoute(
                                          builder: (_) => ShopScreen(initialCategory: cat.slug),
                                        ),
                                      );
                                    }
                                  },
                                ),
                              );
                            }).toList(),
                          );
                        },
                      ),
                      const SizedBox(height: 16),
                    ],
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final provider = context.watch<ProductProvider>();

    return Scaffold(
      appBar: AppBar(
        title: Text(
          'Catalog',
          style: GoogleFonts.cormorantGaramond(
            fontSize: 22,
            fontWeight: FontWeight.w700,
          ),
        ),
        actions: [
          // View Mode Switcher: 1-Column vs 2-Column
          IconButton(
            icon: Icon(
              _isSingleColumn ? Icons.grid_view_rounded : Icons.crop_square_rounded,
              color: isDark ? AppColors.primary : AppColors.lightText,
            ),
            tooltip: _isSingleColumn ? 'Switch to 2-Column Grid' : 'Switch to Full Width (1 Column)',
            onPressed: () {
              setState(() {
                _isSingleColumn = !_isSingleColumn;
              });
            },
          ),
          // Category Menu Button (3 horizontal lines)
          IconButton(
            icon: const Icon(Icons.menu_rounded),
            tooltip: 'All Categories',
            onPressed: () => showCategoriesBottomSheet(context),
          ),
          // Sort Button
          IconButton(
            icon: const Icon(Icons.sort_rounded),
            tooltip: 'Sort',
            onPressed: () => _showSortBottomSheet(context),
          ),
        ],
      ),
      body: Column(
        children: [
          // Search Box (Tylko Search)
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 10, 16, 8),
            child: TextField(
              controller: _searchController,
              onSubmitted: (val) => provider.setSearchQuery(val),
              onChanged: (val) {
                if (val.isEmpty) provider.setSearchQuery('');
              },
              decoration: InputDecoration(
                hintText: 'Search jewelry, earrings, rings, perfumes...',
                prefixIcon: const Icon(Icons.search_rounded),
                suffixIcon: _searchController.text.isNotEmpty
                    ? IconButton(
                        icon: const Icon(Icons.clear_rounded, size: 18),
                        onPressed: () {
                          _searchController.clear();
                          provider.setSearchQuery('');
                        },
                      )
                    : null,
                contentPadding: const EdgeInsets.symmetric(vertical: 0, horizontal: 16),
              ),
            ),
          ),

          // Active filter indicator if any
          if ((provider.selectedCategory != null && provider.selectedCategory != 'all') ||
              provider.selectedBadge != null ||
              provider.searchQuery.isNotEmpty)
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 0, 16, 8),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Expanded(
                    child: Text(
                      'Filtered: ${provider.selectedCategory ?? provider.selectedBadge ?? provider.searchQuery} (${provider.totalCount} items)',
                      style: TextStyle(
                        fontSize: 12,
                        color: isDark ? AppColors.darkTextSecondary : AppColors.lightTextSecondary,
                      ),
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                  GestureDetector(
                    onTap: () {
                      _searchController.clear();
                      provider.clearFilters();
                    },
                    child: Text(
                      'Show all',
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                        color: isDark ? AppColors.primary : AppColors.primaryDark,
                      ),
                    ),
                  ),
                ],
              ),
            ),

          const Divider(height: 1),

          // Product Grid (Bezpośrednio pod Search zdjęcia produktów)
          Expanded(
            child: provider.isLoading && provider.products.isEmpty
                ? const Center(child: CircularProgressIndicator(color: AppColors.primary))
                : provider.products.isEmpty
                    ? EmptyStateView(
                        icon: Icons.search_off_rounded,
                        title: 'No products found',
                        message: 'We could not find any products matching your search.',
                        buttonText: 'Clear search',
                        onButtonPressed: () {
                          _searchController.clear();
                          provider.clearFilters();
                        },
                      )
                    : RefreshIndicator(
                        color: AppColors.primary,
                        onRefresh: () => provider.fetchProducts(refresh: true),
                        child: GridView.builder(
                          controller: _scrollController,
                          padding: const EdgeInsets.all(16),
                          gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                            crossAxisCount: _isSingleColumn ? 1 : 2,
                            childAspectRatio: _isSingleColumn ? 0.95 : 0.62,
                            crossAxisSpacing: 12,
                            mainAxisSpacing: 12,
                          ),
                          itemCount: provider.products.length + (provider.isLoadingMore ? 1 : 0),
                          itemBuilder: (context, index) {
                            if (index == provider.products.length) {
                              return const Center(
                                child: Padding(
                                  padding: EdgeInsets.all(16),
                                  child: CircularProgressIndicator(color: AppColors.primary, strokeWidth: 2),
                                ),
                              );
                            }
                            return ProductCard(product: provider.products[index]);
                          },
                        ),
                      ),
          ),
        ],
      ),
    );
  }
}
