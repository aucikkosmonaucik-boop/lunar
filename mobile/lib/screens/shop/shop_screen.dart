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

  const ShopScreen({
    super.key,
    this.initialCategory,
    this.initialBadge,
  });

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
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final provider = context.read<ProductProvider>();
      if (widget.initialCategory != null) {
        provider.setCategory(widget.initialCategory);
      }
      if (widget.initialBadge != null) {
        provider.setBadge(widget.initialBadge);
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

  void _showCategoryBottomSheet(BuildContext context) {
    final provider = context.read<ProductProvider>();
    final isDark = Theme.of(context).brightness == Brightness.dark;

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
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        'Select Category',
                        style: GoogleFonts.cormorantGaramond(
                          fontSize: 20,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                      IconButton(
                        icon: const Icon(Icons.close_rounded, size: 20),
                        onPressed: () => Navigator.pop(ctx),
                      ),
                    ],
                  ),
                ),
                const Divider(),
                ListTile(
                  title: const Text('All Categories'),
                  trailing: (provider.selectedCategory == null || provider.selectedCategory == 'all')
                      ? const Icon(Icons.check_rounded, color: AppColors.primary)
                      : null,
                  onTap: () {
                    provider.setCategory('all');
                    Navigator.pop(ctx);
                  },
                ),
                ...provider.categories.map((cat) {
                  final isSelected = provider.selectedCategory == cat.slug;
                  return ListTile(
                    title: Text(cat.name),
                    trailing: isSelected ? const Icon(Icons.check_rounded, color: AppColors.primary) : null,
                    onTap: () {
                      provider.setCategory(cat.slug);
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
          // Category Menu Button
          IconButton(
            icon: const Icon(Icons.category_outlined),
            tooltip: 'Categories',
            onPressed: () => _showCategoryBottomSheet(context),
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
          // Search Box
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            child: TextField(
              controller: _searchController,
              onSubmitted: (val) => provider.setSearchQuery(val),
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

          // Categories horizontal chips
          SizedBox(
            height: 44,
            child: ListView(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 16),
              children: [
                _buildCategoryChip(
                  label: 'All',
                  isSelected: provider.selectedCategory == null || provider.selectedCategory == 'all',
                  onTap: () => provider.setCategory('all'),
                ),
                ...provider.categories.map((cat) {
                  final isSelected = provider.selectedCategory == cat.slug;
                  return _buildCategoryChip(
                    label: cat.name,
                    isSelected: isSelected,
                    onTap: () => provider.setCategory(cat.slug),
                  );
                }),
              ],
            ),
          ),
          const SizedBox(height: 8),

          // Badge Quick Filters (New, Sale, Bestseller, Bridal)
          SizedBox(
            height: 36,
            child: ListView(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 16),
              children: [
                _buildBadgeFilterChip('NEW', 'New Arrivals', provider),
                _buildBadgeFilterChip('BESTSELLER', 'Bestsellers', provider),
                _buildBadgeFilterChip('SALE', 'Sale', provider),
                _buildBadgeFilterChip('BRIDAL', 'Bridal', provider),
              ],
            ),
          ),
          const SizedBox(height: 8),

          // Active filter indicator & Total count + View Mode label
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'Found: ${provider.totalCount} items ${_isSingleColumn ? '• Full Width' : ''}',
                  style: TextStyle(
                    fontSize: 12,
                    color: isDark ? AppColors.darkTextSecondary : AppColors.lightTextSecondary,
                  ),
                ),
                if (provider.selectedCategory != null || provider.selectedBadge != null || provider.searchQuery.isNotEmpty)
                  GestureDetector(
                    onTap: () {
                      _searchController.clear();
                      provider.clearFilters();
                    },
                    child: Text(
                      'Clear filters',
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

          // Product Grid
          Expanded(
            child: provider.isLoading && provider.products.isEmpty
                ? const Center(child: CircularProgressIndicator(color: AppColors.primary))
                : provider.products.isEmpty
                    ? EmptyStateView(
                        icon: Icons.search_off_rounded,
                        title: 'No products found',
                        message: 'We could not find any products matching your selected criteria.',
                        buttonText: 'Clear filters',
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

  Widget _buildCategoryChip({
    required String label,
    required bool isSelected,
    required VoidCallback onTap,
  }) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return Padding(
      padding: const EdgeInsets.only(right: 8),
      child: ChoiceChip(
        label: Text(label),
        selected: isSelected,
        onSelected: (_) => onTap(),
        selectedColor: isDark ? AppColors.primary : AppColors.lightText,
        labelStyle: TextStyle(
          color: isSelected ? (isDark ? AppColors.darkBg : Colors.white) : null,
          fontWeight: isSelected ? FontWeight.w600 : FontWeight.w500,
          fontSize: 12,
        ),
      ),
    );
  }

  Widget _buildBadgeFilterChip(String badge, String label, ProductProvider provider) {
    final isSelected = provider.selectedBadge == badge;
    return Padding(
      padding: const EdgeInsets.only(right: 6),
      child: FilterChip(
        label: Text(label),
        selected: isSelected,
        onSelected: (selected) {
          provider.setBadge(selected ? badge : null);
        },
        labelStyle: TextStyle(
          fontSize: 11,
          fontWeight: isSelected ? FontWeight.w600 : FontWeight.normal,
        ),
      ),
    );
  }
}
