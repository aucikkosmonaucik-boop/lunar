import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Loader2, AlertCircle } from 'lucide-react';
import { signInWithPopup } from 'firebase/auth';
import { auth, facebookProvider } from '../../lib/firebase';

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
  const [loadingProvider, setLoadingProvider] = useState<'facebook' | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFacebookAuth = async () => {
    setError(null);
    setLoadingProvider('facebook');

    try {
      await initiateFacebookLogin();
    } catch (err: any) {
      if (
        err?.code === 'auth/popup-closed-by-user' ||
        err?.code === 'auth/cancelled-popup-request'
      ) {
        setLoadingProvider(null);
        return;
      }
      console.error('facebook sign in error:', err);
      setError(err?.message || 'Failed to sign in with facebook');
      setLoadingProvider(null);
    }
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
        <div className="border-t border-gray-200 dark:border-[#2E2E2E] w-full" />
        <span className="bg-white dark:bg-[#1E1E1E] px-3 text-[10px] uppercase tracking-[0.25em] text-gray-400 dark:text-[#AAAAAA] font-medium whitespace-nowrap">
          {dividerText}
        </span>
        <div className="border-t border-gray-200 dark:border-[#2E2E2E] w-full" />
      </div>

      {/* Error alert */}
      {error && (
        <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 p-3 rounded-xl flex items-center space-x-2 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Facebook */}
      <button
        type="button"
        disabled={loadingProvider !== null}
        onClick={handleFacebookAuth}
        className="w-full flex items-center justify-center gap-2 py-3 px-3 border border-gray-200 dark:border-[#2E2E2E] hover:border-[#1877F2] dark:hover:border-[#1877F2] bg-white dark:bg-[#252525] hover:bg-[#1877F2]/5 dark:hover:bg-[#1877F2]/10 rounded-xl transition-all duration-200 text-[#1a1a1a] dark:text-[#F5F5F5] shadow-xs group disabled:opacity-50 cursor-pointer"
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
  );
};

export default SocialLoginButtons;
