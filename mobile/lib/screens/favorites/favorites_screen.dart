import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../core/constants/app_colors.dart';
import '../../providers/product_provider.dart';
import '../../providers/wishlist_provider.dart';
import '../../widgets/empty_state_view.dart';
import '../../widgets/product_card.dart';
import '../shop/shop_screen.dart';

class FavoritesScreen extends StatelessWidget {
  const FavoritesScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final wishlistProvider = context.watch<WishlistProvider>();
    final allProducts = context.watch<ProductProvider>().products;

    // Filter products that are in wishlist
    final favProducts = allProducts.where((p) => wishlistProvider.isFavorite(p.id)).toList();

    return Scaffold(
      appBar: AppBar(
        title: Text(
          'Wishlist (${wishlistProvider.count})',
          style: GoogleFonts.cormorantGaramond(fontSize: 22, fontWeight: FontWeight.w700),
        ),
        actions: [
          if (wishlistProvider.count > 0)
            IconButton(
              icon: const Icon(Icons.delete_outline_rounded),
              tooltip: 'Clear wishlist',
              onPressed: () {
                showDialog(
                  context: context,
                  builder: (ctx) => AlertDialog(
                    title: const Text('Clear wishlist?'),
                    content: const Text('All saved items will be removed from your wishlist.'),
                    actions: [
                      TextButton(
                        onPressed: () => Navigator.pop(ctx),
                        child: const Text('Cancel'),
                      ),
                      TextButton(
                        onPressed: () {
                          wishlistProvider.clearWishlist();
                          Navigator.pop(ctx);
                        },
                        child: const Text('Clear', style: TextStyle(color: AppColors.error)),
                      ),
                    ],
                  ),
                );
              },
            ),
        ],
      ),
      body: favProducts.isEmpty
          ? EmptyStateView(
              icon: Icons.favorite_border_rounded,
              title: 'Your wishlist is empty',
              message: 'Tap the heart icon on any product to save your favorite pieces for later.',
              buttonText: 'Explore Collection',
              onButtonPressed: () {
                Navigator.of(context).push(
                  MaterialPageRoute(builder: (_) => const ShopScreen()),
                );
              },
            )
          : GridView.builder(
              padding: const EdgeInsets.all(16),
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 2,
                childAspectRatio: 0.62,
                crossAxisSpacing: 12,
                mainAxisSpacing: 12,
              ),
              itemCount: favProducts.length,
              itemBuilder: (context, index) {
                return ProductCard(product: favProducts[index]);
              },
            ),
    );
  }
}
