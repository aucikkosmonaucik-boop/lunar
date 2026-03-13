import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Mail, Lock, AlertCircle } from 'lucide-react';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
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
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-lg flex items-center space-x-2 text-sm">
              <AlertCircle className="w-5 h-5" />
              <span>{error}</span>
            </div>
          )}
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
                  onChange={(e) => setEmail(e.target.value)}
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
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
