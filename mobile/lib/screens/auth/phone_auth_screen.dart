import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:firebase_auth/firebase_auth.dart' as fb;
import '../../core/constants/app_colors.dart';
import '../../providers/auth_provider.dart';
import '../../widgets/custom_button.dart';

class PhoneAuthScreen extends StatefulWidget {
  final VoidCallback? onSuccess;

  const PhoneAuthScreen({super.key, this.onSuccess});

  @override
  State<PhoneAuthScreen> createState() => _PhoneAuthScreenState();
}

class _CountryOption {
  final String code;
  final String flag;
  final String name;
  final String hint;

  const _CountryOption({
    required this.code,
    required this.flag,
    required this.name,
    required this.hint,
  });
}

class _PhoneAuthScreenState extends State<PhoneAuthScreen> {
  final _phoneController = TextEditingController();
  final _otpController = TextEditingController();
  final _nameController = TextEditingController();

  fb.FirebaseAuth get _fbAuth => fb.FirebaseAuth.instance;

  final List<_CountryOption> _countries = const [
    _CountryOption(code: '+353', flag: '🇮🇪', name: 'Ireland', hint: '87 123 4567'),
    _CountryOption(code: '+48', flag: '🇵🇱', name: 'Poland', hint: '500 123 456'),
  ];

  late _CountryOption _selectedCountry;

  String? _verificationId;
  int? _resendToken;
  bool _codeSent = false;
  bool _isLoading = false;
  String? _localError;
  String _formattedPhoneSent = '';

  // Countdown timer for SMS resend
  Timer? _countdownTimer;
  int _secondsRemaining = 0;

  @override
  void initState() {
    super.initState();
    _selectedCountry = _countries.first;
  }

  @override
  void dispose() {
    _countdownTimer?.cancel();
    _phoneController.dispose();
    _otpController.dispose();
    _nameController.dispose();
    super.dispose();
  }

