import React, { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Lock, AlertCircle, CheckCircle2, KeyRound } from 'lucide-react';

const ResetPasswordPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!token) {
      setError('Missing or invalid password reset token. Please request a new link.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to reset password');
      }

      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[60vh] flex items-start justify-center px-4 pt-2 md:pt-4">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-xl border border-gray-100 mt-2 md:mt-4">
        <div className="text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-[#FAF7F5] border border-[#C1A98F] flex items-center justify-center mb-4">
            <KeyRound className="w-6 h-6 text-[#8C6D4F]" />
          </div>
          <h2 style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }} className="text-3xl md:text-4xl tracking-[0.15em] text-[#1a1a1a] uppercase font-light">
            Reset Password
          </h2>
          <p className="mt-2 text-xs uppercase tracking-[0.2em] text-gray-500">
            Create a new password for your account
          </p>
        </div>

        {success ? (
          <div className="space-y-6">
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-5 rounded-xl flex items-start space-x-3 text-sm">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-medium mb-1">Password Changed Successfully!</strong>
                <span>Your password has been updated. You can now sign in with your new credentials.</span>
              </div>
            </div>

            <Link
              to="/login"
              className="w-full flex justify-center items-center bg-[#1a1a1a] text-white text-[12px] uppercase tracking-[0.45em] py-4 px-8 hover:bg-gray-800 transition-colors duration-200 font-medium rounded"
            >
              Sign In
            </Link>
          </div>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            {!token && (
              <div className="bg-amber-50 border border-amber-200 text-amber-900 p-4 rounded-xl flex items-start space-x-3 text-sm">
                <AlertCircle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-medium">Missing Token</strong>
                  <span>No reset token detected in the URL. Please click the link directly from your email.</span>
                </div>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex items-start space-x-3 text-sm">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label htmlFor="new-password" className="block text-[10px] uppercase tracking-[0.3em] text-gray-400 font-medium mb-2">New Password</label>
                <div className="flex items-center border-b border-gray-200 focus-within:border-[#1a1a1a] transition-colors duration-300 py-3">
                  <Lock className="h-5 w-5 text-gray-400 stroke-[1.5] mr-4" />
                  <input
                    id="new-password"
                    name="new-password"
                    type="password"
                    required
                    className="w-full bg-transparent text-[15px] text-[#1a1a1a] placeholder-gray-300 font-light tracking-wide focus:outline-none"
                    placeholder="At least 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="confirm-password" className="block text-[10px] uppercase tracking-[0.3em] text-gray-400 font-medium mb-2">Confirm Password</label>
                <div className="flex items-center border-b border-gray-200 focus-within:border-[#1a1a1a] transition-colors duration-300 py-3">
                  <Lock className="h-5 w-5 text-gray-400 stroke-[1.5] mr-4" />
                  <input
                    id="confirm-password"
                    name="confirm-password"
                    type="password"
                    required
                    className="w-full bg-transparent text-[15px] text-[#1a1a1a] placeholder-gray-300 font-light tracking-wide focus:outline-none"
                    placeholder="Repeat new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading || !token}
                className="mt-6 w-full flex justify-center items-center gap-3 bg-[#1a1a1a] text-white text-[12px] uppercase tracking-[0.45em] py-4 px-10 hover:bg-gray-800 transition-colors duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed rounded"
              >
                {loading ? 'Updating...' : 'Update Password'}
              </button>
            </div>

            <div className="pt-2 text-center border-t border-gray-100">
              <Link
                to="/login"
                className="text-[11px] uppercase tracking-[0.2em] text-[#8C6D4F] hover:text-[#1a1a1a] transition-colors"
              >
                Back to Sign In
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResetPasswordPage;
