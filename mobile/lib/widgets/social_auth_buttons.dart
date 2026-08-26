import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:google_fonts/google_fonts.dart';
import '../core/constants/app_colors.dart';
import '../providers/auth_provider.dart';

class SocialAuthButtons extends StatefulWidget {
  final VoidCallback? onSuccess;
  final String dividerText;

  const SocialAuthButtons({
    super.key,
    this.onSuccess,
    this.dividerText = 'Or continue with',
  });

  @override
  State<SocialAuthButtons> createState() => _SocialAuthButtonsState();
}

class _SocialAuthButtonsState extends State<SocialAuthButtons> {
  String? _activeProvider;

  Future<void> _handleGoogleSignIn() async {
    setState(() => _activeProvider = 'google');
    final auth = context.read<AuthProvider>();
    final success = await auth.loginWithGoogle();
    setState(() => _activeProvider = null);

    if (success && mounted) {
      widget.onSuccess?.call();
    }
  }

  Future<void> _handleAppleSignIn() async {
    setState(() => _activeProvider = 'apple');
    final auth = context.read<AuthProvider>();
    final success = await auth.loginWithApple();
    setState(() => _activeProvider = null);

    if (success && mounted) {
      widget.onSuccess?.call();
    }
  }

  Future<void> _handleFacebookSignIn() async {
    setState(() => _activeProvider = 'facebook');
    final auth = context.read<AuthProvider>();
    final success = await auth.loginWithFacebook();
    setState(() => _activeProvider = null);

    if (success && mounted) {
      widget.onSuccess?.call();
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final auth = context.watch<AuthProvider>();
    final isBusy = auth.isLoading;

    return Column(
      children: [
        // Divider
        Row(
          children: [
            Expanded(
              child: Divider(
                color: isDark ? Colors.white12 : Colors.black12,
                thickness: 1,
              ),
            ),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 14),
              child: Text(
                widget.dividerText.toUpperCase(),
                style: TextStyle(
                  fontSize: 11,
                  fontWeight: FontWeight.w600,
                  letterSpacing: 1.2,
                  color: isDark ? AppColors.darkTextSecondary : AppColors.lightTextSecondary,
                ),
              ),
            ),
            Expanded(
              child: Divider(
                color: isDark ? Colors.white12 : Colors.black12,
                thickness: 1,
              ),
            ),
          ],
        ),
        const SizedBox(height: 20),

        // Social Buttons Row
        Row(
          children: [
            // Google Button
            Expanded(
              child: _buildSocialCard(
                isDark: isDark,
                provider: 'google',
                isLoading: _activeProvider == 'google' && isBusy,
                iconWidget: _buildGoogleIcon(),
                label: 'Google',
                onTap: isBusy ? null : _handleGoogleSignIn,
              ),
            ),
            const SizedBox(width: 12),

            // Apple Button
            Expanded(
              child: _buildSocialCard(
                isDark: isDark,
                provider: 'apple',
                isLoading: _activeProvider == 'apple' && isBusy,
                iconWidget: Icon(
                  Icons.apple,
                  size: 22,
                  color: isDark ? Colors.white : Colors.black,
                ),
                label: 'Apple',
                onTap: isBusy ? null : _handleAppleSignIn,
              ),
            ),
            const SizedBox(width: 12),

            // Facebook Button
            Expanded(
              child: _buildSocialCard(
                isDark: isDark,
                provider: 'facebook',
                isLoading: _activeProvider == 'facebook' && isBusy,
                iconWidget: const Icon(
                  Icons.facebook,
                  size: 22,
                  color: Color(0xFF1877F2),
                ),
                label: 'Facebook',
                onTap: isBusy ? null : _handleFacebookSignIn,
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildSocialCard({
    required bool isDark,
    required String provider,
    required bool isLoading,
    required Widget iconWidget,
    required String label,
    required VoidCallback? onTap,
  }) {
    final borderColor = isDark ? Colors.white.withValues(alpha: 0.1) : Colors.black.withValues(alpha: 0.08);
    final bgColor = isDark ? const Color(0xFF1A1A1A) : Colors.white;

    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: Container(
          height: 48,
          decoration: BoxDecoration(
            color: bgColor,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: borderColor, width: 1),
            boxShadow: [
              if (!isDark)
                BoxShadow(
                  color: Colors.black.withValues(alpha: 0.03),
                  blurRadius: 6,
                  offset: const Offset(0, 2),
                ),
            ],
          ),
          child: Center(
            child: isLoading
                ? const SizedBox(
                    width: 18,
                    height: 18,
                    child: CircularProgressIndicator(strokeWidth: 2, color: AppColors.primary),
                  )
                : Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      iconWidget,
                      const SizedBox(width: 6),
                      Text(
                        label,
                        style: TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.w600,
                          color: isDark ? AppColors.darkText : AppColors.lightText,
                        ),
                      ),
                    ],
                  ),
          ),
        ),
      ),
    );
  }

  Widget _buildGoogleIcon() {
    return Container(
      width: 20,
      height: 20,
      decoration: const BoxDecoration(
        shape: BoxShape.circle,
      ),
      child: Center(
        child: Text(
          'G',
          style: GoogleFonts.poppins(
            fontSize: 16,
            fontWeight: FontWeight.w800,
            color: const Color(0xFFEA4335), // Google Red Accent
          ),
        ),
      ),
    );
  }
}