  void _startResendCountdown([int seconds = 60]) {
    _countdownTimer?.cancel();
    setState(() => _secondsRemaining = seconds);
    _countdownTimer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (_secondsRemaining > 1) {
        setState(() => _secondsRemaining--);
      } else {
        _countdownTimer?.cancel();
        setState(() => _secondsRemaining = 0);
      }
    });
  }

  /// Cleans phone number: removes leading zeros and spaces, prepends selected country code
  String _formatPhoneNumber(String input, String countryCode) {
    String cleaned = input.replaceAll(RegExp(r'\s+'), '').replaceAll(RegExp(r'^0+'), '');
    if (cleaned.startsWith(countryCode)) {
      return cleaned;
    }
    if (cleaned.startsWith('+')) {
      return cleaned;
    }
    return '$countryCode$cleaned';
  }

  /// 1. Send SMS Code via Firebase
  Future<void> _sendOtp() async {
    final rawInput = _phoneController.text.trim();
    if (rawInput.isEmpty || rawInput.length < 6) {
      setState(() => _localError = 'Please enter a valid mobile number for ${_selectedCountry.name}.');
      return;
    }

    final fullPhoneNumber = _formatPhoneNumber(rawInput, _selectedCountry.code);
    _formattedPhoneSent = fullPhoneNumber;

    setState(() {
      _isLoading = true;
      _localError = null;
    });

    try {
      await _fbAuth.verifyPhoneNumber(
        phoneNumber: fullPhoneNumber,
        timeout: const Duration(seconds: 60),
        forceResendingToken: _resendToken,
        // Automatic retrieval / instant verification on Android
        verificationCompleted: (fb.PhoneAuthCredential credential) async {
          debugPrint('Firebase PhoneAuth auto-verified on device');
          try {
            final userCred = await _fbAuth.signInWithCredential(credential);
            if (userCred.user != null && mounted) {
              await _completeLogin(userCred.user!);
            }
          } catch (e) {
            if (mounted) setState(() => _localError = e.toString());
          }
        },
        verificationFailed: (fb.FirebaseAuthException e) {
          if (mounted) {
            setState(() {
              _isLoading = false;
              _localError = e.message ?? 'Verification failed. Check phone format or Firebase limits.';
            });
          }
        },
        codeSent: (String verificationId, int? resendToken) {
          if (mounted) {
            setState(() {
              _verificationId = verificationId;
              _resendToken = resendToken;
              _codeSent = true;
              _isLoading = false;
              _localError = null;
            });
            _startResendCountdown(60);
          }
        },
        codeAutoRetrievalTimeout: (String verificationId) {
          _verificationId = verificationId;
        },
      );
    } catch (e) {
      if (mounted) {
        setState(() {
          _isLoading = false;
          _localError = e.toString();
        });
      }
    }
  }

  /// 2. Verify entered SMS OTP code
  Future<void> _verifyOtp() async {
    final code = _otpController.text.trim();
    if (code.length != 6) {
      setState(() => _localError = 'Please enter the complete 6-digit code.');
      return;
    }

    if (_verificationId == null) {
      setState(() => _localError = 'Session expired. Please request a new code.');
      return;
    }

    setState(() {
      _isLoading = true;
      _localError = null;
    });

    try {
      final credential = fb.PhoneAuthProvider.credential(
        verificationId: _verificationId!,
        smsCode: code,
      );

      final userCredential = await _fbAuth.signInWithCredential(credential);
      if (userCredential.user != null && mounted) {
        await _completeLogin(userCredential.user!);
      }
    } on fb.FirebaseAuthException catch (e) {
      if (mounted) {
        setState(() {
          _isLoading = false;
          _localError = e.code == 'invalid-verification-code'
              ? 'Invalid SMS code. Please check and try again.'
              : (e.message ?? 'Authentication failed.');
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _isLoading = false;
          _localError = e.toString();
        });
      }
    }
  }

  /// 3. Sync Firebase User with Lunar Backend and Session
  Future<void> _completeLogin(fb.User fbUser) async {
    final auth = context.read<AuthProvider>();
    final success = await auth.loginWithPhoneAuth(
      firebaseUser: fbUser,
      name: _nameController.text.trim().isNotEmpty ? _nameController.text.trim() : null,
    );

    if (mounted) {
      setState(() => _isLoading = false);
      if (success) {
        widget.onSuccess?.call();
        Navigator.of(context).pop();
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Logged in successfully as ${fbUser.phoneNumber ?? "User"}!'),
            backgroundColor: AppColors.primary,
          ),
        );
      } else {
        setState(() {
          _localError = auth.errorMessage ?? 'Failed to authenticate with Lunar server.';
        });
      }
    }
  }

  void _showCountryPicker() {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (ctx) {
        final isDark = Theme.of(ctx).brightness == Brightness.dark;
        return Container(
          padding: const EdgeInsets.symmetric(vertical: 20),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
                child: Text(
                  'Select Country / Prefix',
                  style: GoogleFonts.cormorantGaramond(
                    fontSize: 22,
                    fontWeight: FontWeight.w700,
                    color: isDark ? AppColors.darkText : AppColors.lightText,
                  ),
                ),
              ),
              const Divider(),
              ..._countries.map((c) => ListTile(
                    leading: Text(c.flag, style: const TextStyle(fontSize: 26)),
                    title: Text(
                      c.name,
                      style: TextStyle(
                        fontWeight: _selectedCountry.code == c.code ? FontWeight.bold : FontWeight.normal,
                      ),
                    ),
                    trailing: Text(
                      c.code,
                      style: TextStyle(
                        fontWeight: FontWeight.w600,
                        color: _selectedCountry.code == c.code ? AppColors.primary : null,
                      ),
                    ),
                    onTap: () {
                      setState(() {
                        _selectedCountry = c;
                      });
                      Navigator.pop(ctx);
                    },
                  )),
            ],
          ),
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      appBar: AppBar(
        title: Text(
          'L U N A R',
          style: GoogleFonts.cormorantGaramond(
            fontSize: 22,
            fontWeight: FontWeight.w700,
            letterSpacing: 3,
            color: isDark ? AppColors.primary : AppColors.lightText,
          ),
        ),
      ),
      body: Center(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Header
              Text(
                _codeSent ? 'Enter Verification Code' : 'Phone Sign In',
                style: GoogleFonts.cormorantGaramond(
                  fontSize: 28,
                  fontWeight: FontWeight.w700,
                  color: isDark ? AppColors.darkText : AppColors.lightText,
                ),
              ),
              const SizedBox(height: 6),
              Text(
                _codeSent
                    ? 'A 6-digit code has been sent to $_formattedPhoneSent'
                    : 'Sign in or register instantly with your Irish (+353) or Polish (+48) number.',
                style: TextStyle(
                  fontSize: 13,
                  color: isDark ? AppColors.darkTextSecondary : AppColors.lightTextSecondary,
                ),
              ),
              const SizedBox(height: 24),

              // Error banner
              if (_localError != null) ...[
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: AppColors.error.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: AppColors.error.withValues(alpha: 0.3)),
                  ),
                  child: Row(
                    children: [
                      const Icon(Icons.error_outline_rounded, color: AppColors.error, size: 20),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Text(
                          _localError!,
                          style: const TextStyle(color: AppColors.error, fontSize: 13),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 16),
              ],

              // STEP 1: Enter Phone Number
              if (!_codeSent) ...[
                // Optional Name for new accounts
                TextField(
                  controller: _nameController,
                  textCapitalization: TextCapitalization.words,
                  decoration: InputDecoration(
                    labelText: 'Your Name (Optional)',
                    hintText: 'e.g. Liam Murphy / Jan Kowalski',
                    prefixIcon: const Icon(Icons.person_outline_rounded),
                    filled: true,
                    fillColor: isDark ? const Color(0xFF1E1E1E) : Colors.grey.shade50,
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: BorderSide(color: isDark ? Colors.white12 : Colors.black12),
                    ),
                  ),
                ),
                const SizedBox(height: 16),

                // Phone Input with interactive Country Picker badge
                TextField(
                  controller: _phoneController,
                  keyboardType: TextInputType.phone,
                  inputFormatters: [
                    FilteringTextInputFormatter.allow(RegExp(r'[0-9\s]')),
                  ],
                  decoration: InputDecoration(
                    labelText: 'Mobile Number (${_selectedCountry.name})',
                    hintText: _selectedCountry.hint,
                    prefixIcon: InkWell(
                      onTap: _showCountryPicker,
                      borderRadius: const BorderRadius.horizontal(left: Radius.circular(12)),
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10),
                        margin: const EdgeInsets.only(right: 8),
                        decoration: BoxDecoration(
                          border: Border(
                            right: BorderSide(
                              color: isDark ? Colors.white12 : Colors.black12,
                            ),
                          ),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Text(_selectedCountry.flag, style: const TextStyle(fontSize: 18)),
                            const SizedBox(width: 4),
                            Text(
                              _selectedCountry.code,
                              style: TextStyle(
                                fontSize: 14,
                                fontWeight: FontWeight.w600,
                                color: isDark ? AppColors.darkText : AppColors.lightText,
                              ),
                            ),
                            const SizedBox(width: 2),
                            Icon(
                              Icons.arrow_drop_down_rounded,
                              size: 20,
                              color: isDark ? AppColors.darkTextSecondary : AppColors.lightTextSecondary,
                            ),
                          ],
                        ),
                      ),
                    ),
                    filled: true,
                    fillColor: isDark ? const Color(0xFF1E1E1E) : Colors.grey.shade50,
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: BorderSide(color: isDark ? Colors.white12 : Colors.black12),
                    ),
                  ),
                ),
                const SizedBox(height: 20),

                CustomButton(
                  text: 'Send Verification Code',
                  isLoading: _isLoading,
                  onPressed: _isLoading ? null : _sendOtp,
                ),
              ] else ...[
                // STEP 2: Enter 6-digit OTP
                TextField(
                  controller: _otpController,
                  keyboardType: TextInputType.number,
                  textAlign: TextAlign.center,
                  style: const TextStyle(fontSize: 24, letterSpacing: 8, fontWeight: FontWeight.bold),
                  inputFormatters: [
                    LengthLimitingTextInputFormatter(6),
                    FilteringTextInputFormatter.digitsOnly,
                  ],
                  autofocus: true,
                  decoration: InputDecoration(
                    labelText: '6-Digit SMS Code',
                    hintText: '123456',
                    filled: true,
                    fillColor: isDark ? const Color(0xFF1E1E1E) : Colors.grey.shade50,
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: BorderSide(color: isDark ? Colors.white12 : Colors.black12),
                    ),
                  ),
                ),
                const SizedBox(height: 20),

                CustomButton(
                  text: 'Verify & Sign In',
                  isLoading: _isLoading,
                  onPressed: _isLoading ? null : _verifyOtp,
                ),
                const SizedBox(height: 16),

                // Resend / Change phone number actions
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    TextButton(
                      onPressed: () {
                        setState(() {
                          _codeSent = false;
                          _otpController.clear();
                          _localError = null;
                        });
                      },
                      child: Text(
                        'Change Number',
                        style: TextStyle(
                          fontSize: 13,
                          color: isDark ? AppColors.darkTextSecondary : AppColors.lightTextSecondary,
                        ),
                      ),
                    ),
                    TextButton(
                      onPressed: (_secondsRemaining == 0 && !_isLoading) ? _sendOtp : null,
                      child: Text(
                        _secondsRemaining > 0 ? 'Resend in ${_secondsRemaining}s' : 'Resend SMS',
                        style: TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.w600,
                          color: _secondsRemaining > 0
                              ? (isDark ? Colors.white38 : Colors.black38)
                              : AppColors.primary,
                        ),
                      ),
                    ),
                  ],
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }
}
