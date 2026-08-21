import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../core/constants/app_colors.dart';
import '../../core/utils/formatters.dart';
import '../../providers/auth_provider.dart';
import '../../providers/cart_provider.dart';
import '../../providers/order_provider.dart';
import '../../widgets/custom_button.dart';
import '../../widgets/custom_text_field.dart';
import 'order_success_screen.dart';

class CheckoutScreen extends StatefulWidget {
  const CheckoutScreen({super.key});

  @override
  State<CheckoutScreen> createState() => _CheckoutScreenState();
}

class _CheckoutScreenState extends State<CheckoutScreen> {
  final _formKey = GlobalKey<FormState>();

  late TextEditingController _nameController;
  late TextEditingController _emailController;
  late TextEditingController _phoneController;
  late TextEditingController _streetController;
  late TextEditingController _cityController;
  late TextEditingController _postalCodeController;
  late TextEditingController _countryController;
  late TextEditingController _notesController;

  String _selectedPaymentMethod = 'blik'; // 'blik', 'card', 'transfer', 'cod'

  @override
  void initState() {
    super.initState();
    final user = context.read<AuthProvider>().user;
    _nameController = TextEditingController(text: user?.name ?? '');
    _emailController = TextEditingController(text: user?.email ?? '');
    _phoneController = TextEditingController(text: user?.phone ?? '');
    _streetController = TextEditingController(text: user?.street ?? '');
    _cityController = TextEditingController(text: user?.city ?? '');
    _postalCodeController = TextEditingController(text: user?.postalCode ?? '');
    _countryController = TextEditingController(text: user?.country ?? 'Polska');
    _notesController = TextEditingController();
  }

  @override
  void dispose() {
    _nameController.dispose();
    _emailController.dispose();
    _phoneController.dispose();
    _streetController.dispose();
    _cityController.dispose();
    _postalCodeController.dispose();
    _countryController.dispose();
    _notesController.dispose();
    super.dispose();
  }

  Future<void> _submitOrder() async {
    if (!_formKey.currentState!.validate()) return;

    final cartProvider = context.read<CartProvider>();
    final orderProvider = context.read<OrderProvider>();

    final newOrder = await orderProvider.createOrder(
      items: cartProvider.items,
      total: cartProvider.total,
      subtotal: cartProvider.subtotal,
      paymentMethod: _selectedPaymentMethod,
      name: _nameController.text.trim(),
      email: _emailController.text.trim(),
      phone: _phoneController.text.trim(),
      street: _streetController.text.trim(),
      city: _cityController.text.trim(),
      postalCode: _postalCodeController.text.trim(),
      country: _countryController.text.trim(),
      orderNotes: _notesController.text.trim().isNotEmpty ? _notesController.text.trim() : null,
      discountCode: cartProvider.appliedPromo?.code,
      discountAmount: cartProvider.promoDiscountAmount,
      shippingFee: cartProvider.shippingFee,
    );

    if (newOrder != null && mounted) {
      cartProvider.clearCart();
      Navigator.of(context).pushAndRemoveUntil(
        MaterialPageRoute(
          builder: (_) => OrderSuccessScreen(order: newOrder),
        ),
        (route) => route.isFirst,
      );
    } else if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(orderProvider.errorMessage ?? 'Wystąpił błąd podczas składania zamówienia'),
          backgroundColor: AppColors.error,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final cartProvider = context.watch<CartProvider>();
    final orderProvider = context.watch<OrderProvider>();

    return Scaffold(
      appBar: AppBar(
        title: Text(
          'Kasa i Płatność',
          style: GoogleFonts.cormorantGaramond(fontSize: 22, fontWeight: FontWeight.w700),
        ),
      ),
      body: Form(
        key: _formKey,
        child: ListView(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
          children: [
            // Section 1: Shipping Address
            _buildSectionCard(
              isDark: isDark,
              title: 'Dane do wysyłki',
              icon: Icons.local_shipping_outlined,
              children: [
                CustomTextField(
                  controller: _nameController,
                  label: 'Imię i Nazwisko *',
                  prefixIcon: Icons.person_outline,
                  validator: (v) => (v == null || v.trim().isEmpty) ? 'Podaj imię i nazwisko' : null,
                ),
                const SizedBox(height: 12),
                CustomTextField(
                  controller: _emailController,
                  label: 'Adres E-mail *',
                  prefixIcon: Icons.email_outlined,
                  keyboardType: TextInputType.emailAddress,
                  validator: (v) => (v == null || !v.contains('@')) ? 'Podaj prawidłowy adres e-mail' : null,
                ),
                const SizedBox(height: 12),
                CustomTextField(
                  controller: _phoneController,
                  label: 'Numer telefonu *',
                  prefixIcon: Icons.phone_outlined,
                  keyboardType: TextInputType.phone,
                  validator: (v) => (v == null || v.trim().isEmpty) ? 'Podaj numer telefonu' : null,
                ),
                const SizedBox(height: 12),
                CustomTextField(
                  controller: _streetController,
                  label: 'Ulica i numer domu/lokalu *',
                  prefixIcon: Icons.home_outlined,
                  validator: (v) => (v == null || v.trim().isEmpty) ? 'Podaj adres' : null,
                ),
                const SizedBox(height: 12),
                Row(
                  children: [
                    Expanded(
                      flex: 2,
                      child: CustomTextField(
                        controller: _postalCodeController,
                        label: 'Kod pocztowy *',
                        hintText: '00-000',
                        validator: (v) => (v == null || v.trim().isEmpty) ? 'Podaj kod' : null,
                      ),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      flex: 3,
                      child: CustomTextField(
                        controller: _cityController,
                        label: 'Miejscowość *',
                        validator: (v) => (v == null || v.trim().isEmpty) ? 'Podaj miasto' : null,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                CustomTextField(
                  controller: _countryController,
                  label: 'Kraj',
                  readOnly: true,
                ),
                const SizedBox(height: 12),
                CustomTextField(
                  controller: _notesController,
                  label: 'Uwagi do zamówienia (opcjonalnie)',
                  maxLines: 2,
                ),
              ],
            ),

            const SizedBox(height: 16),

            // Section 2: Payment Method
            _buildSectionCard(
              isDark: isDark,
              title: 'Metoda płatności',
              icon: Icons.payment_outlined,
              children: [
                _buildPaymentOption(
                  id: 'blik',
                  title: 'BLIK',
                  subtitle: 'Szybka i bezpieczna płatność kodem BLIK',
                  icon: Icons.flash_on_rounded,
                  color: const Color(0xFFE6007E),
                ),
                _buildPaymentOption(
                  id: 'card',
                  title: 'Karta płatnicza / Stripe',
                  subtitle: 'Visa, Mastercard, Apple Pay, Google Pay',
                  icon: Icons.credit_card_rounded,
                  color: AppColors.primary,
                ),
                _buildPaymentOption(
                  id: 'transfer',
                  title: 'Szybki przelew online',
                  subtitle: 'Przelewy24 / PayU / Bank transfer',
                  icon: Icons.account_balance_rounded,
                  color: AppColors.info,
                ),
                _buildPaymentOption(
                  id: 'cod',
                  title: 'Płatność przy odbiorze',
                  subtitle: 'Płatność gotówką lub kartą u kuriera',
                  icon: Icons.local_atm_rounded,
                  color: AppColors.warning,
                ),
              ],
            ),

            const SizedBox(height: 16),

            // Section 3: Summary
            _buildSectionCard(
              isDark: isDark,
              title: 'Podsumowanie płatności',
              icon: Icons.receipt_long_outlined,
              children: [
                _buildRow('Wartość koszyka', Formatters.formatPrice(cartProvider.subtotal)),
                if (cartProvider.promoDiscountAmount > 0) ...[
                  const SizedBox(height: 6),
                  _buildRow('Rabat', '-${Formatters.formatPrice(cartProvider.promoDiscountAmount)}', color: AppColors.success),
                ],
                const SizedBox(height: 6),
                _buildRow('Dostawa', cartProvider.shippingFee == 0 ? 'Gratis' : Formatters.formatPrice(cartProvider.shippingFee)),
                const Divider(height: 20),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text('Do zapłaty', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700)),
                    Text(
                      Formatters.formatPrice(cartProvider.total),
                      style: TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.w700,
                        color: isDark ? AppColors.primary : AppColors.lightText,
                      ),
                    ),
                  ],
                ),
              ],
            ),

            const SizedBox(height: 24),

            // Submit Button
            CustomButton(
              text: 'Zamawiam i płacę • ${Formatters.formatPrice(cartProvider.total)}',
              icon: Icons.lock_rounded,
              isLoading: orderProvider.isLoading,
              onPressed: _submitOrder,
            ),
            const SizedBox(height: 32),
          ],
        ),
      ),
    );
  }

