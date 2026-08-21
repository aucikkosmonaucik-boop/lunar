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
      {'key': 'featured', 'label': 'Polecane'},
      {'key': 'newest', 'label': 'Najnowsze'},
      {'key': 'price-asc', 'label': 'Cena: od najniższej'},
      {'key': 'price-desc', 'label': 'Cena: od najwyższej'},
      {'key': 'rating', 'label': 'Najwyżej oceniane'},
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
                    'Sortuj według',
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

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final provider = context.watch<ProductProvider>();

    return Scaffold(
      appBar: AppBar(
        title: Text(
          'Katalog',
          style: GoogleFonts.cormorantGaramond(
            fontSize: 22,
            fontWeight: FontWeight.w700,
          ),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.sort_rounded),
            tooltip: 'Sortowanie',
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
                hintText: 'Szukaj biżuterii, kolczyków, pierścionków...',
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
                  label: 'Wszystkie',
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

          // Badge Quick Filters (New, Sale, Bestseller)
          SizedBox(
            height: 36,
            child: ListView(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 16),
              children: [
                _buildBadgeFilterChip('NEW', 'Nowości', provider),
                _buildBadgeFilterChip('BESTSELLER', 'Bestsellery', provider),
                _buildBadgeFilterChip('SALE', 'Promocje', provider),
                _buildBadgeFilterChip('BRIDAL', 'Ślubne', provider),
              ],
            ),
          ),
          const SizedBox(height: 8),

          // Active filter indicator & Total count
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'Znaleziono: ${provider.totalCount}',
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
                      'Wyczyść filtry',
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
                        title: 'Brak produktów',
                        message: 'Nie znaleziono produktów spełniających wybrane kryteria.',
                        buttonText: 'Wyczyść filtry',
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
                          gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                            crossAxisCount: 2,
                            childAspectRatio: 0.62,
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
