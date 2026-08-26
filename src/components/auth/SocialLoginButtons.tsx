import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Loader2, AlertCircle, Phone } from 'lucide-react';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider, facebookProvider } from '../../lib/firebase';
import { PhoneAuthModal } from './PhoneAuthModal';

interface SocialLoginButtonsProps {
  onSuccess?: () => void;
  dividerText?: string;
  className?: string;
}

export const SocialLoginButtons: React.FC<SocialLoginButtonsProps> = ({
  onSuccess,
  dividerText = 'Or continue with',
  className = '',
}) => {
  const { login } = useAuth();
  const [loadingProvider, setLoadingProvider] = useState<'google' | 'facebook' | null>(null);
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSocialAuth = async (provider: 'google' | 'facebook') => {
    setError(null);
    setLoadingProvider(provider);

    try {
      if (provider === 'google') {
        await initiateGoogleLogin();
      } else if (provider === 'facebook') {
        await initiateFacebookLogin();
      }
    } catch (err: any) {
      if (
        err?.code === 'auth/popup-closed-by-user' ||
        err?.code === 'auth/cancelled-popup-request'
      ) {
        setLoadingProvider(null);
        return;
      }
      console.error(`${provider} sign in error:`, err);
      setError(err?.message || `Failed to sign in with ${provider}`);
      setLoadingProvider(null);
    }
  };

  const initiateGoogleLogin = async () => {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    const idToken = await user.getIdToken();

    if (!user.email) {
      throw new Error('No email returned from Google Account');
    }

    await submitToBackend({
      provider: 'google',
      email: user.email,
      name: user.displayName || undefined,
      token: idToken,
      providerId: user.uid,
    });
  };

  const initiateFacebookLogin = async () => {
    const result = await signInWithPopup(auth, facebookProvider);
    const user = result.user;
    const idToken = await user.getIdToken();

    if (!user.email) {
      throw new Error('No email returned from Facebook Account');
    }

    await submitToBackend({
      provider: 'facebook',
      email: user.email,
      name: user.displayName || undefined,
      token: idToken,
      providerId: user.uid,
    });
  };

  const submitToBackend = async (payload: {
    provider: string;
    email: string;
    name?: string;
    token?: string;
    providerId?: string;
  }) => {
    try {
      const response = await fetch('/api/auth/social-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Social login failed');
      }

      login(data.user);
      setLoadingProvider(null);
      onSuccess?.();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Social login failed');
      setLoadingProvider(null);
    }
  };

  return (
    <div className={`w-full space-y-4 ${className}`}>
      {/* Divider */}
      <div className="relative flex items-center justify-center">
        <div className="border-t border-gray-200 w-full" />
        <span className="bg-white px-3 text-[10px] uppercase tracking-[0.25em] text-gray-400 font-medium whitespace-nowrap">
          {dividerText}
        </span>
        <div className="border-t border-gray-200 w-full" />
      </div>

      {/* Error alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-xl flex items-center space-x-2 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Buttons */}
      <div className="grid grid-cols-2 gap-3">
        {/* Google */}
        <button
          type="button"
          disabled={loadingProvider !== null}
          onClick={() => handleSocialAuth('google')}
          className="flex items-center justify-center gap-2 py-3 px-3 border border-gray-200 hover:border-gray-900 bg-white hover:bg-gray-50/80 rounded-xl transition-all duration-200 text-[#1a1a1a] shadow-xs group disabled:opacity-50 cursor-pointer"
          title="Sign in with Google"
        >
          {loadingProvider === 'google' ? (
            <Loader2 className="w-4 h-4 animate-spin text-[#1a1a1a]" />
          ) : (
            <>
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.02h3.87c2.26-2.09 3.675-5.17 3.675-9.12z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.87-3.02c-1.08.72-2.45 1.16-4.06 1.16-3.13 0-5.78-2.11-6.73-4.96H1.26v3.12C3.25 21.36 7.33 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.27 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.61H1.26C.46 8.23 0 10.06 0 12s.46 3.77 1.26 5.39l4.01-3.12z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.77c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.25 2.64 1.26 6.61l4.01 3.12c.95-2.85 3.6-4.96 6.73-4.96z"
                />
              </svg>
              <span className="text-[12px] font-medium tracking-wide">Google</span>
            </>
          )}
        </button>

        {/* Facebook */}
        <button
          type="button"
          disabled={loadingProvider !== null}
          onClick={() => handleSocialAuth('facebook')}
          className="flex items-center justify-center gap-2 py-3 px-3 border border-gray-200 hover:border-[#1877F2] bg-white hover:bg-[#1877F2]/5 rounded-xl transition-all duration-200 text-[#1a1a1a] shadow-xs group disabled:opacity-50 cursor-pointer"
          title="Sign in with Facebook"
        >
          {loadingProvider === 'facebook' ? (
            <Loader2 className="w-4 h-4 animate-spin text-[#1877F2]" />
          ) : (
            <>
              <svg className="w-4 h-4 shrink-0 text-[#1877F2] fill-current" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              <span className="text-[12px] font-medium tracking-wide">Facebook</span>
            </>
          )}
        </button>
      </div>

      {/* Phone Auth Button */}
      <button
        type="button"
        onClick={() => setShowPhoneModal(true)}
        className="w-full flex items-center justify-center gap-2 py-3 px-4 border border-gray-200 hover:border-gray-900 bg-white hover:bg-gray-50/80 rounded-xl transition-all duration-200 text-[#1a1a1a] shadow-xs group cursor-pointer"
        title="Sign in with Phone Number"
      >
        <Phone className="w-4 h-4 text-[#1a1a1a] shrink-0" />
        <span className="text-[12px] font-medium tracking-wide">Continue with Phone Number</span>
      </button>

      {/* Phone Auth Modal */}
      <PhoneAuthModal
        isOpen={showPhoneModal}
        onClose={() => setShowPhoneModal(false)}
        onSuccess={onSuccess}
      />
    </div>
  );
};

export default SocialLoginButtons;
