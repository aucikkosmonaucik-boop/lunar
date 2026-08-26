import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, Phone, Loader2, AlertCircle, ArrowLeft } from 'lucide-react';
import { RecaptchaVerifier, signInWithPhoneNumber, type ConfirmationResult } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import { useAuth } from '../../hooks/useAuth';

interface PhoneAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface CountryOption {
  code: string;
  flag: string;
  name: string;
  hint: string;
}

const COUNTRIES: CountryOption[] = [
  { code: '+353', flag: '🇮🇪', name: 'Ireland', hint: '87 123 4567' },
  { code: '+48', flag: '🇵🇱', name: 'Poland', hint: '500 123 456' },
];

export const PhoneAuthModal: React.FC<PhoneAuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { login } = useAuth();
  const [selectedCountry, setSelectedCountry] = useState<CountryOption>(COUNTRIES[0]);
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [countdown, setCountdown] = useState(0);

  const confirmationResultRef = useRef<ConfirmationResult | null>(null);
  const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null);

  // Close on ESC
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  // Countdown timer for resend
  useEffect(() => {
    let timer: any;
    if (countdown > 0) {
      timer = setInterval(() => setCountdown((c) => c - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  // Clean up on modal close
  useEffect(() => {
    if (!isOpen) {
      setPhone('');
      setName('');
      setOtp('');
      setError(null);
      setStep('phone');
      setLoading(false);
      setCountdown(0);
      confirmationResultRef.current = null;
      if (recaptchaVerifierRef.current) {
        try {
          recaptchaVerifierRef.current.clear();
        } catch (_) {}
        recaptchaVerifierRef.current = null;
      }
    }
  }, [isOpen]);

  const formatPhoneNumber = (rawNumber: string, countryCode: string) => {
    let cleaned = rawNumber.replace(/[^\d+]/g, '');
    if (cleaned.startsWith('+')) {
      return cleaned;
    }
    // Remove leading zeros
    cleaned = cleaned.replace(/^0+/, '');
    const bareCode = countryCode.replace('+', '');
    if (cleaned.startsWith(bareCode)) {
      return `+${cleaned}`;
    }
    return `${countryCode}${cleaned}`;
  };

  const getOrCreateRecaptcha = () => {
    let container = document.getElementById('recaptcha-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'recaptcha-container';
      document.body.appendChild(container);
    }

    if (recaptchaVerifierRef.current) {
      try {
        recaptchaVerifierRef.current.clear();
      } catch (_) {}
      recaptchaVerifierRef.current = null;
    }

    const verifier = new RecaptchaVerifier(auth, container, {
      size: 'invisible',
      callback: () => {
        console.log('[PhoneAuth] reCAPTCHA verified');
      },
      'expired-callback': () => {
        console.warn('[PhoneAuth] reCAPTCHA expired');
        setError('reCAPTCHA session expired. Please try sending code again.');
      },
    });

    recaptchaVerifierRef.current = verifier;
    return verifier;
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanInput = phone.trim();
    if (!cleanInput || cleanInput.length < 6) {
      setError(`Please enter a valid phone number for ${selectedCountry.name}.`);
      return;
    }

    const fullPhoneNumber = formatPhoneNumber(cleanInput, selectedCountry.code);
    console.log('[PhoneAuth] Initiating SMS dispatch to:', fullPhoneNumber);
    setLoading(true);

    try {
      const verifier = getOrCreateRecaptcha();
      console.log('[PhoneAuth] RecaptchaVerifier ready');
      const confirmation = await signInWithPhoneNumber(auth, fullPhoneNumber, verifier);
      console.log('[PhoneAuth] SMS code sent successfully, confirmation result obtained');
      confirmationResultRef.current = confirmation;
      setStep('otp');
      setCountdown(60);
    } catch (err: any) {
      console.error('[PhoneAuth] Firebase Error during SMS dispatch:', err);
      if (recaptchaVerifierRef.current) {
        try {
          recaptchaVerifierRef.current.clear();
        } catch (_) {}
        recaptchaVerifierRef.current = null;
      }

      let errorMsg = err?.message || 'Failed to send SMS code.';
      if (err?.code === 'auth/unauthorized-domain') {
        errorMsg = 'Domena mylunar.shop nie jest dodana w Firebase Console (Authentication -> Settings -> Authorized Domains).';
      } else if (err?.code === 'auth/invalid-phone-number') {
        errorMsg = 'Niepoprawny format numeru telefonu. Sprawdź wpisany numer.';
      } else if (err?.code === 'auth/quota-exceeded' || err?.code === 'auth/too-many-requests') {
        errorMsg = 'Zbyt wiele prób lub osiągnięto dzienny limit SMS. Spróbuj ponownie później.';
      } else if (err?.code === 'auth/billing-not-enabled' || err?.code === 'auth/operation-not-allowed') {
        errorMsg = 'Wysyłka SMS zablokowana w Firebase lub Google Cloud (sprawdź SMS Region Policy).';
      } else if (err?.code === 'auth/captcha-check-failed') {
        errorMsg = 'Weryfikacja reCAPTCHA nie powiodła się. Wyłącz adblockera i spróbuj ponownie.';
      }

      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanOtp = otp.trim();
    if (cleanOtp.length !== 6) {
      setError('Please enter the full 6-digit code.');
      return;
    }

    if (!confirmationResultRef.current) {
      setError('Session expired. Please request a new code.');
      setStep('phone');
      return;
    }

    setLoading(true);

    try {
      const result = await confirmationResultRef.current.confirm(cleanOtp);
      const user = result.user;
      const idToken = await user.getIdToken();

      // Submit to backend
      const response = await fetch('/api/auth/social-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: 'phone',
          phone: user.phoneNumber || formatPhoneNumber(phone, selectedCountry.code),
          name: name.trim() || undefined,
          providerId: user.uid,
          token: idToken,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Authentication failed on Lunar server.');
      }

      login(data.user);
      onSuccess?.();
      onClose();
    } catch (err: any) {
      console.error('OTP Verification Error:', err);
      setError(
        err?.code === 'auth/invalid-verification-code'
          ? 'Invalid SMS code. Please try again.'
          : (err?.message || 'Verification failed')
      );
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-[3px] transition-opacity" onClick={onClose} />

      {/* Modal Container */}
      <div className="relative bg-[#f5eeeb] w-full max-w-md rounded-2xl shadow-2xl p-6 sm:p-8 z-10 border border-gray-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-gray-500 hover:text-gray-900 transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5 stroke-[1.5]" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-full bg-white shadow-xs border border-gray-200 flex items-center justify-center mx-auto mb-3">
            <Phone className="w-5 h-5 text-[#1a1a1a]" />
          </div>
          <h3
            style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}
            className="text-2xl sm:text-3xl font-semibold tracking-wide text-[#1a1a1a]"
          >
            {step === 'phone' ? 'Phone Sign In' : 'Enter Verification Code'}
          </h3>
          <p className="text-[12px] text-gray-500 mt-1">
            {step === 'phone'
              ? 'Instant sign in & registration for Ireland (+353) and Poland (+48)'
              : `We sent a 6-digit SMS code to ${formatPhoneNumber(phone, selectedCountry.code)}`}
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-600 p-3 rounded-xl flex items-start space-x-2 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{error}</span>
          </div>
        )}

        {step === 'phone' ? (
          <form onSubmit={handleSendOtp} className="space-y-4">
            {/* Optional Name */}
            <div>
              <label className="block text-[10px] uppercase tracking-[0.2em] text-gray-500 font-semibold mb-1">
                Your Name (Optional)
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Liam Murphy / Jan Kowalski"
                className="w-full border border-gray-300 bg-white text-[#1a1a1a] text-[13px] px-3.5 py-2.5 rounded-xl outline-none focus:border-[#1a1a1a] transition-colors"
              />
            </div>

            {/* Country and Phone input */}
            <div>
              <label className="block text-[10px] uppercase tracking-[0.2em] text-gray-500 font-semibold mb-1">
                Mobile Number
              </label>
              <div className="flex gap-2">
                {/* Country dropdown */}
                <select
                  value={selectedCountry.code}
                  onChange={(e) => {
                    const country = COUNTRIES.find((c) => c.code === e.target.value);
                    if (country) setSelectedCountry(country);
                  }}
                  className="bg-white border border-gray-300 rounded-xl px-2 py-2.5 text-[13px] font-medium text-[#1a1a1a] outline-none focus:border-[#1a1a1a] cursor-pointer"
                >
                  {COUNTRIES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.flag} {c.code}
                    </option>
                  ))}
                </select>

                {/* Number input */}
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder={selectedCountry.hint}
                  className="flex-1 border border-gray-300 bg-white text-[#1a1a1a] text-[13px] px-3.5 py-2.5 rounded-xl outline-none focus:border-[#1a1a1a] transition-colors"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 flex items-center justify-center gap-2 bg-[#1a1a1a] text-white text-[12px] uppercase tracking-[0.25em] py-3.5 rounded-xl hover:bg-gray-800 transition-all font-medium disabled:opacity-50 cursor-pointer"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Send Verification Code'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            {/* OTP Code input */}
            <div>
              <label className="block text-[10px] uppercase tracking-[0.2em] text-gray-500 font-semibold mb-1 text-center">
                6-Digit SMS Code
              </label>
              <input
                type="text"
                required
                maxLength={6}
                autoFocus
                autoComplete="one-time-code"
                inputMode="numeric"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                placeholder="123456"
                className="w-full text-center tracking-[0.5em] text-2xl font-bold border border-gray-300 bg-white text-[#1a1a1a] py-3 rounded-xl outline-none focus:border-[#1a1a1a] transition-colors"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-[#1a1a1a] text-white text-[12px] uppercase tracking-[0.25em] py-3.5 rounded-xl hover:bg-gray-800 transition-all font-medium disabled:opacity-50 cursor-pointer"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Verify & Sign In'}
            </button>

            {/* Actions */}
            <div className="flex items-center justify-between text-[11px] pt-1">
              <button
                type="button"
                onClick={() => {
                  setStep('phone');
                  setOtp('');
                  setError(null);
                }}
                className="text-gray-500 hover:text-gray-900 flex items-center gap-1 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Change number
              </button>

              <button
                type="button"
                disabled={countdown > 0 || loading}
                onClick={handleSendOtp}
                className={`font-semibold transition-colors ${
                  countdown > 0 ? 'text-gray-400 cursor-not-allowed' : 'text-[#1a1a1a] hover:underline cursor-pointer'
                }`}
              >
                {countdown > 0 ? `Resend in ${countdown}s` : 'Resend SMS'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>,
    document.body
  );
};
export default PhoneAuthModal;
