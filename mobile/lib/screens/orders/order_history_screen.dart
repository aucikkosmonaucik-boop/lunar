import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../core/constants/app_colors.dart';
import '../../core/utils/formatters.dart';
import '../../models/order_model.dart';
import '../../providers/auth_provider.dart';
import '../../providers/order_provider.dart';
import '../../widgets/custom_button.dart';
import '../../widgets/custom_text_field.dart';
import '../../widgets/empty_state_view.dart';
import 'order_detail_screen.dart';

class OrderHistoryScreen extends StatefulWidget {
  const OrderHistoryScreen({super.key});

  @override
  State<OrderHistoryScreen> createState() => _OrderHistoryScreenState();
}

class _OrderHistoryScreenState extends State<OrderHistoryScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;
  final TextEditingController _orderNumController = TextEditingController();
  final TextEditingController _emailController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (context.read<AuthProvider>().isAuthenticated) {
        context.read<OrderProvider>().fetchUserOrders();
      }
    });
  }

  @override
  void dispose() {
    _tabController.dispose();
    _orderNumController.dispose();
    _emailController.dispose();
    super.dispose();
  }

  Future<void> _trackGuestOrder() async {
    if (_orderNumController.text.trim().isEmpty || _emailController.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Podaj numer zamówienia oraz adres e-mail')),
      );
      return;
    }

    final order = await context.read<OrderProvider>().trackOrder(
          orderNumber: _orderNumController.text.trim(),
          email: _emailController.text.trim(),
        );

    if (order != null && mounted) {
      Navigator.of(context).push(
        MaterialPageRoute(builder: (_) => OrderDetailScreen(order: order)),
      );
    } else if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Nie znaleziono zamówienia o podanych danych'),
          backgroundColor: AppColors.error,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final authProvider = context.watch<AuthProvider>();
    final orderProvider = context.watch<OrderProvider>();

    return Scaffold(
      appBar: AppBar(
        title: Text(
          'Historia Zamówień',
          style: GoogleFonts.cormorantGaramond(fontSize: 22, fontWeight: FontWeight.w700),
        ),
        bottom: TabBar(
          controller: _tabController,
          indicatorColor: AppColors.primary,
          labelColor: isDark ? AppColors.primary : AppColors.lightText,
          unselectedLabelColor: Colors.grey,
          tabs: const [
            Tab(text: 'Moje zamówienia'),
            Tab(text: 'Śledź przesyłkę'),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          // Tab 1: User Orders List
          !authProvider.isAuthenticated
              ? const EmptyStateView(
                  icon: Icons.lock_outline_rounded,
                  title: 'Zaloguj się',
                  message: 'Zaloguj się na swoje konto, aby zobaczyć historię zamówień.',
                )
              : orderProvider.isLoading
                  ? const Center(child: CircularProgressIndicator(color: AppColors.primary))
                  : orderProvider.orders.isEmpty
                      ? const EmptyStateView(
                          icon: Icons.receipt_long_outlined,
                          title: 'Brak zamówień',
                          message: 'Nie masz jeszcze żadnych zamówień na swoim koncie.',
                        )
                      : RefreshIndicator(
                          color: AppColors.primary,
                          onRefresh: () => orderProvider.fetchUserOrders(),
                          child: ListView.separated(
                            padding: const EdgeInsets.all(16),
                            itemCount: orderProvider.orders.length,
                            separatorBuilder: (_, __) => const SizedBox(height: 12),
                            itemBuilder: (context, index) {
                              final order = orderProvider.orders[index];
                              return _buildOrderCard(context, order, isDark);
                            },
                          ),
                        ),

          // Tab 2: Track Guest Order
          ListView(
            padding: const EdgeInsets.all(20),
            children: [
              Text(
                'Sprawdź status zamówienia',
                style: GoogleFonts.cormorantGaramond(fontSize: 20, fontWeight: FontWeight.w700),
              ),
              const SizedBox(height: 8),
              Text(
                'Wpisz numer zamówienia oraz adres e-mail użyty podczas zakupu.',
                style: TextStyle(
                  fontSize: 13,
                  color: isDark ? AppColors.darkTextSecondary : AppColors.lightTextSecondary,
                ),
              ),
              const SizedBox(height: 20),
              CustomTextField(
                controller: _orderNumController,
                label: 'Numer zamówienia',
                hintText: 'np. LUNAR-123456-789',
                prefixIcon: Icons.tag_rounded,
              ),
              const SizedBox(height: 14),
              CustomTextField(
                controller: _emailController,
                label: 'Adres E-mail',
                hintText: 'jan@example.com',
                prefixIcon: Icons.email_outlined,
                keyboardType: TextInputType.emailAddress,
              ),
              const SizedBox(height: 24),
              CustomButton(
                text: 'Sprawdź status',
                icon: Icons.search_rounded,
                isLoading: orderProvider.isLoading,
                onPressed: _trackGuestOrder,
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildOrderCard(BuildContext context, OrderModel order, bool isDark) {
    return GestureDetector(
      onTap: () {
        Navigator.of(context).push(
          MaterialPageRoute(builder: (_) => OrderDetailScreen(order: order)),
        );
      },
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: isDark ? AppColors.darkSurface : AppColors.lightSurface,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: isDark ? AppColors.darkBorder : AppColors.lightBorder),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  '#${order.orderNumber}',
                  style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 14),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                  decoration: BoxDecoration(
                    color: AppColors.primary.withValues(alpha: 0.15),
                    borderRadius: BorderRadius.circular(6),
                  ),
                  child: Text(
                    Formatters.formatOrderStatus(order.status),
                    style: const TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.w600,
                      color: AppColors.primary,
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 8),
            Text(
              'Data: ${Formatters.formatDate(order.createdAt)}',
              style: TextStyle(
                fontSize: 12,
                color: isDark ? AppColors.darkTextSecondary : AppColors.lightTextSecondary,
              ),
            ),
            const Divider(height: 20),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'Pozycje: ${order.items.length} szt.',
                  style: TextStyle(
                    fontSize: 13,
                    color: isDark ? AppColors.darkTextSecondary : AppColors.lightTextSecondary,
                  ),
                ),
                Text(
                  Formatters.formatPrice(order.total),
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w700,
                    color: isDark ? AppColors.primary : AppColors.lightText,
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
