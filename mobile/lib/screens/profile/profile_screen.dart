import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../core/constants/api_constants.dart';
import '../../core/constants/app_colors.dart';
import '../../core/services/storage_service.dart';
import '../../providers/auth_provider.dart';
import '../../providers/theme_provider.dart';
import '../../widgets/custom_button.dart';
import '../auth/login_screen.dart';
import '../auth/register_screen.dart';
import '../orders/order_history_screen.dart';
import 'edit_profile_screen.dart';

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  void _showApiSettingsDialog(BuildContext context) {
    final currentUrl = StorageService.getCustomBaseUrl() ?? ApiConstants.baseUrl;
    final controller = TextEditingController(text: currentUrl);

    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Ustawienia API URL'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Domyślny dla emulatora Androida: http://10.0.2.2:3000\nDla iOS symulatora: http://localhost:3000',
              style: TextStyle(fontSize: 12, color: Colors.grey),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: controller,
              decoration: const InputDecoration(
                labelText: 'Adres URL serwera',
                hintText: 'https://twoj-sklep.vercel.app',
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () async {
              await StorageService.setCustomBaseUrl('');
              if (context.mounted) Navigator.pop(ctx);
            },
            child: const Text('Resetuj do domyślnego'),
          ),
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Anuluj'),
          ),
          TextButton(
            onPressed: () async {
              if (controller.text.trim().isNotEmpty) {
                await StorageService.setCustomBaseUrl(controller.text.trim());
              }
              if (context.mounted) Navigator.pop(ctx);
            },
            child: const Text('Zapisz', style: TextStyle(color: AppColors.primary)),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final auth = context.watch<AuthProvider>();
    final themeProvider = context.watch<ThemeProvider>();
    final user = auth.user;

    return Scaffold(
      appBar: AppBar(
        title: Text(
          'Konto i Profil',
          style: GoogleFonts.cormorantGaramond(fontSize: 22, fontWeight: FontWeight.w700),
        ),
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          if (!auth.isAuthenticated) ...[
            // Guest Card
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: isDark ? AppColors.darkSurface : AppColors.lightSurface,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: isDark ? AppColors.darkBorder : AppColors.lightBorder),
              ),
              child: Column(
                children: [
                  Container(
                    width: 70,
                    height: 70,
                    decoration: BoxDecoration(
                      color: AppColors.primary.withValues(alpha: 0.15),
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(Icons.person_outline_rounded, size: 36, color: AppColors.primary),
                  ),
                  const SizedBox(height: 14),
                  Text(
                    'Witaj w Lunar',
                    style: GoogleFonts.cormorantGaramond(fontSize: 22, fontWeight: FontWeight.w700),
                  ),
                  const SizedBox(height: 6),
                  Text(
                    'Zaloguj się, aby zbierać punkty, śledzić zamówienia i korzystać ze specjalnych rabatów.',
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      fontSize: 13,
                      color: isDark ? AppColors.darkTextSecondary : AppColors.lightTextSecondary,
                    ),
                  ),
                  const SizedBox(height: 18),
                  Row(
                    children: [
                      Expanded(
                        child: CustomButton(
                          text: 'Zaloguj się',
                          onPressed: () {
                            Navigator.of(context).push(
                              MaterialPageRoute(builder: (_) => const LoginScreen()),
                            );
                          },
                        ),
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: CustomButton(
                          text: 'Rejestracja',
                          isOutlined: true,
                          onPressed: () {
                            Navigator.of(context).push(
                              MaterialPageRoute(builder: (_) => const RegisterScreen()),
                            );
                          },
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ] else ...[
            // Logged in User Card
            Container(
              padding: const EdgeInsets.all(18),
              decoration: BoxDecoration(
                color: isDark ? AppColors.darkSurface : AppColors.lightSurface,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: isDark ? AppColors.darkBorder : AppColors.lightBorder),
              ),
              child: Row(
                children: [
                  CircleAvatar(
                    radius: 30,
                    backgroundColor: AppColors.primary,
                    child: Text(
                      user?.name?.isNotEmpty == true ? user!.name![0].toUpperCase() : 'U',
                      style: const TextStyle(fontSize: 22, fontWeight: FontWeight.w700, color: Colors.white),
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          user?.name ?? 'Klient Lunar',
                          style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w700),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          user?.email ?? '',
                          style: TextStyle(
                            fontSize: 13,
                            color: isDark ? AppColors.darkTextSecondary : AppColors.lightTextSecondary,
                          ),
                        ),
                        if (user?.isAdmin == true) ...[
                          const SizedBox(height: 4),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                            decoration: BoxDecoration(
                              color: AppColors.badgeBestseller,
                              borderRadius: BorderRadius.circular(4),
                            ),
                            child: const Text(
                              'ADMIN',
                              style: TextStyle(fontSize: 9, fontWeight: FontWeight.w800, color: Colors.white),
                            ),
                          ),
                        ],
                      ],
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 16),

            // Loyalty Points Card
            Container(
              padding: const EdgeInsets.all(18),
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: isDark
                      ? [const Color(0xFF2A241E), const Color(0xFF1E1E1E)]
                      : [const Color(0xFFFAF2E9), const Color(0xFFF3E7D8)],
                ),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: isDark ? AppColors.darkBorder : AppColors.primary.withValues(alpha: 0.4)),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          const Icon(Icons.stars_rounded, color: AppColors.accent, size: 20),
                          const SizedBox(width: 6),
                          Text(
                            'Punkty Klubowe',
                            style: TextStyle(
                              fontSize: 12,
                              fontWeight: FontWeight.w600,
                              color: isDark ? AppColors.darkTextSecondary : AppColors.lightTextSecondary,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 6),
                      Text(
                        '${user?.loyaltyPoints ?? 0} pkt',
                        style: GoogleFonts.cormorantGaramond(
                          fontSize: 26,
                          fontWeight: FontWeight.w700,
                          color: isDark ? AppColors.primary : AppColors.lightText,
                        ),
                      ),
                    ],
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                    decoration: BoxDecoration(
                      color: AppColors.primary,
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: const Text(
                      'Klub LUNAR',
                      style: TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.w700),
                    ),
                  ),
                ],
              ),
            ),
          ],

          const SizedBox(height: 20),

          // Menu Options Group
          _buildMenuSection(
            isDark: isDark,
            items: [
              _buildMenuItem(
                icon: Icons.receipt_long_outlined,
                title: 'Historia zamówień',
                subtitle: 'Przeglądaj swoje złożone zamówienia',
                onTap: () {
                  Navigator.of(context).push(
                    MaterialPageRoute(builder: (_) => const OrderHistoryScreen()),
                  );
                },
              ),
              if (auth.isAuthenticated)
                _buildMenuItem(
                  icon: Icons.person_outline_rounded,
                  title: 'Edytuj dane i adres',
                  subtitle: 'Imię, numer telefonu, adres do wysyłki',
                  onTap: () {
                    Navigator.of(context).push(
                      MaterialPageRoute(builder: (_) => const EditProfileScreen()),
                    );
                  },
                ),
              _buildMenuItem(
                icon: isDark ? Icons.light_mode_outlined : Icons.dark_mode_outlined,
                title: 'Tryb ciemny',
                subtitle: isDark ? 'Włączony' : 'Wyłączony',
                trailing: Switch(
                  value: themeProvider.isDarkMode,
                  activeThumbColor: AppColors.primary,
                  onChanged: (_) => themeProvider.toggleTheme(),
                ),
              ),
              _buildMenuItem(
                icon: Icons.dns_outlined,
                title: 'Adres serwera API',
                subtitle: StorageService.getCustomBaseUrl() ?? ApiConstants.baseUrl,
                onTap: () => _showApiSettingsDialog(context),
              ),
            ],
          ),

          const SizedBox(height: 16),

          _buildMenuSection(
            isDark: isDark,
            items: [
              _buildMenuItem(
                icon: Icons.security_outlined,
                title: 'Polityka prywatności i regulamin',
                onTap: () {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Dostępne na stronie https://mylunar.ie')),
                  );
                },
              ),
              _buildMenuItem(
                icon: Icons.support_agent_outlined,
                title: 'Pomoc i Kontakt',
                subtitle: 'kontakt@mylunar.ie',
                onTap: () {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Napisz do nas: kontakt@mylunar.ie')),
                  );
                },
              ),
              if (auth.isAuthenticated)
                _buildMenuItem(
                  icon: Icons.logout_rounded,
                  title: 'Wyloguj się',
                  textColor: AppColors.error,
                  iconColor: AppColors.error,
                  onTap: () {
                    showDialog(
                      context: context,
                      builder: (ctx) => AlertDialog(
                        title: const Text('Wylogowanie'),
                        content: const Text('Czy na pewno chcesz się wylogować?'),
                        actions: [
                          TextButton(
                            onPressed: () => Navigator.pop(ctx),
                            child: const Text('Anuluj'),
                          ),
                          TextButton(
                            onPressed: () {
                              auth.logout();
                              Navigator.pop(ctx);
                            },
                            child: const Text('Wyloguj', style: TextStyle(color: AppColors.error)),
                          ),
                        ],
                      ),
                    );
                  },
                ),
            ],
          ),

          const SizedBox(height: 24),
          Center(
            child: Text(
              'Lunar Mobile App v1.0.0',
              style: TextStyle(
                fontSize: 11,
                color: isDark ? Colors.white30 : Colors.black26,
              ),
            ),
          ),
          const SizedBox(height: 24),
        ],
      ),
    );
  }

  Widget _buildMenuSection({required bool isDark, required List<Widget> items}) {
    return Container(
      decoration: BoxDecoration(
        color: isDark ? AppColors.darkSurface : AppColors.lightSurface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: isDark ? AppColors.darkBorder : AppColors.lightBorder),
      ),
      child: Column(
        children: items,
      ),
    );
  }

  Widget _buildMenuItem({
    required IconData icon,
    required String title,
    String? subtitle,
    Widget? trailing,
    Color? textColor,
    Color? iconColor,
    VoidCallback? onTap,
  }) {
    return ListTile(
      leading: Icon(icon, color: iconColor ?? AppColors.primary, size: 22),
      title: Text(
        title,
        style: TextStyle(
          fontSize: 14,
          fontWeight: FontWeight.w600,
          color: textColor,
        ),
      ),
      subtitle: subtitle != null
          ? Text(
              subtitle,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: const TextStyle(fontSize: 11, color: Colors.grey),
            )
          : null,
      trailing: trailing ?? (onTap != null ? const Icon(Icons.chevron_right_rounded, size: 20, color: Colors.grey) : null),
      onTap: onTap,
    );
  }
}
