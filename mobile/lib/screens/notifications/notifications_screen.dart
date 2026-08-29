import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';
import '../../core/constants/app_colors.dart';
import '../../models/notification_model.dart';
import '../../providers/auth_provider.dart';
import '../../providers/notification_provider.dart';
import '../../providers/order_provider.dart';
import '../../widgets/empty_state_view.dart';
import '../auth/login_screen.dart';
import '../orders/order_detail_screen.dart';

class NotificationsScreen extends StatefulWidget {
  const NotificationsScreen({super.key});

  @override
  State<NotificationsScreen> createState() => _NotificationsScreenState();
}

class _NotificationsScreenState extends State<NotificationsScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final auth = context.read<AuthProvider>();
      if (auth.isAuthenticated) {
        context.read<NotificationProvider>().fetchNotifications();
      }
    });
  }

  String _formatDate(DateTime date) {
    final now = DateTime.now();
    final diff = now.difference(date);

    if (diff.inMinutes < 1) return 'Just now';
    if (diff.inMinutes < 60) return '${diff.inMinutes}m ago';
    if (diff.inHours < 24) return '${diff.inHours}h ago';
    if (diff.inDays < 7) return '${diff.inDays}d ago';
    return DateFormat('MMM d, yyyy').format(date);
  }

  IconData _getTypeIcon(String type) {
    switch (type) {
      case 'SHIPPING':
        return Icons.local_shipping_outlined;
      case 'PAYMENT':
        return Icons.credit_card_rounded;
      case 'LOYALTY':
        return Icons.auto_awesome_rounded;
      case 'ORDER':
      default:
        return Icons.shopping_bag_outlined;
    }
  }

  Color _getTypeColor(String type) {
    switch (type) {
      case 'SHIPPING':
        return AppColors.primary;
      case 'PAYMENT':
        return AppColors.success;
      case 'LOYALTY':
        return AppColors.accent;
      case 'ORDER':
      default:
        return const Color(0xFF8C6D4F);
    }
  }

  void _showNotificationDetailModal(NotificationModel notif, bool isDark) {
    final typeColor = _getTypeColor(notif.type);
    final typeIcon = _getTypeIcon(notif.type);

    showModalBottomSheet(
      context: context,
      backgroundColor: isDark ? AppColors.darkSurfaceElevated : Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (ctx) {
        return SafeArea(
          child: Padding(
            padding: const EdgeInsets.fromLTRB(20, 16, 20, 24),
            child: SingleChildScrollView(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Drag Handle
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
                  const SizedBox(height: 18),

                  // Category & Date Row
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                        decoration: BoxDecoration(
                          color: typeColor.withValues(alpha: 0.12),
                          borderRadius: BorderRadius.circular(20),
                          border: Border.all(color: typeColor.withValues(alpha: 0.3)),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(typeIcon, color: typeColor, size: 14),
                            const SizedBox(width: 6),
                            Text(
                              notif.type,
                              style: TextStyle(
                                fontSize: 11,
                                fontWeight: FontWeight.w700,
                                color: typeColor,
                                letterSpacing: 0.5,
                              ),
                            ),
                          ],
                        ),
                      ),
                      const Spacer(),
                      Text(
                        DateFormat('MMM d, yyyy • HH:mm').format(notif.createdAt),
                        style: TextStyle(
                          fontSize: 11,
                          color: isDark ? AppColors.darkTextSecondary : AppColors.lightTextSecondary,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 14),

                  // Full Title
                  Text(
                    notif.title,
                    style: TextStyle(
                      fontSize: 17,
                      fontWeight: FontWeight.w700,
                      color: isDark ? AppColors.darkText : AppColors.lightText,
                      height: 1.3,
                    ),
                  ),
                  const SizedBox(height: 12),

                  // Full Message Content
                  SelectableText(
                    notif.message,
                    style: TextStyle(
                      fontSize: 14,
                      color: isDark ? AppColors.darkTextSecondary : const Color(0xFF333333),
                      height: 1.5,
                    ),
                  ),
                  const SizedBox(height: 20),

                  // Action Button for tracking order
                  if (notif.orderNumber != null && notif.orderNumber!.isNotEmpty)
                    SizedBox(
                      width: double.infinity,
                      child: ElevatedButton.icon(
                        onPressed: () {
                          Navigator.of(ctx).pop();
                          _trackOrderDirectly(notif.orderNumber!);
                        },
                        icon: const Icon(Icons.local_shipping_outlined, size: 18),
                        label: Text('Track Order #${notif.orderNumber}'),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppColors.primary,
                          foregroundColor: Colors.black,
                          padding: const EdgeInsets.symmetric(vertical: 14),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                          textStyle: const TextStyle(fontWeight: FontWeight.w700),
                        ),
                      ),
                    ),
                ],
              ),
            ),
          ),
        );
      },
    );
  }

  Future<void> _trackOrderDirectly(String orderNumber) async {
    final auth = context.read<AuthProvider>();
    final email = auth.user?.email ?? '';

    final orderProvider = context.read<OrderProvider>();
    final existing = orderProvider.orders.where((o) => o.orderNumber == orderNumber).toList();
    if (existing.isNotEmpty) {
      Navigator.of(context).push(
        MaterialPageRoute(builder: (_) => OrderDetailScreen(order: existing.first)),
      );
    } else if (email.isNotEmpty) {
      final order = await orderProvider.trackOrder(orderNumber: orderNumber, email: email);
      if (order != null && mounted) {
        Navigator.of(context).push(
          MaterialPageRoute(builder: (_) => OrderDetailScreen(order: order)),
        );
      }
    }
  }

  Future<void> _handleNotificationTap(NotificationModel notif, bool isDark) async {
    final notifProvider = context.read<NotificationProvider>();
    if (!notif.isRead) {
      await notifProvider.markAsRead(notif.id);
    }

    if (!mounted) return;

    if (notif.orderNumber != null && notif.orderNumber!.isNotEmpty) {
      await _trackOrderDirectly(notif.orderNumber!);
    } else {
      _showNotificationDetailModal(notif, isDark);
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final auth = context.watch<AuthProvider>();
    final notifProvider = context.watch<NotificationProvider>();

    return Scaffold(
      appBar: AppBar(
        title: Text(
          'Notifications',
          style: GoogleFonts.cormorantGaramond(
            fontSize: 22,
            fontWeight: FontWeight.w700,
          ),
        ),
        actions: [
          if (auth.isAuthenticated && notifProvider.unreadCount > 0)
            TextButton.icon(
              onPressed: () => notifProvider.markAllAsRead(),
              icon: const Icon(Icons.done_all_rounded, size: 18, color: AppColors.primary),
              label: const Text(
                'Mark read',
                style: TextStyle(fontSize: 12, color: AppColors.primary, fontWeight: FontWeight.w600),
              ),
            ),
          const SizedBox(width: 8),
        ],
      ),
      body: !auth.isAuthenticated
          ? _buildGuestView(isDark)
          : RefreshIndicator(
              color: AppColors.primary,
              onRefresh: () => notifProvider.fetchNotifications(silent: true),
              child: notifProvider.isLoading && notifProvider.notifications.isEmpty
                  ? const Center(child: CircularProgressIndicator(color: AppColors.primary))
                  : notifProvider.notifications.isEmpty
                      ? ListView(
                          children: const [
                            SizedBox(height: 80),
                            EmptyStateView(
                              icon: Icons.notifications_none_rounded,
                              title: 'All caught up!',
                              message: 'Updates about your orders, package tracking, and club points will appear here.',
                            ),
                          ],
                        )
                      : ListView.separated(
                          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
                          itemCount: notifProvider.notifications.length,
                          separatorBuilder: (_, __) => const SizedBox(height: 12),
                          itemBuilder: (context, index) {
                            final notif = notifProvider.notifications[index];
                            return _buildNotificationCard(notif, isDark);
                          },
                        ),
            ),
    );
  }

  Widget _buildGuestView(bool isDark) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              width: 70,
              height: 70,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: isDark ? AppColors.darkSurfaceElevated : const Color(0xFFFAF6F0),
                border: Border.all(color: AppColors.primary.withValues(alpha: 0.3)),
              ),
              child: const Icon(Icons.notifications_outlined, size: 36, color: AppColors.primary),
            ),
            const SizedBox(height: 20),
            Text(
              'Sign in for Live Updates',
              style: GoogleFonts.cormorantGaramond(fontSize: 22, fontWeight: FontWeight.w700),
            ),
            const SizedBox(height: 8),
            Text(
              'Sign in to receive instant notifications on order status, tracking updates, and club points.',
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: 13,
                color: isDark ? AppColors.darkTextSecondary : AppColors.lightTextSecondary,
                height: 1.4,
              ),
            ),
            const SizedBox(height: 24),
            ElevatedButton(
              onPressed: () {
                Navigator.of(context).push(
                  MaterialPageRoute(builder: (_) => const LoginScreen()),
                );
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: isDark ? AppColors.primary : const Color(0xFF1A1A1A),
                foregroundColor: isDark ? Colors.black : Colors.white,
                padding: const EdgeInsets.symmetric(horizontal: 28, vertical: 14),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
              child: const Text('Sign In to Your Account', style: TextStyle(fontWeight: FontWeight.w600)),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildNotificationCard(NotificationModel notif, bool isDark) {
    final typeColor = _getTypeColor(notif.type);
    final typeIcon = _getTypeIcon(notif.type);

    return InkWell(
      onTap: () => _handleNotificationTap(notif, isDark),
      borderRadius: BorderRadius.circular(14),
      child: Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: notif.isRead
              ? (isDark ? AppColors.darkSurface : AppColors.lightSurface)
              : (isDark
                  ? AppColors.primary.withValues(alpha: 0.12)
                  : const Color(0xFFFAF6F0)),
          borderRadius: BorderRadius.circular(14),
          border: Border.all(
            color: notif.isRead
                ? (isDark ? AppColors.darkBorder : AppColors.lightBorder)
                : AppColors.primary.withValues(alpha: 0.4),
            width: notif.isRead ? 1.0 : 1.5,
          ),
        ),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Icon Badge
            Container(
              width: 38,
              height: 38,
              decoration: BoxDecoration(
                color: isDark ? Colors.white10 : Colors.white,
                shape: BoxShape.circle,
                border: Border.all(color: typeColor.withValues(alpha: 0.4)),
              ),
              child: Icon(typeIcon, color: typeColor, size: 20),
            ),
            const SizedBox(width: 12),

            // Content
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Expanded(
                        child: Text(
                          notif.title,
                          style: TextStyle(
                            fontSize: 14,
                            fontWeight: notif.isRead ? FontWeight.w600 : FontWeight.w700,
                            color: isDark ? AppColors.darkText : AppColors.lightText,
                            height: 1.3,
                          ),
                          softWrap: true,
                        ),
                      ),
                      const SizedBox(width: 8),
                      Padding(
                        padding: const EdgeInsets.only(top: 2),
                        child: Text(
                          _formatDate(notif.createdAt),
                          style: TextStyle(
                            fontSize: 11,
                            color: isDark ? AppColors.darkTextSecondary : AppColors.lightTextSecondary,
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 6),
                  Text(
                    notif.message,
                    style: TextStyle(
                      fontSize: 13,
                      color: isDark ? AppColors.darkTextSecondary : const Color(0xFF333333),
                      height: 1.45,
                    ),
                    softWrap: true,
                  ),
                  if (notif.orderNumber != null && notif.orderNumber!.isNotEmpty) ...[
                    const SizedBox(height: 8),
                    Row(
                      children: [
                        Text(
                          'Tap to track order #${notif.orderNumber}',
                          style: const TextStyle(
                            fontSize: 11,
                            fontWeight: FontWeight.w600,
                            color: AppColors.primary,
                          ),
                        ),
                        const SizedBox(width: 4),
                        const Icon(Icons.arrow_forward_rounded, size: 12, color: AppColors.primary),
                      ],
                    ),
                  ],
                ],
              ),
            ),

            // Unread Dot
            if (!notif.isRead) ...[
              const SizedBox(width: 8),
              Container(
                width: 8,
                height: 8,
                margin: const EdgeInsets.only(top: 4),
                decoration: const BoxDecoration(
                  shape: BoxShape.circle,
                  color: AppColors.accent,
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}
