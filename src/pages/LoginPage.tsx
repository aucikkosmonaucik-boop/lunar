import React, { useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Mail, Lock, AlertCircle, CheckCircle2, RefreshCw } from 'lucide-react';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isUnverified, setIsUnverified] = useState(false);
  const [showResendModal, setShowResendModal] = useState(false);
  const [resendEmail, setResendEmail] = useState('');
  const [resendStatus, setResendStatus] = useState<'idle' | 'loading' | 'sent' | 'error'>('idle');
  const [resendMessage, setResendMessage] = useState('');
  const [loading, setLoading] = useState(false);
  
  const [searchParams] = useSearchParams();
  const isVerifiedSuccess = searchParams.get('verified') === 'true';
  const isRegisteredSuccess = searchParams.get('registered') === 'true';

  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsUnverified(false);
    setResendStatus('idle');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.unverified) {
          setIsUnverified(true);
        }
        throw new Error(data.message || 'An error occurred during login');
      }

      login(data.user);
      navigate('/account');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async (targetEmail?: string) => {
    const emailToSend = (targetEmail || resendEmail || email).trim();
    if (!emailToSend) {
      setResendStatus('error');
      setResendMessage('Please enter your email address.');
      return;
    }

    setResendStatus('loading');
    setResendMessage('');

    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailToSend }),
      });

      const data = await response.json();
      if (response.ok) {
        setResendStatus('sent');
        setResendMessage(data.message || 'A new verification link has been sent to your email.');
      } else {
        setResendStatus('error');
        setResendMessage(data.message || 'Failed to resend verification email.');
      }
    } catch {
      setResendStatus('error');
      setResendMessage('Network error. Please try again.');
    }
  };

  return (
    <div className="min-h-[60vh] flex items-start justify-center px-4 pt-2 md:pt-4">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-xl border border-gray-100 mt-2 md:mt-4">
        <div>
          <h2 style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }} className="text-center text-3xl md:text-4xl tracking-[0.15em] text-[#1a1a1a] uppercase font-light">
            Sign In
          </h2>
          <div className="mt-4 flex items-center justify-center gap-2 text-[10px] md:text-xs uppercase tracking-[0.2em] text-gray-500">
            <span>or</span>
            <Link to="/register" className="font-medium text-[#1a1a1a] hover:text-gray-500 transition-colors pb-0.5 border-b border-[#1a1a1a] hover:border-gray-500">
              create a new account
            </Link>
          </div>
        </div>

        {/* Verified Success Alert */}
        {isVerifiedSuccess && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl flex items-start space-x-3 text-sm">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <strong className="block font-medium">Account Verified!</strong>
              <span>Your email address has been successfully confirmed. You can now sign in.</span>
            </div>
          </div>
        )}

        {/* Registered Success Alert */}
        {isRegisteredSuccess && !isVerifiedSuccess && (
          <div className="bg-amber-50 border border-amber-200 text-amber-900 p-4 rounded-xl flex items-start space-x-3 text-sm">
            <Mail className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <strong className="block font-medium">Please check your inbox</strong>
              <span>We've sent an activation link to your email. Please verify your email before signing in.</span>
            </div>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl space-y-2 text-sm">
            <div className="flex items-start space-x-2">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
            
            {/* Quick Resend button when unverified */}
            {isUnverified && (
              <div className="pt-2 border-t border-red-200/60 mt-2">
                {resendStatus === 'sent' ? (
                  <p className="text-emerald-700 font-medium text-xs flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" /> {resendMessage}
                  </p>
                ) : (
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => handleResendVerification(email)}
                      disabled={resendStatus === 'loading'}
                      className="text-xs text-[#8C6D4F] hover:text-[#1a1a1a] font-semibold underline flex items-center gap-1.5 transition-colors"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${resendStatus === 'loading' ? 'animate-spin' : ''}`} />
                      {resendStatus === 'loading' ? 'Sending...' : 'Resend verification email'}
                    </button>
                    {resendStatus === 'error' && (
                      <span className="text-[11px] text-red-600">{resendMessage}</span>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md space-y-4">
            <div>
              <label htmlFor="email-address" className="block text-[10px] uppercase tracking-[0.3em] text-gray-400 font-medium mb-2">Email Address</label>
              <div className="flex items-center border-b border-gray-200 focus-within:border-[#1a1a1a] transition-colors duration-300 py-3">
                <Mail className="h-5 w-5 text-gray-400 stroke-[1.5] mr-4" />
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="w-full bg-transparent text-[15px] text-[#1a1a1a] placeholder-gray-300 font-light tracking-wide focus:outline-none"
                  placeholder="jane@example.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (!resendEmail) setResendEmail(e.target.value);
                  }}
                />
              </div>
            </div>
            <div>
              <label htmlFor="password" className="block text-[10px] uppercase tracking-[0.3em] text-gray-400 font-medium mb-2">Password</label>
              <div className="flex items-center border-b border-gray-200 focus-within:border-[#1a1a1a] transition-colors duration-300 py-3">
                <Lock className="h-5 w-5 text-gray-400 stroke-[1.5] mr-4" />
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="w-full bg-transparent text-[15px] text-[#1a1a1a] placeholder-gray-300 font-light tracking-wide focus:outline-none"
                  placeholder="Your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="mt-6 w-full flex justify-center items-center gap-3 bg-[#1a1a1a] text-white text-[12px] uppercase tracking-[0.45em] py-5 px-14 hover:bg-gray-800 transition-colors duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </div>

          {/* Standalone Resend Verification Option */}
          <div className="pt-2 text-center border-t border-gray-100">
            <button
              type="button"
              onClick={() => {
                setShowResendModal(!showResendModal);
                setResendStatus('idle');
                setResendMessage('');
                if (email && !resendEmail) setResendEmail(email);
              }}
              className="text-[11px] uppercase tracking-[0.2em] text-[#8C6D4F] hover:text-[#1a1a1a] transition-colors"
            >
              {showResendModal ? 'Hide resend options' : "Didn't receive verification email? Resend"}
            </button>

            {showResendModal && (
              <div className="mt-4 p-4 bg-[#FAF7F5] border border-[#EDE6DF] rounded-xl text-left space-y-3">
                <span className="block text-[11px] text-[#1a1a1a] font-medium tracking-wide">
                  Enter your email address to receive a new activation link:
                </span>
                <div className="flex gap-2">
                  <input
                    type="email"
                    placeholder="your@email.com"
                    value={resendEmail}
                    onChange={(e) => setResendEmail(e.target.value)}
                    className="flex-1 bg-white border border-gray-200 px-3 py-2 text-xs text-[#1a1a1a] rounded outline-none focus:border-[#1a1a1a]"
                  />
                  <button
                    type="button"
                    onClick={() => handleResendVerification()}
                    disabled={resendStatus === 'loading'}
                    className="bg-[#1a1a1a] text-white text-[10px] uppercase tracking-widest px-3 py-2 rounded hover:bg-gray-800 transition-colors disabled:opacity-50"
                  >
                    {resendStatus === 'loading' ? 'Sending...' : 'Resend'}
                  </button>
                </div>
                {resendStatus === 'sent' && (
                  <p className="text-emerald-700 text-xs flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> {resendMessage}
                  </p>
                )}
                {resendStatus === 'error' && (
                  <p className="text-red-600 text-xs flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {resendMessage}
                  </p>
                )}
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
