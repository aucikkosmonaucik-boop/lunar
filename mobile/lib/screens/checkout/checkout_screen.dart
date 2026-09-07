import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../core/constants/app_colors.dart';
import '../../core/services/stripe_payment_service.dart';
import '../../core/utils/formatters.dart';
import '../../models/carrier_model.dart';
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

  final _nameController = TextEditingController();
  final _emailController = TextEditingController();
  final _phoneController = TextEditingController();
  final _streetController = TextEditingController();
  final _cityController = TextEditingController();
  final _postalCodeController = TextEditingController();
  final _countryController = TextEditingController(text: 'Ireland');
  final _notesController = TextEditingController();

  String _selectedPaymentMethod = 'card';
  String _selectedCarrierId = 'AN_POST';
  bool _isProcessingPayment = false;
  bool _isAnPostExpanded = true;

  @override
  void initState() {
    super.initState();
    final auth = context.read<AuthProvider>();
    if (auth.user != null) {
      _nameController.text = auth.user!.name ?? '';
      _emailController.text = auth.user!.email;
      _phoneController.text = auth.user!.phone ?? '';
      _streetController.text = auth.user!.street ?? '';
      _cityController.text = auth.user!.city ?? '';
      _postalCodeController.text = auth.user!.postalCode ?? '';
      if (auth.user!.country != null && auth.user!.country!.isNotEmpty) {
        _countryController.text = auth.user!.country!;
      }
    }
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
    final carrier = getCarrierById(_selectedCarrierId);

    final discountedSubtotal = (cartProvider.subtotal - cartProvider.promoDiscountAmount).clamp(0.0, double.infinity);
    final isFreeShipping = carrier.freeShippingAvailable && discountedSubtotal >= carrier.freeThreshold;
    final effectiveShippingFee = isFreeShipping ? 0.0 : carrier.basePrice;
    final finalTotal = discountedSubtotal + effectiveShippingFee;

    // A) Native Stripe PaymentSheet for Card / BLIK
    if (_selectedPaymentMethod == 'card' || _selectedPaymentMethod == 'blik') {
      setState(() => _isProcessingPayment = true);
      try {
        final order = await StripePaymentService.processPayment(
          context: context,
          items: cartProvider.items,
          total: finalTotal,
          name: _nameController.text.trim(),
          email: _emailController.text.trim(),
          phone: _phoneController.text.trim(),
          street: _streetController.text.trim(),
          city: _cityController.text.trim(),
          postalCode: _postalCodeController.text.trim(),
          country: _countryController.text.trim(),
          carrier: carrier.id,
          carrierName: carrier.name,
          estimatedDelivery: carrier.estimatedDelivery,
          discountCode: cartProvider.appliedPromo?.code,
          isDark: Theme.of(context).brightness == Brightness.dark,
        );

        if (order != null && mounted) {
          cartProvider.clearCart();
          Navigator.of(context).pushAndRemoveUntil(
            MaterialPageRoute(
              builder: (_) => OrderSuccessScreen(order: order),
            ),
            (route) => route.isFirst,
          );
        }
      } catch (e) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(e.toString()),
              backgroundColor: AppColors.error,
            ),
          );
        }
      } finally {
        if (mounted) {
          setState(() => _isProcessingPayment = false);
        }
      }
      return;
    }

    // B) Standard Offline / COD / Transfer Order Creation
    final newOrder = await orderProvider.createOrder(
      items: cartProvider.items,
      total: finalTotal,
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
      shippingFee: effectiveShippingFee,
      carrier: carrier.id,
      carrierName: carrier.name,
      estimatedDelivery: carrier.estimatedDelivery,
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
          content: Text(orderProvider.errorMessage ?? 'An error occurred while placing your order.'),
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
          'Checkout',
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
              title: 'Shipping Information',
              icon: Icons.local_shipping_outlined,
              children: [
                CustomTextField(
                  controller: _nameController,
                  label: 'Full Name *',
                  prefixIcon: Icons.person_outline,
                  validator: (v) => (v == null || v.trim().isEmpty) ? 'Please enter full name' : null,
                ),
                const SizedBox(height: 12),
                CustomTextField(
                  controller: _emailController,
                  label: 'Email Address *',
                  prefixIcon: Icons.email_outlined,
                  keyboardType: TextInputType.emailAddress,
                  validator: (v) => (v == null || !v.contains('@')) ? 'Please enter a valid email address' : null,
                ),
                const SizedBox(height: 12),
                CustomTextField(
                  controller: _phoneController,
                  label: 'Phone Number *',
                  prefixIcon: Icons.phone_outlined,
                  keyboardType: TextInputType.phone,
                  validator: (v) => (v == null || v.trim().isEmpty) ? 'Please enter phone number' : null,
                ),
                const SizedBox(height: 12),
                CustomTextField(
                  controller: _streetController,
                  label: 'Street Address & House / Apt *',
                  prefixIcon: Icons.home_outlined,
                  validator: (v) => (v == null || v.trim().isEmpty) ? 'Please enter street address' : null,
                ),
                const SizedBox(height: 12),
                Row(
                  children: [
                    Expanded(
                      flex: 2,
                      child: CustomTextField(
                        controller: _postalCodeController,
                        label: 'Postal Code / Eircode *',
                        validator: (v) => (v == null || v.trim().isEmpty) ? 'Required' : null,
                      ),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      flex: 3,
                      child: CustomTextField(
                        controller: _cityController,
                        label: 'City / Town *',
                        validator: (v) => (v == null || v.trim().isEmpty) ? 'Required' : null,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                CustomTextField(
                  controller: _countryController,
                  label: 'Country',
                ),
                const SizedBox(height: 12),
                CustomTextField(
                  controller: _notesController,
                  label: 'Order Notes (optional)',
                  maxLines: 2,
                ),
              ],
            ),

            const SizedBox(height: 16),

            // Section 2: Delivery Carrier Partner
            Builder(
              builder: (context) {
                final discountedSubtotal = (cartProvider.subtotal - cartProvider.promoDiscountAmount).clamp(0.0, double.infinity);
                final anPostCarriers = kCarriers.where((c) => c.id.startsWith('AN_POST')).toList();
                final otherCarriers = kCarriers.where((c) => !c.id.startsWith('AN_POST')).toList();

                return _buildSectionCard(
                  isDark: isDark,
                  title: 'Delivery Carrier Partner',
                  icon: Icons.local_shipping_outlined,
                  children: [
                    _buildAnPostExpandablePanel(
                      anPostCarriers: anPostCarriers,
                      discountedSubtotal: discountedSubtotal,
                      isDark: isDark,
                    ),
                    ...otherCarriers.map((carrier) {
                      return _buildCarrierOption(
                        carrier: carrier,
                        isSelected: _selectedCarrierId == carrier.id,
                        discountedSubtotal: discountedSubtotal,
                        isDark: isDark,
                      );
                    }),
                  ],
                );
              },
            ),

            const SizedBox(height: 16),

            // Section 3: Payment Method
            _buildSectionCard(
              isDark: isDark,
              title: 'Payment Method',
              icon: Icons.payment_outlined,
              children: [
                _buildPaymentOption(
                  id: 'card',
                  title: 'Credit / Debit Card (Stripe)',
                  subtitle: 'Visa, Mastercard, Apple Pay, Google Pay',
                  icon: Icons.credit_card_rounded,
                  color: AppColors.primary,
                ),
                _buildPaymentOption(
                  id: 'blik',
                  title: 'BLIK',
                  subtitle: 'Instant mobile PIN code payment',
                  icon: Icons.flash_on_rounded,
                  color: const Color(0xFFE6007E),
                ),
                _buildPaymentOption(
                  id: 'transfer',
                  title: 'Direct Bank Transfer / Wire',
                  subtitle: 'Online banking transfer / Wire',
                  icon: Icons.account_balance_rounded,
                  color: AppColors.info,
                ),
                _buildPaymentOption(
                  id: 'cod',
                  title: 'Cash on Delivery',
                  subtitle: 'Pay upon parcel delivery',
                  icon: Icons.local_atm_rounded,
                  color: AppColors.warning,
                ),
              ],
            ),

            const SizedBox(height: 16),

            // Section 4: Summary with dynamic carrier fee calculation
            Builder(
              builder: (context) {
                final selectedCarrier = getCarrierById(_selectedCarrierId);
                final discountedSubtotal = (cartProvider.subtotal - cartProvider.promoDiscountAmount).clamp(0.0, double.infinity);
                final isFree = selectedCarrier.freeShippingAvailable && discountedSubtotal >= selectedCarrier.freeThreshold;
                final shippingFee = isFree ? 0.0 : selectedCarrier.basePrice;
                final grandTotal = discountedSubtotal + shippingFee;

                return _buildSectionCard(
                  isDark: isDark,
                  title: 'Payment Summary',
                  icon: Icons.receipt_long_outlined,
                  children: [
                    _buildRow('Subtotal', Formatters.formatPrice(cartProvider.subtotal)),
                    if (cartProvider.promoDiscountAmount > 0) ...[
                      const SizedBox(height: 6),
                      _buildRow('Discount', '-${Formatters.formatPrice(cartProvider.promoDiscountAmount)}', color: AppColors.success),
                    ],
                    const SizedBox(height: 6),
                    _buildRow(
                      'Delivery (${selectedCarrier.shortName})',
                      isFree ? 'Free' : Formatters.formatPrice(shippingFee),
                      color: isFree ? AppColors.success : (isDark ? AppColors.primary : AppColors.primaryDark),
                    ),
                    const Divider(height: 20),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text('Total to Pay', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700)),
                        Text(
                          Formatters.formatPrice(grandTotal),
                          style: TextStyle(
                            fontSize: 20,
                            fontWeight: FontWeight.w700,
                            color: isDark ? AppColors.primary : AppColors.lightText,
                          ),
                        ),
                      ],
                    ),
                  ],
                );
              },
            ),

            const SizedBox(height: 24),

            // Submit Button
            Builder(
              builder: (context) {
                final selectedCarrier = getCarrierById(_selectedCarrierId);
                final discountedSubtotal = (cartProvider.subtotal - cartProvider.promoDiscountAmount).clamp(0.0, double.infinity);
                final isFree = selectedCarrier.freeShippingAvailable && discountedSubtotal >= selectedCarrier.freeThreshold;
                final shippingFee = isFree ? 0.0 : selectedCarrier.basePrice;
                final grandTotal = discountedSubtotal + shippingFee;

                return CustomButton(
                  text: 'Place Order • ${Formatters.formatPrice(grandTotal)}',
                  icon: Icons.lock_rounded,
                  isLoading: orderProvider.isLoading || _isProcessingPayment,
                  onPressed: _submitOrder,
                );
              },
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

  Widget _buildAnPostExpandablePanel({
    required List<CarrierModel> anPostCarriers,
    required double discountedSubtotal,
    required bool isDark,
  }) {
    final isAnPostSelected = _selectedCarrierId.startsWith('AN_POST');
    final activeAnPostCarrier = isAnPostSelected ? getCarrierById(_selectedCarrierId) : anPostCarriers.first;
    final isFree = activeAnPostCarrier.freeShippingAvailable && discountedSubtotal >= activeAnPostCarrier.freeThreshold;
    final priceText = isFree ? 'Free' : Formatters.formatPrice(activeAnPostCarrier.basePrice);

    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: isAnPostSelected ? AppColors.primary : (isDark ? AppColors.darkBorder : AppColors.lightBorder),
          width: isAnPostSelected ? 1.5 : 1.0,
        ),
        color: isAnPostSelected
            ? (isDark ? AppColors.primary.withValues(alpha: 0.08) : AppColors.primaryLight.withValues(alpha: 0.15))
            : (isDark ? Colors.white.withValues(alpha: 0.02) : Colors.black.withValues(alpha: 0.01)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // An Post Header
          InkWell(
            onTap: () {
              setState(() {
                if (!isAnPostSelected) {
                  _selectedCarrierId = activeAnPostCarrier.id;
                  _isAnPostExpanded = true;
                } else {
                  _isAnPostExpanded = !_isAnPostExpanded;
                }
              });
            },
            borderRadius: BorderRadius.circular(12),
            child: Padding(
              padding: const EdgeInsets.all(12),
              child: Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: isAnPostSelected
                          ? AppColors.primary.withValues(alpha: 0.15)
                          : (isDark ? Colors.white10 : Colors.black.withValues(alpha: 0.04)),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Icon(
                      Icons.markunread_mailbox_rounded,
                      color: isAnPostSelected ? AppColors.primary : (isDark ? Colors.white70 : Colors.black87),
                      size: 20,
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            const Flexible(
                              child: Text(
                                'An Post (Ireland)',
                                style: TextStyle(fontWeight: FontWeight.w700, fontSize: 13),
                                overflow: TextOverflow.ellipsis,
                              ),
                            ),
                            const SizedBox(width: 6),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 1.5),
                              decoration: BoxDecoration(
                                color: isDark ? const Color(0xFF00703C).withValues(alpha: 0.2) : const Color(0xFFE8F5E9),
                                border: Border.all(color: const Color(0xFF00703C).withValues(alpha: 0.4)),
                                borderRadius: BorderRadius.circular(4),
                              ),
                              child: const Text(
                                '3 OPTIONS',
                                style: TextStyle(
                                  fontSize: 8.5,
                                  fontWeight: FontWeight.w700,
                                  color: Color(0xFF00703C),
                                ),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 2),
                        Text(
                          isAnPostSelected
                              ? 'Active: ${activeAnPostCarrier.shortName}'
                              : 'Standard Letter, Registered Post & Parcel',
                          style: TextStyle(
                            fontSize: 11,
                            color: isDark ? Colors.white70 : Colors.black54,
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(width: 8),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: [
                      Text(
                        isAnPostSelected ? priceText : 'From €2.90',
                        style: TextStyle(
                          fontWeight: FontWeight.w700,
                          fontSize: 13,
                          color: (isAnPostSelected && isFree)
                              ? AppColors.success
                              : (isDark ? AppColors.primary : AppColors.primaryDark),
                        ),
                      ),
                      const SizedBox(height: 2),
                      Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Text(
                            _isAnPostExpanded ? 'Hide' : 'Show (3)',
                            style: TextStyle(
                              fontSize: 10,
                              color: isDark ? AppColors.primary : const Color(0xFF8C6D4F),
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                          Icon(
                            _isAnPostExpanded ? Icons.keyboard_arrow_up_rounded : Icons.keyboard_arrow_down_rounded,
                            size: 16,
                            color: isDark ? AppColors.primary : const Color(0xFF8C6D4F),
                          ),
                        ],
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),

          // Collapsible Sub-options
          if (_isAnPostExpanded) ...[
            Divider(height: 1, color: isDark ? AppColors.darkBorder : AppColors.lightBorder),
            Padding(
              padding: const EdgeInsets.all(10),
              child: Column(
                children: anPostCarriers.map((subCarrier) {
                  final isSubSelected = _selectedCarrierId == subCarrier.id;
                  final isSubFree = subCarrier.freeShippingAvailable && discountedSubtotal >= subCarrier.freeThreshold;
                  final subPriceText = isSubFree ? 'Free' : Formatters.formatPrice(subCarrier.basePrice);

                  return GestureDetector(
                    onTap: () => setState(() => _selectedCarrierId = subCarrier.id),
                    child: Container(
                      margin: const EdgeInsets.only(bottom: 6),
                      padding: const EdgeInsets.all(10),
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(
                          color: isSubSelected ? AppColors.primary : (isDark ? Colors.white12 : Colors.black12),
                          width: isSubSelected ? 1.5 : 1.0,
                        ),
                        color: isSubSelected
                            ? (isDark ? AppColors.primary.withValues(alpha: 0.15) : AppColors.primaryLight.withValues(alpha: 0.25))
                            : (isDark ? Colors.white.withValues(alpha: 0.03) : Colors.white),
                      ),
                      child: Row(
                        children: [
                          Container(
                            width: 16,
                            height: 16,
                            decoration: BoxDecoration(
                              shape: BoxShape.circle,
                              border: Border.all(
                                color: isSubSelected ? AppColors.primary : Colors.grey,
                                width: 1.5,
                              ),
                            ),
                            child: isSubSelected
                                ? Center(
                                    child: Container(
                                      width: 8,
                                      height: 8,
                                      decoration: const BoxDecoration(
                                        shape: BoxShape.circle,
                                        color: AppColors.primary,
                                      ),
                                    ),
                                  )
                                : null,
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
                                        subCarrier.name,
                                        style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 12),
                                        overflow: TextOverflow.ellipsis,
                                      ),
                                    ),
                                    const SizedBox(width: 6),
                                    Text(
                                      '• ${subCarrier.estimatedDelivery}',
                                      style: TextStyle(
                                        fontSize: 10,
                                        fontWeight: FontWeight.w500,
                                        color: isDark ? AppColors.primary : const Color(0xFF8C6D4F),
                                      ),
                                    ),
                                  ],
                                ),
                                const SizedBox(height: 2),
                                Text(
                                  subCarrier.tagline,
                                  style: TextStyle(
                                    fontSize: 10.5,
                                    color: isDark ? Colors.white60 : Colors.black54,
                                  ),
                                ),
                              ],
                            ),
                          ),
                          const SizedBox(width: 8),
                          Text(
                            subPriceText,
                            style: TextStyle(
                              fontWeight: FontWeight.w700,
                              fontSize: 12,
                              color: isSubFree ? AppColors.success : (isDark ? AppColors.primary : AppColors.primaryDark),
                            ),
                          ),
                        ],
                      ),
                    ),
                  );
                }).toList(),
              ),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildCarrierOption({
    required CarrierModel carrier,
    required bool isSelected,
    required double discountedSubtotal,
    required bool isDark,
  }) {
    final isFree = carrier.freeShippingAvailable && discountedSubtotal >= carrier.freeThreshold;
    final priceText = isFree ? 'Free' : Formatters.formatPrice(carrier.basePrice);

    return GestureDetector(
      onTap: () => setState(() => _selectedCarrierId = carrier.id),
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
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: isSelected
                    ? AppColors.primary.withValues(alpha: 0.15)
                    : (isDark ? Colors.white10 : Colors.black.withValues(alpha: 0.04)),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Icon(
                Icons.local_shipping_rounded,
                color: isSelected ? AppColors.primary : (isDark ? Colors.white70 : Colors.black87),
                size: 20,
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Flexible(
                        child: Text(
                          carrier.name,
                          style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 13),
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                      const SizedBox(width: 6),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 1.5),
                        decoration: BoxDecoration(
                          color: isDark ? Colors.white10 : const Color(0xFFFAF6F0),
                          border: Border.all(color: const Color(0xFFC1A98F).withValues(alpha: 0.5)),
                          borderRadius: BorderRadius.circular(4),
                        ),
                        child: Text(
                          carrier.estimatedDelivery,
                          style: TextStyle(
                            fontSize: 9,
                            fontWeight: FontWeight.w600,
                            color: isDark ? AppColors.primary : const Color(0xFF8C6D4F),
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 2),
                  Text(
                    carrier.tagline,
                    style: TextStyle(
                      fontSize: 11,
                      color: isDark ? Colors.white60 : Colors.black54,
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(width: 8),
            Text(
              priceText,
              style: TextStyle(
                fontWeight: FontWeight.w700,
                fontSize: 13,
                color: isFree ? AppColors.success : (isDark ? AppColors.primary : AppColors.primaryDark),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