  Widget _buildSectionCard({
    required bool isDark,
    required String title,
    required IconData icon,
    required List<Widget> children,
  }) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: isDark ? AppColors.darkSurface : AppColors.lightSurface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: isDark ? AppColors.darkBorder : AppColors.lightBorder),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(icon, size: 20, color: AppColors.primary),
              const SizedBox(width: 8),
              Text(
                title,
                style: GoogleFonts.cormorantGaramond(fontSize: 18, fontWeight: FontWeight.w700),
              ),
            ],
          ),
          const SizedBox(height: 16),
          ...children,
        ],
      ),
    );
  }

  Widget _buildPaymentOption({
    required String id,
    required String title,
    required String subtitle,
    required IconData icon,
    required Color color,
  }) {
    final isSelected = _selectedPaymentMethod == id;
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return GestureDetector(
      onTap: () => setState(() => _selectedPaymentMethod = id),
      child: Container(
        margin: const EdgeInsets.only(bottom: 10),
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: isSelected ? AppColors.primary : (isDark ? AppColors.darkBorder : AppColors.lightBorder),
            width: isSelected ? 1.5 : 1.0,
          ),
          color: isSelected
              ? (isDark ? AppColors.primary.withValues(alpha: 0.1) : AppColors.primaryLight.withValues(alpha: 0.2))
              : Colors.transparent,
        ),
        child: Row(
          children: [
            Icon(icon, color: color, size: 24),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(title, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 14)),
                  const SizedBox(height: 2),
                  Text(subtitle, style: const TextStyle(fontSize: 11, color: Colors.grey)),
                ],
              ),
            ),
            Container(
              width: 20,
              height: 20,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                border: Border.all(
                  color: isSelected ? AppColors.primary : Colors.grey,
                  width: 2,
                ),
              ),
              child: isSelected
                  ? Center(
                      child: Container(
                        width: 10,
                        height: 10,
                        decoration: const BoxDecoration(
                          shape: BoxShape.circle,
                          color: AppColors.primary,
                        ),
                      ),
                    )
                  : null,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildRow(String label, String value, {Color? color}) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(label, style: const TextStyle(fontSize: 13, color: Colors.grey)),
        Text(value, style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: color)),
      ],
    );
  }
}
